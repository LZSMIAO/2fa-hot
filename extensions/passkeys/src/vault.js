import { decode, encode, random, utf8 } from './encoding.js'
import { validateRp } from './webauthn.js'
const FORMAT = '2fa.hot/passkeys'
const iterations = 600000
export function checkPassword(password) {
  if (typeof password !== 'string' || password.length < 12 || password.length > 1024)
    throw new Error('请设置至少 12 个字符的主口令。')
}
async function derive(password, salt, rounds) {
  if (typeof password !== 'string' || password.length > 1024) throw new Error('主口令格式不正确。')
  const material = await crypto.subtle.importKey('raw', utf8(password), 'PBKDF2', false, [
    'deriveKey'
  ])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: rounds },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}
export async function seal(records, password) {
  checkPassword(password)
  const salt = random(16),
    iv = random(12)
  const key = await derive(password, salt, iterations)
  const data = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: utf8(`${FORMAT}/1`) },
    key,
    utf8(JSON.stringify(records))
  )
  return {
    format: FORMAT,
    version: 1,
    kdf: 'PBKDF2-SHA256',
    iterations,
    salt: encode(salt),
    iv: encode(iv),
    data: encode(data),
    revision: crypto.randomUUID()
  }
}
export async function unseal(envelope, password) {
  if (
    !envelope ||
    envelope.format !== FORMAT ||
    envelope.version !== 1 ||
    envelope.kdf !== 'PBKDF2-SHA256' ||
    !Number.isInteger(envelope.iterations) ||
    envelope.iterations < 100000 ||
    envelope.iterations > 2000000
  )
    throw new Error('备份格式或版本不支持。')
  const salt = decode(envelope.salt, 16),
    iv = decode(envelope.iv, 12),
    data = decode(envelope.data, 4000000)
  if (salt.length !== 16 || iv.length !== 12 || data.length < 16)
    throw new Error('备份文件不完整。')
  try {
    const key = await derive(password, salt, envelope.iterations)
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv, additionalData: utf8(`${FORMAT}/1`) },
      key,
      data
    )
    return await validateRecords(JSON.parse(new TextDecoder().decode(plain)))
  } catch {
    throw new Error('口令不正确，或备份文件已损坏。')
  }
}
export async function validateRecords(value) {
  if (!Array.isArray(value) || value.length > 1000)
    throw new Error('凭据格式不正确或超过 1000 条。')
  const seen = new Set(),
    output = []
  for (const r of value) {
    if (
      !r ||
      typeof r.rpId !== 'string' ||
      !decode(r.credentialId, 1024).length ||
      !decode(r.userHandle, 64).length ||
      typeof r.userName !== 'string' ||
      r.userName.length > 256 ||
      typeof r.userDisplayName !== 'string' ||
      r.userDisplayName.length > 256 ||
      !Number.isInteger(r.counter) ||
      r.counter < 0 ||
      r.counter > 0xffffffff ||
      typeof r.discoverable !== 'boolean' ||
      typeof r.backupEligible !== 'boolean' ||
      typeof r.backupState !== 'boolean' ||
      (r.backupState && !r.backupEligible)
    )
      throw new Error('凭据字段不完整。')
    validateRp(`https://${r.rpId}`, r.rpId)
    const id = `${r.rpId}:${r.credentialId}`
    if (seen.has(id)) throw new Error('文件包含重复凭据。')
    seen.add(id)
    await crypto.subtle.importKey(
      'pkcs8',
      decode(r.privateKey, 1024),
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    )
    output.push({
      credentialId: r.credentialId,
      rpId: r.rpId,
      userHandle: r.userHandle,
      userName: r.userName,
      userDisplayName: r.userDisplayName,
      privateKey: r.privateKey,
      counter: r.counter,
      discoverable: r.discoverable,
      backupEligible: r.backupEligible,
      backupState: r.backupState,
      createdAt: Number.isFinite(r.createdAt) ? r.createdAt : Date.now(),
      lastUsedAt: Number.isFinite(r.lastUsedAt) ? r.lastUsedAt : null
    })
  }
  return output
}
export function publicRecords(records) {
  return records.map(({ privateKey, ...record }) => record)
}
export function mergeRecords(current, incoming) {
  const next = current.map((r) => ({ ...r }))
  let added = 0,
    duplicates = 0
  for (const r of incoming) {
    const old = next.find((item) => item.rpId === r.rpId && item.credentialId === r.credentialId)
    if (old) {
      if (
        old.privateKey !== r.privateKey ||
        old.userHandle !== r.userHandle ||
        old.backupEligible !== r.backupEligible
      )
        throw new Error('同一凭据包含冲突数据，未导入。')
      old.counter = Math.max(old.counter, r.counter)
      duplicates++
    } else {
      next.push(r)
      added++
    }
  }
  if (next.length > 1000) throw new Error('最多保存 1000 条通行密钥。')
  return { records: next, added, duplicates }
}
