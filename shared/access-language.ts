import { supportedLocales } from './locales.ts'

export function accessLanguage(cookie: string | undefined, header: string) {
  const saved = supportedLocales.find((locale) => locale.code === cookie)
  if (saved) return saved.code
  const preferences = header
    .split(',')
    .map((entry) => {
      const [tag = '', ...parameters] = entry.trim().split(';')
      const quality = parameters.find((part) => part.trim().startsWith('q='))
      return { tag: tag.toLowerCase(), q: quality ? Number(quality.trim().slice(2)) : 1 }
    })
    .filter(({ q }) => Number.isFinite(q) && q > 0 && q <= 1)
    .sort((a, b) => b.q - a.q)
  for (const { tag } of preferences) {
    const exact = supportedLocales.find((locale) => locale.code.toLowerCase() === tag)
    if (exact) return exact.code
    if (tag === 'zh' || tag.startsWith('zh-'))
      return /(?:hant|tw|hk|mo)/.test(tag) ? 'zh-TW' : 'zh-CN'
    const base = supportedLocales.find((locale) => locale.code.split('-')[0] === tag.split('-')[0])
    if (base) return base.code
  }
  return 'en'
}

export function accessLanguagePath(path: string, locale: string) {
  const parts = path.split('/')
  if (supportedLocales.some((item) => item.code === parts[1])) parts.splice(1, 1)
  if (parts[1] !== '2fa') return undefined
  const base = parts.join('/')
  return locale === 'en' ? base : `/${locale}${base}`
}
