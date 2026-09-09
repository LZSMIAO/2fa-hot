import { test } from 'node:test'
import assert from 'node:assert/strict'
import { generateOtp, parseOtp } from '../app/utils/otp.ts'

const SHARED_SECRET = 'cnOgv/KdpLoP6Nbh0GMkXkPXALQ='

test('Steam shared_secret generates the known five-character code', async () => {
  const config = parseOtp(SHARED_SECRET, { kind: 'steam' })
  assert.equal(config.kind, 'steam')
  assert.equal(config.digits, 5)
  assert.equal(config.period, 30)
  assert.equal(await generateOtp(config, 1449690657000), 'DTGHN')
})

test('Steam maFile JSON is recognized without accepting account passwords', async () => {
  const config = parseOtp(
    JSON.stringify({
      account_name: 'demo-account',
      shared_secret: SHARED_SECRET,
      password: 'must-not-be-used'
    })
  )
  assert.equal(config.kind, 'steam')
  assert.equal(config.label, 'demo-account')
  assert.equal(config.issuer, 'Steam')
  assert.equal(await generateOtp(config, 1449690657000), 'DTGHN')
})

test('Steam configuration survives vault-style validation', () => {
  const config = parseOtp(SHARED_SECRET, { kind: 'steam', label: 'demo' })
  const restored = parseOtp(config.secret, { kind: 'steam', label: config.label })
  assert.deepEqual(restored, config)
})
