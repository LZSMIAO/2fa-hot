import { liteHelp, type LiteLanguage } from '../../templates/lite-help'

// Standalone HTML: no Nuxt hydration, user data, or secret processing on the server.
export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'text/html; charset=utf-8')
  setHeader(event, 'Cache-Control', 'no-store')
  setHeader(event, 'Referrer-Policy', 'no-referrer')
  setHeader(event, 'X-Robots-Tag', 'noindex, nofollow, noarchive')
  setHeader(event, 'X-Frame-Options', 'DENY')
  setHeader(event, 'X-UA-Compatible', 'IE=edge')
  setHeader(
    event,
    'Content-Security-Policy',
    "default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; img-src data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
  )
  const requested = getQuery(event).lang
  const language: LiteLanguage = requested === 'zh-TW' || requested === 'zh-CN' ? requested : 'en'
  return liteHelp(language)
})
