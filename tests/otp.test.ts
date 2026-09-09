import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  generateOtp,
  parseOtp,
  parseBatch,
  normalizeSecret,
  toAccessPath,
  toOtpUri,
  remainingSeconds,
  DEMO_SECRET
} from '../app/utils/otp.ts'
import {
  createEncryptedVault,
  decryptVault,
  encryptVault,
  validateEnvelope
} from '../app/utils/vault-crypto.ts'
function base32(text: string) {
  let buffer = 0,
    bits = 0,
    out = ''
  for (const byte of new TextEncoder().encode(text)) {
    buffer = (buffer << 8) | byte
    bits += 8
    while (bits >= 5) {
      bits -= 5
      out += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[(buffer >>> bits) & 31]
    }
  }
  if (bits) out += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[(buffer << (5 - bits)) & 31]
  return out
}
const vectors = [
  [59, '94287082', '46119246', '90693936'],
  [1111111109, '07081804', '68084774', '25091201'],
  [1111111111, '14050471', '67062674', '99943326'],
  [1234567890, '89005924', '91819424', '93441116'],
  [2000000000, '69279037', '90698825', '38618901'],
  [20000000000, '65353130', '77737706', '47863826']
] as const
for (const [time, ...expected] of vectors)
  test(`RFC 6238 all algorithms at ${time}`, async () => {
    const keys = [
      '12345678901234567890',
      '12345678901234567890123456789012',
      '1234567890123456789012345678901234567890123456789012345678901234'
    ]
    for (const [index, algorithm] of (['SHA-1', 'SHA-256', 'SHA-512'] as const).entries())
      assert.equal(
        await generateOtp(parseOtp(base32(keys[index]!), { algorithm, digits: 8 }), time * 1000),
        expected[index]
      )
  })
test('six digits retain leading zero and use current period', async () => {
  assert.equal(await generateOtp(parseOtp(DEMO_SECRET), 1111111109000), '081804')
  assert.equal(remainingSeconds(30, 60000), 30)
  assert.equal(remainingSeconds(30, 59999), 1)
  assert.notEqual(
    await generateOtp(parseOtp(DEMO_SECRET), 59999),
    await generateOtp(parseOtp(DEMO_SECRET), 60000)
  )
})
test('URI parsing and sharing preserve options', () => {
  const config = parseOtp(
    `otpauth://totp/GitHub%3Awork?secret=${DEMO_SECRET}&issuer=GitHub&algorithm=SHA256&digits=8&period=60`
  )
  assert.equal(config.issuer, 'GitHub')
  assert.equal(config.label, 'work')
  assert.deepEqual(parseOtp(toOtpUri(config)), config)
  assert.equal(toAccessPath(config), `/2fa#${DEMO_SECRET}?algorithm=SHA256&digits=8&period=60`)
  assert.equal(toAccessPath(parseOtp(DEMO_SECRET)), `/2fa#${DEMO_SECRET}`)
})
test('fragment links keep secrets and options out of request URLs and preserve OTP results', async () => {
  for (const prefix of ['', '/zh-TW', '/en']) {
    const config = parseOtp(DEMO_SECRET, { algorithm: 'SHA-256', digits: 8, period: 60 })
    const url = new URL(`https://2fa.hot${prefix}${toAccessPath(config)}`)
    assert.equal(url.search, '')
    assert.ok(!url.pathname.includes(DEMO_SECRET))
    const parsed = parseOtp(url.href)
    assert.deepEqual(parsed, config)
    assert.equal(await generateOtp(parsed, 59000), await generateOtp(config, 59000))
  }
  assert.deepEqual(parseOtp(`https://2fa.hot/2fa/${DEMO_SECRET}`), parseOtp(DEMO_SECRET))
  assert.throws(() => parseOtp(`https://2fa.hot/2fa/${DEMO_SECRET}#${DEMO_SECRET}`))
  assert.throws(() => parseOtp(`https://2fa.hot/2fa?digits=8#${DEMO_SECRET}?digits=6`))
  assert.throws(() => parseOtp('https://2fa.hot/2fa#%ZZ'))
})
test('invalid secrets, options and ambiguous URI rejected', () => {
  for (const value of ['', '123456', 'invalid!', 'A'.repeat(33)])
    assert.throws(() => parseOtp(value))
  assert.throws(() => parseOtp(`otpauth://hotp/x?secret=${DEMO_SECRET}`))
  assert.throws(() => parseOtp(`otpauth://totp/x?secret=${DEMO_SECRET}&digits=6&digits=8`))
  assert.throws(() => parseOtp(`otpauth://totp/x?secret=${DEMO_SECRET}&algorithm=MD5`))
  assert.throws(() => parseOtp(DEMO_SECRET, { period: 0 }))
  assert.equal(
    normalizeSecret(
      DEMO_SECRET.toLowerCase()
        .match(/.{1,4}/g)!
        .join(' ')
    ),
    DEMO_SECRET
  )
})
test('batch isolates invalid rows and marks duplicates', () => {
  const rows = parseBatch(`work\t${DEMO_SECRET}\ninvalid!\n${DEMO_SECRET}`)
  assert.equal(rows[0]!.config!.label, 'work')
  assert.ok(rows[1]!.error)
  assert.equal(rows[2]!.duplicate, true)
  assert.throws(() => parseBatch(Array(101).fill(DEMO_SECRET).join('\n')))
})
test('encrypted backup roundtrip, wrong password and tamper detection', async () => {
  const data = [{ secret: DEMO_SECRET, note: 'private test note' }],
    password = 'test password only 2026'
  const { key, envelope } = await createEncryptedVault(password, data)
  assert.ok(!JSON.stringify(envelope).includes(DEMO_SECRET))
  assert.deepEqual((await decryptVault(envelope, password)).data, data)
  await assert.rejects(decryptVault(envelope, 'wrong password'))
  const changed = { ...envelope, data: envelope.data.slice(0, -4) + 'AAAA' }
  await assert.rejects(decryptVault(changed, password))
  const next = await encryptVault(data, key, envelope.salt)
  assert.notEqual(next.iv, envelope.iv)
  assert.notEqual(next.data, envelope.data)
  assert.throws(() => validateEnvelope({ ...envelope, iterations: 999999999 }))
  assert.throws(() => validateEnvelope({ ...envelope, version: 2 }))
})

test('new vault accepts four characters and rejects shorter passphrases', async () => {
  await assert.rejects(createEncryptedVault('123', []), /至少 4/)
  const { envelope } = await createEncryptedVault('1234', [])
  assert.deepEqual((await decryptVault(envelope, '1234')).data, [])
})
