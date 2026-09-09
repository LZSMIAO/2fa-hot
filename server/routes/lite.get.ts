import html from '../templates/lite'

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
    "default-src 'none'; script-src 'self'; style-src 'self'; img-src data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
  )
  return html
})
