import assert from 'node:assert/strict'
import test from 'node:test'
import {
  narrationLanguage,
  narrationText,
  narrationSegments
} from '../app/utils/guide-narration.ts'

test('only English and the two specified Chinese locales enable narration', () => {
  assert.equal(narrationLanguage('en'), 'en-US')
  assert.equal(narrationLanguage('zh-CN'), 'zh-CN')
  assert.equal(narrationLanguage('zh-TW'), 'zh-TW')
  assert.equal(narrationLanguage('ja'), undefined)
  assert.equal(narrationLanguage('zh-HK'), undefined)
})
test('2FA is spelled separately in narration, including Chinese prose and the site name', () => {
  assert.equal(
    narrationText('用2FA取码，打开2fa.hot，2Fa'),
    '用Two F-A取码，打开Two F-A.hot，Two F-A'
  )
})
test('the brand uses phonetic English spelling without changing the Chinese voice', () => {
  for (const language of ['zh-CN', 'zh-TW']) {
    const segments = narrationSegments('使用2FA取得验证码。', language)
    assert.deepEqual(
      segments.map((part) => part.language),
      [language, language, language]
    )
    assert.equal(segments[1]?.text, 'Two, eff, ay')
  }
})
