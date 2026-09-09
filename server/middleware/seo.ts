import { isPrivatePage, siteUrl } from '../../shared/seo/routes'

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  if (isPrivatePage(url.pathname)) {
    setHeader(event, 'X-Robots-Tag', 'noindex, nofollow, noarchive')
    setHeader(event, 'Cache-Control', 'no-store')
    setHeader(event, 'Referrer-Policy', 'no-referrer')
    return
  }
  // Worker preview domains must not compete with the canonical production site.
  if (url.hostname !== new URL(siteUrl).hostname)
    setHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
  if (
    url.pathname.length > 1 &&
    /\/$/.test(url.pathname) &&
    !url.pathname.startsWith('/_') &&
    !url.pathname.startsWith('//')
  ) {
    return sendRedirect(event, url.pathname.replace(/\/+$/, '') + url.search, 301)
  }
})
