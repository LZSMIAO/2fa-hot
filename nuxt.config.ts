import { supportedLocales } from './shared/locales'
import { siteUrl } from './shared/seo/routes'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-07',
  modules: ['@nuxt/ui', '@nuxtjs/i18n'],
  i18n: {
    strategy: 'prefix_except_default',
    baseUrl: siteUrl,
    defaultLocale: 'en',
    locales: supportedLocales.map((locale) => ({ ...locale, file: `${locale.code}.json` })),
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: '2fa-hot-language',
      redirectOn: 'root',
      fallbackLocale: 'en'
    },
    vueI18n: './i18n.config.ts'
  },
  css: ['~/assets/css/main.css', '~/assets/css/ore.css'],
  devtools: { enabled: false },
  experimental: { viewTransition: true },
  nitro: { cloudflare: { nodeCompat: true } },
  ui: { fonts: false },
  icon: {
    provider: 'server',
    clientBundle: { scan: true },
    serverBundle: { collections: ['lucide'] }
  },
  colorMode: { preference: 'system', fallback: 'light', storageKey: '2fa-hot-theme' },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Free 2FA & TOTP Code Generator | 2fa.hot',
      meta: [
        {
          name: 'description',
          content:
            'Generate 2FA codes from your existing TOTP secret in your browser. Free, with batch codes, QR import and optional local history.'
        }
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]
    }
  },
  routeRules: {
    ...Object.fromEntries(
      supportedLocales.flatMap(({ code }) => {
        const prefix = code === 'en' ? '' : `/${code}`
        return ['/2fa', '/2fa/**', '/history'].map((path) => [
          prefix + path,
          {
            ssr: false,
            headers: {
              'Cache-Control': 'no-store',
              'Referrer-Policy': 'no-referrer',
              'X-Robots-Tag': 'noindex, nofollow, noarchive'
            }
          }
        ])
      })
    ),
    '/**': {
      headers: {
        'Referrer-Policy': 'no-referrer',
        'X-Content-Type-Options': 'nosniff',
        'Permissions-Policy': 'camera=(self), microphone=(), geolocation=()'
      }
    }
  },
  typescript: { strict: true }
})
