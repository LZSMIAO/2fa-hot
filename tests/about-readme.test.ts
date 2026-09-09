import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseAboutReadme, inlineTokens } from '../app/utils/about-readme.ts'

test('all three README files provide live website content without repository chrome', () => {
  for (const name of ['README.md', 'docs/readme/README.zh-CN.md', 'docs/readme/README.en.md']) {
    const source = readFileSync(name, 'utf8')
    const result = parseAboutReadme(source)
    assert.equal(result.sections.length, 5)
    assert.ok(result.introduction[0]?.includes('Minecraft'))
    const spoilers = result.sections
      .flatMap((section) => section.blocks)
      .filter((block) => block.spoiler)
    assert.equal(spoilers.length, 1)
    assert.ok(
      spoilers[0]!.spoiler!.text.includes(':P') ||
        spoilers[0]!.spoiler!.text.includes(':P'.toLowerCase())
    )
    assert.ok(!JSON.stringify(result).includes('img.shields.io'))
    assert.ok(JSON.stringify(result).includes('vibe coding'))
    assert.ok(
      JSON.stringify(parseAboutReadme(source.replace('vibe coding', 'SYNC_TEST'))).includes(
        'SYNC_TEST'
      )
    )
  }
})
test('inline formatting preserves safe links, never renders arbitrary HTML', () => {
  assert.equal(inlineTokens('[Privacy](https://2fa.hot/privacy)')[0]?.kind, 'link')
  assert.equal(inlineTokens('[bad](javascript:alert)')[0]?.kind, 'text')
  assert.equal(inlineTokens('<script>bad</script>')[0]?.kind, 'text')
  assert.equal(inlineTokens('**2FA®**')[0]?.kind, 'strong')
})
