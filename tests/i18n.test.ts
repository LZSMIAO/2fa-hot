import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { supportedLocales } from '../shared/locales.ts'
import { sourceKeys } from '../shared/message-keys.ts'

const readLocale = (code: string): Record<string, string> =>
  JSON.parse(readFileSync(new URL(`../i18n/locales/${code}.json`, import.meta.url), 'utf8'))
const source = readLocale('zh-CN')
const english = readLocale('en')
const parameters = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()

test('every supported language has complete messages and matching interpolation parameters', () => {
  assert.equal(supportedLocales.length, 30)
  assert.equal(new Set(supportedLocales.map((locale) => locale.code)).size, 30)
  for (const { code } of supportedLocales) {
    const messages = readLocale(code)
    assert.deepEqual(Object.keys(messages).sort(), Object.keys(source).sort(), code)
    for (const [key, value] of Object.entries(messages)) {
      assert.equal(typeof value, 'string', `${code}: ${key}`)
      assert.ok(value.trim(), `${code}: empty ${key}`)
      assert.deepEqual(parameters(value), parameters(source[key]!), `${code}: ${key}`)
      // Catch source copies and prefixed English placeholders, while allowing shared technical terms.
      if (!['zh-CN', 'zh-TW', 'ja'].includes(code)) {
        assert.doesNotMatch(value, /[\u3400-\u9fff]/u, `${code}: untranslated Chinese at ${key}`)
      }
      if (code !== 'en' && english[key]!.length > 45) {
        assert.ok(!value.includes(english[key]!), `${code}: English placeholder at ${key}`)
      }
    }
  }
})

test('source message lookup is synchronized with the translation catalog', () => {
  assert.equal(sourceKeys.size, Object.keys(source).length)
  for (const [key, value] of Object.entries(source)) assert.equal(sourceKeys.get(value), key)
})

test('right-to-left languages declare their writing direction', () => {
  assert.deepEqual(
    supportedLocales
      .filter((locale) => locale.dir === 'rtl')
      .map((locale) => locale.code)
      .sort(),
    ['ar', 'fa', 'he', 'ur']
  )
})
