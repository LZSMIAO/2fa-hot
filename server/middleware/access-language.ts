import { accessLanguage, accessLanguagePath } from '../../shared/access-language'

export default defineEventHandler((event) => {
  if (event.method !== 'GET' && event.method !== 'HEAD') return
  const url = getRequestURL(event)
  const locale = accessLanguage(
    getCookie(event, '2fa-hot-language'),
    getHeader(event, 'accept-language') || ''
  )
  const target = accessLanguagePath(url.pathname, locale)
  if (!target) return
  setHeader(event, 'Cache-Control', 'private, no-store')
  setHeader(event, 'Vary', 'Accept-Language, Cookie')
  setHeader(event, 'Referrer-Policy', 'no-referrer')
  setHeader(event, 'X-Robots-Tag', 'noindex, nofollow, noarchive')
  if (target !== url.pathname) return sendRedirect(event, target + url.search, 302)
})
