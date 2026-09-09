import { build } from 'esbuild'
import { cp, mkdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
await mkdir(new URL('./dist/', import.meta.url), { recursive: true })
await cp(new URL('./static/', import.meta.url), new URL('./dist/', import.meta.url), {
  recursive: true
})
await mkdir(new URL('./dist/licenses/', import.meta.url), { recursive: true })
await cp(
  new URL('../../LICENSE', import.meta.url),
  new URL('./dist/licenses/2fa-hot-LICENSE', import.meta.url)
)
await cp(
  new URL('./node_modules/tldts/LICENSE', import.meta.url),
  new URL('./dist/licenses/tldts-LICENSE', import.meta.url)
)
const require = createRequire(import.meta.url)
const tldtsRequire = createRequire(require.resolve('tldts/package.json'))
await cp(
  join(dirname(tldtsRequire.resolve('tldts-core/package.json')), 'LICENSE'),
  new URL('./dist/licenses/tldts-core-LICENSE', import.meta.url)
)
await build({
  entryPoints: ['src/background.js', 'src/content.js', 'src/page.js', 'src/ui.js'],
  outdir: 'dist',
  bundle: true,
  format: 'iife',
  target: 'chrome120',
  legalComments: 'eof',
  sourcemap: false
})
