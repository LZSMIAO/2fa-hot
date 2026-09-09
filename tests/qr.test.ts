import { decodeMigration } from '../app/utils/ga-migration.ts'
import { test } from 'node:test'
import assert from 'node:assert/strict'
import QRCode from 'qrcode'
import jsQR from 'jsqr'
import { DEMO_SECRET, parseOtp, toOtpUri } from '../app/utils/otp.ts'
test('generated QR decodes into the original TOTP configuration', () => {
  const config = parseOtp(DEMO_SECRET, {
    algorithm: 'SHA-512',
    digits: 8,
    period: 60,
    label: '工作',
    issuer: 'Demo'
  })
  const uri = toOtpUri(config),
    qr = QRCode.create(uri, { errorCorrectionLevel: 'M' })
  const moduleSize = 6,
    margin = 4,
    size = (qr.modules.size + margin * 2) * moduleSize
  const pixels = new Uint8ClampedArray(size * size * 4).fill(255)
  for (let y = 0; y < qr.modules.size; y++)
    for (let x = 0; x < qr.modules.size; x++)
      if (qr.modules.get(y, x)) {
        for (let dy = 0; dy < moduleSize; dy++)
          for (let dx = 0; dx < moduleSize; dx++) {
            const index =
              (((y + margin) * moduleSize + dy) * size + (x + margin) * moduleSize + dx) * 4
            pixels[index] = 0
            pixels[index + 1] = 0
            pixels[index + 2] = 0
          }
      }
  const result = jsQR(pixels, size, size)
  assert.ok(result)
  assert.deepEqual(parseOtp(result.data), config)
})

test('Google migration QR image decodes into both accounts', () => {
  const uri =
      'otpauth-migration://offline?data=CisKFDEyMzQ1Njc4OTAxMjM0NTY3ODkwEg1FeGFtcGxlOmFsaWNlIAEoATACCikKFDEyMzQ1Njc4OTAxMjM0NTY3ODkwEgtFeGFtcGxlOmJvYiABKAEwAhABGAEgAA%3D%3D',
    qr = QRCode.create(uri, { errorCorrectionLevel: 'M' })
  const moduleSize = 6,
    margin = 4,
    size = (qr.modules.size + margin * 2) * moduleSize
  const pixels = new Uint8ClampedArray(size * size * 4).fill(255)
  for (let y = 0; y < qr.modules.size; y++)
    for (let x = 0; x < qr.modules.size; x++)
      if (qr.modules.get(y, x)) {
        for (let dy = 0; dy < moduleSize; dy++)
          for (let dx = 0; dx < moduleSize; dx++) {
            const index =
              (((y + margin) * moduleSize + dy) * size + (x + margin) * moduleSize + dx) * 4
            pixels[index] = 0
            pixels[index + 1] = 0
            pixels[index + 2] = 0
          }
      }
  const result = jsQR(pixels, size, size)
  assert.ok(result)
  assert.equal(decodeMigration(result.data).accounts.length, 2)
})
