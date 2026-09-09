/** Browser-only decoding of Google Authenticator MigrationPayload (protobuf). */
export interface MigrationAccount {
  secret: string
  name: string
  issuer: string
  algorithm: 'SHA1' | 'SHA256' | 'SHA512' | 'MD5'
  digits: 6 | 8
  type: 'totp' | 'hotp'
  counter: string
  uri: string
}
export interface MigrationPayload {
  accounts: MigrationAccount[]
  version: number
  batchSize: number
  batchIndex: number
  batchId: string
}
const invalid = () => new Error('配置链接格式不正确。')
type Field = { number: number; wire: number; value: bigint | Uint8Array }
function fields(data: Uint8Array): Field[] {
  let pos = 0
  function varint() {
    let value = 0n
    for (let n = 0; n < 10; n++) {
      const byte = data[pos++]
      if (byte === undefined || (n === 9 && byte > 1)) throw invalid()
      value |= BigInt(byte & 127) << BigInt(n * 7)
      if (!(byte & 128)) return value
    }
    throw invalid()
  }
  const result: Field[] = []
  while (pos < data.length) {
    const tag = varint()
    if (tag > 0xffffffffn || tag < 8n) throw invalid()
    const number = Number(tag >> 3n),
      wire = Number(tag & 7n)
    if (wire === 0) result.push({ number, wire, value: varint() })
    else {
      const size = wire === 2 ? Number(varint()) : wire === 1 ? 8 : wire === 5 ? 4 : -1
      if (!Number.isSafeInteger(size) || size < 0 || size > data.length - pos) throw invalid()
      result.push({ number, wire, value: data.subarray(pos, pos + size) })
      pos += size
    }
  }
  return result
}
function unique(list: Field[], number: number, wire: number) {
  const matches = list.filter((f) => f.number === number)
  if (matches.length > 1 || (matches[0] && matches[0].wire !== wire)) throw invalid()
  return matches[0]?.value
}
function numberField(list: Field[], number: number, fallback = 0n) {
  return (unique(list, number, 0) as bigint | undefined) ?? fallback
}
function bytesField(list: Field[], number: number) {
  return (unique(list, number, 2) as Uint8Array | undefined) ?? new Uint8Array()
}
function base32(data: Uint8Array) {
  let buffer = 0,
    bits = 0,
    output = ''
  for (const byte of data) {
    buffer = (buffer << 8) | byte
    bits += 8
    while (bits >= 5) {
      bits -= 5
      output += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[(buffer >>> bits) & 31]
    }
  }
  if (bits) output += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[(buffer << (5 - bits)) & 31]
  return output
}
function account(data: Uint8Array): MigrationAccount {
  const f = fields(data),
    secretBytes = bytesField(f, 1)
  if (!secretBytes.length || secretBytes.length > 640) throw invalid()
  const text = new TextDecoder('utf-8', { fatal: true })
  const name = text.decode(bytesField(f, 2)),
    issuer = text.decode(bytesField(f, 3))
  if (name.length > 1024 || issuer.length > 1024) throw invalid()
  const algorithm = (
    { 0: 'SHA1', 1: 'SHA1', 2: 'SHA256', 3: 'SHA512', 4: 'MD5' } as Record<
      number,
      MigrationAccount['algorithm']
    >
  )[Number(numberField(f, 4))]
  const digits = ({ 0: 6, 1: 6, 2: 8 } as Record<number, MigrationAccount['digits']>)[
    Number(numberField(f, 5))
  ]
  const type = ({ 0: 'totp', 1: 'hotp', 2: 'totp' } as Record<number, MigrationAccount['type']>)[
    Number(numberField(f, 6))
  ]
  if (!algorithm || !digits || !type) throw invalid()
  const counterValue = numberField(f, 7)
  if (counterValue > 0x7fffffffffffffffn) throw invalid()
  const secret = base32(secretBytes),
    counter = counterValue.toString()
  // Google can already include the issuer prefix in name. Do not duplicate it.
  const label =
    issuer && !name.startsWith(`${issuer}:`) ? `${issuer}:${name}` : name || issuer || '2FA'
  const params = new URLSearchParams({ secret, algorithm, digits: String(digits) })
  if (issuer) params.set('issuer', issuer)
  if (type === 'hotp') params.set('counter', counter)
  else params.set('period', '30')
  return {
    secret,
    name,
    issuer,
    algorithm,
    digits,
    type,
    counter,
    uri: `otpauth://${type}/${encodeURIComponent(label)}?${params}`
  }
}
export function isMigrationUri(value: string) {
  return /^otpauth-migration:/i.test(value.trim())
}
export function decodeMigration(value: string): MigrationPayload {
  try {
    if (value.length > 100_000) throw invalid()
    const url = new URL(value.trim())
    if (
      url.protocol !== 'otpauth-migration:' ||
      url.hostname !== 'offline' ||
      url.username ||
      url.password ||
      url.hash ||
      (url.pathname && url.pathname !== '/')
    )
      throw invalid()
    if (url.searchParams.getAll('data').length !== 1) throw invalid()
    // URLSearchParams turns unescaped '+' into spaces; GA payloads use standard base64.
    const data = url.searchParams
      .get('data')!
      .replace(/ /g, '+')
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    if (!data || !/^[A-Za-z0-9+/]*={0,2}$/.test(data)) throw invalid()
    const raw = Uint8Array.from(atob(data), (c) => c.charCodeAt(0)),
      f = fields(raw)
    const records = f.filter((field) => field.number === 1)
    if (!records.length || records.length > 100 || records.some((field) => field.wire !== 2))
      throw invalid()
    const version = Number(numberField(f, 2, 1n)),
      batchSize = Number(numberField(f, 3, 1n)),
      batchIndex = Number(numberField(f, 4)),
      batchId = numberField(f, 5).toString()
    if (
      ![0, 1, 2].includes(version) ||
      !Number.isSafeInteger(batchSize) ||
      batchSize < 1 ||
      batchSize > 100 ||
      !Number.isSafeInteger(batchIndex) ||
      batchIndex < 0 ||
      batchIndex >= batchSize
    )
      throw invalid()
    return {
      accounts: records.map((field) => account(field.value as Uint8Array)),
      version,
      batchSize,
      batchIndex,
      batchId
    }
  } catch {
    throw invalid()
  }
}

export interface MigrationGroup {
  key: string
  received: number
  total: number
  missing: number[]
}
export function migrationAccountKey(account: MigrationAccount) {
  return JSON.stringify([
    account.secret,
    account.name,
    account.issuer,
    account.algorithm,
    account.digits,
    account.type,
    account.counter
  ])
}
function payloadKey(payload: MigrationPayload) {
  return payload.batchSize === 1
    ? JSON.stringify(payload.accounts.map(migrationAccountKey))
    : `${payload.version}:${payload.batchId}`
}
/** Append transactionally: rescans are idempotent, conflicting fragments never overwrite data. */
export function appendMigration(
  current: MigrationPayload[],
  incoming: MigrationPayload
): MigrationPayload[] {
  const key = payloadKey(incoming)
  const group = current.filter((p) => payloadKey(p) === key)
  if (group.some((p) => p.batchSize !== incoming.batchSize))
    throw new Error('同一批二维码的数据不一致，请清空后重新导入。')
  const duplicate = group.find((p) => p.batchIndex === incoming.batchIndex)
  if (duplicate) {
    if (JSON.stringify(duplicate.accounts) !== JSON.stringify(incoming.accounts))
      throw new Error('同一批二维码的数据不一致，请清空后重新导入。')
    return current
  }
  const next = [...current, incoming]
  if (next.length > 100 || next.reduce((total, p) => total + p.accounts.length, 0) > 100)
    throw new Error('每次最多 100 条，请分批处理。')
  return next
}
export function migrationGroups(payloads: MigrationPayload[]): MigrationGroup[] {
  const groups = new Map<string, MigrationPayload[]>()
  for (const payload of payloads) {
    const key = payloadKey(payload)
    groups.set(key, [...(groups.get(key) || []), payload])
  }
  return [...groups].map(([key, group]) => {
    const total = group[0]!.batchSize,
      indices = new Set(group.map((p) => p.batchIndex))
    return {
      key,
      total,
      received: indices.size,
      missing: Array.from({ length: total }, (_, i) => i + 1).filter((i) => !indices.has(i - 1))
    }
  })
}
export function migrationAccounts(payloads: MigrationPayload[]) {
  const unique = new Map<string, MigrationAccount>()
  for (const payload of [...payloads].sort((a, b) => a.batchIndex - b.batchIndex))
    for (const account of payload.accounts) unique.set(migrationAccountKey(account), account)
  return [...unique.values()]
}
