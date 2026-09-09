import assert from 'node:assert/strict'
import test from 'node:test'
import { accessLanguage, accessLanguagePath } from '../shared/access-language.ts'

test('saved preference wins; browser languages respect quality and regional variants', () => {
  assert.equal(accessLanguage('zh-TW', 'en-US'), 'zh-TW')
  assert.equal(accessLanguage(undefined, 'en-US,en;q=0.9'), 'en')
  assert.equal(accessLanguage('invalid', 'zh-HK'), 'zh-TW')
  assert.equal(accessLanguage(undefined, 'zh-Hans-SG'), 'zh-CN')
  assert.equal(accessLanguage(undefined, 'en;q=0.2,ja;q=0.9'), 'ja')
  assert.equal(accessLanguage(undefined, 'zh-TW;q=0,en'), 'en')
  assert.equal(accessLanguage(undefined, 'unknown'), 'en')
})
test('only access routes redirect, preserving the encoded secret and converging', () => {
  assert.equal(accessLanguagePath('/zh-TW/2fa/EXAMPLE%3D', 'en'), '/2fa/EXAMPLE%3D')
  assert.equal(accessLanguagePath('/2fa/EXAMPLE', 'zh-CN'), '/zh-CN/2fa/EXAMPLE')
  assert.equal(accessLanguagePath('/zh-CN/2fa/EXAMPLE', 'zh-CN'), '/zh-CN/2fa/EXAMPLE')
  assert.equal(accessLanguagePath('/zh-TW/guides', 'en'), undefined)
})
