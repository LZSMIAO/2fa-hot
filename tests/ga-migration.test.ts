import { test } from 'node:test'
import assert from 'node:assert/strict'
import { decodeMigration } from '../app/utils/ga-migration.ts'
import { parseOtp, generateOtp, DEMO_SECRET } from '../app/utils/otp.ts'
const bytes = (s: string) => [...new TextEncoder().encode(s)]
function v(value: bigint | number): number[] {
  let n = BigInt(value)
  const out: number[] = []
  do {
    out.push(Number(n & 127n) | (n > 127n ? 128 : 0))
    n >>= 7n
  } while (n)
  return out
}
const n = (field: number, value: bigint | number) => [...v(field * 8), ...v(value)]
const b = (field: number, value: number[]) => [...v(field * 8 + 2), ...v(value.length), ...value]
const makeAccount = (extra: number[] = []) => [
  ...b(1, bytes('12345678901234567890')),
  ...b(2, bytes('Example:alice')),
  ...b(3, bytes('Example')),
  ...extra
]
function url(data: number[]) {
  return `otpauth-migration://offline?data=${encodeURIComponent(Buffer.from(data).toString('base64'))}`
}
test('Google export becomes standard TOTP URI with matching RFC code', async () => {
  const payload = decodeMigration(
    url([...b(1, makeAccount([...n(4, 1), ...n(5, 2), ...n(6, 2)])), ...n(2, 1)])
  )
  assert.equal(payload.accounts[0]!.secret, DEMO_SECRET)
  const config = parseOtp(payload.accounts[0]!.uri)
  assert.equal(config.label, 'alice')
  assert.equal(config.issuer, 'Example')
  assert.equal(await generateOtp(config, 59000), '94287082')
})
test('version 2 exports preserve all three TOTP accounts, including a short secret', () => {
  const records = ['Account A', 'Account B', '工作'].map((name, index) =>
    b(1, [
      ...b(1, bytes(index === 2 ? '1234567890' : '12345678901234567890')),
      ...b(2, bytes(name)),
      ...n(4, 1),
      ...n(5, 1),
      ...n(6, 2)
    ])
  )
  const payload = decodeMigration(url([...records.flat(), ...n(2, 2), ...n(3, 1), ...n(4, 0)]))
  assert.equal(payload.version, 2)
  assert.equal(payload.batchSize, 1)
  assert.equal(payload.batchIndex, 0)
  assert.deepEqual(
    payload.accounts.map((account) => account.name),
    ['Account A', 'Account B', '工作']
  )
  for (const account of payload.accounts) {
    assert.equal(account.type, 'totp')
    assert.equal(parseOtp(account.uri).secret, account.secret)
  }
  assert.throws(() => decodeMigration(url([...records.flat(), ...n(2, 3)])))
})
test('retains multiple accounts, HOTP int64 counter, MD5, and batch metadata', () => {
  const payload = decodeMigration(
    url([
      ...b(1, makeAccount()),
      ...b(1, makeAccount([...n(4, 4), ...n(6, 1), ...n(7, 9007199254740993n)])),
      ...n(2, 1),
      ...n(3, 2),
      ...n(4, 1),
      ...n(5, 123)
    ])
  )
  assert.equal(payload.accounts.length, 2)
  assert.equal(payload.batchIndex, 1)
  assert.equal(payload.batchSize, 2)
  const hotp = payload.accounts[1]!
  assert.equal(hotp.counter, '9007199254740993')
  assert.equal(hotp.algorithm, 'MD5')
  assert.equal(hotp.type, 'hotp')
  assert.match(hotp.uri, /counter=9007199254740993/)
  assert.throws(() => parseOtp(hotp.uri), /HOTP/)
})
test('malformed protobuf and unsupported enum values fail closed', () => {
  for (const data of [
    [10, 40, 1],
    [8, 128],
    [15],
    b(1, makeAccount(n(4, 99))),
    b(1, [...makeAccount(), ...b(1, [1])]),
    [...b(1, makeAccount()), ...n(3, 2), ...n(4, 2)]
  ]) {
    assert.throws(() => decodeMigration(url(data)), /配置链接格式/)
  }
  assert.throws(() => decodeMigration('https://example.com/?data=AAAA'))
  assert.throws(() => decodeMigration(url(b(1, makeAccount())) + '&data=AAAA'))
})
test('unknown fixed-width protobuf fields are skipped; oversized account lists rejected', () => {
  const one = b(1, makeAccount())
  assert.equal(decodeMigration(url([...one, ...v(10 * 8 + 5), 0, 0, 0, 0])).accounts.length, 1)
  assert.throws(() => decodeMigration(url(Array.from({ length: 101 }, () => one).flat())))
})

test('SHA256 and SHA512 enums, unicode labels and URL-safe base64 survive export', () => {
  for (const [id, expected] of [
    [2, 'SHA256'],
    [3, 'SHA512']
  ] as const) {
    const payload = decodeMigration(
      url(b(1, [...b(1, bytes('12345678901234567890')), ...b(2, bytes('工作账户')), ...n(4, id)]))
    )
    assert.equal(payload.accounts[0]!.algorithm, expected)
    assert.equal(parseOtp(payload.accounts[0]!.uri).label, '工作账户')
  }
  const standard = url(b(1, makeAccount()))
  const data = new URL(standard).searchParams
    .get('data')!
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  assert.equal(decodeMigration(`otpauth-migration://offline?data=${data}`).accounts.length, 1)
})

test('multi-QR collection accepts out-of-order pieces and reports missing numbers', async () => {
  const { appendMigration, migrationGroups, migrationAccounts } =
    await import('../app/utils/ga-migration.ts')
  const part = (index: number, name: string) =>
    decodeMigration(
      url([
        ...b(1, [...b(1, bytes('12345678901234567890')), ...b(2, bytes(name))]),
        ...n(2, 1),
        ...n(3, 3),
        ...n(4, index),
        ...n(5, 55)
      ])
    )
  const second = part(1, 'bob')
  let collection = appendMigration([], second)
  assert.deepEqual(migrationGroups(collection)[0]!.missing, [1, 3])
  assert.equal(appendMigration(collection, second), collection)
  collection = appendMigration(collection, part(0, 'alice'))
  assert.deepEqual(migrationGroups(collection)[0]!.missing, [3])
  collection = appendMigration(collection, part(2, 'carol'))
  assert.deepEqual(migrationGroups(collection)[0]!.missing, [])
  assert.deepEqual(
    migrationAccounts(collection).map((a) => a.name),
    ['alice', 'bob', 'carol']
  )
  assert.throws(() => appendMigration(collection, part(1, 'changed')), /数据不一致/)
  assert.equal(migrationAccounts(collection).length, 3)
})
test('independent exports stay separate, identical accounts deduplicate without losing labels', async () => {
  const { appendMigration, migrationGroups, migrationAccounts } =
    await import('../app/utils/ga-migration.ts')
  const first = decodeMigration(url(b(1, makeAccount())))
  const other = decodeMigration(
    url([
      ...b(1, makeAccount()),
      ...b(1, [...b(1, bytes('12345678901234567890')), ...b(2, bytes('other'))])
    ])
  )
  const collection = appendMigration(appendMigration([], first), other)
  assert.equal(migrationGroups(collection).length, 2)
  assert.equal(migrationAccounts(collection).length, 2)
  const partial = { ...first, batchId: '55', batchSize: 2 }
  assert.throws(
    () => appendMigration([partial], { ...partial, batchIndex: 1, batchSize: 3 }),
    /数据不一致/
  )
})
