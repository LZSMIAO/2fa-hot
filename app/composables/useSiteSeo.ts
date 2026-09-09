import { toolDescriptions, toolHeadings } from '~~/shared/seo/copy'
import { guideMetadata } from '~~/shared/seo/guide-meta'
import {
  isPrivatePage,
  localizedPath,
  pageLocales,
  serializeJsonLd,
  siteUrl,
  unlocalizedPath
} from '~~/shared/seo/routes'
import type { SupportedLocale } from '~~/shared/locales'

export function useSiteSeo() {
  const route = useRoute()
  const { tx, locale } = useMessages()
  useHead(() => {
    const path = unlocalizedPath(route.path)
    const language = locale.value as SupportedLocale
    const chinese = language === 'zh-CN'
    const privatePage = isPrivatePage(path)
    const locales = pageLocales(path)
    const indexable = !privatePage && locales.includes(language)
    const canonical = siteUrl + localizedPath(path, language)
    const article = Object.values(guideMetadata[chinese ? 'zh-CN' : 'en']).find(
      (item) => path === `/guides/${item.slug}`
    )
    const guideTitle = chinese ? '2FA 与 TOTP 使用指南' : '2FA & TOTP guides'
    let title = `2fa.hot — ${toolHeadings[language] || toolHeadings.en}`
    let description = toolDescriptions[language] || toolDescriptions.en
    if (path === '/help') {
      title = `${tx('使用说明')} · 2FA & TOTP | 2fa.hot`
      description =
        tx('输入格式、验证参数，以及常见问题。') +
        ' ' +
        tx('确保算法、位数、更新周期与原服务一致。默认 SHA-1、6 位、30 秒。')
    } else if (path === '/privacy') {
      title = tx('隐私说明 — 2fa.hot')
      description =
        tx('密钥如何计算、保存和传递。') + ' ' + tx('记录保存在当前浏览器，可选择密码保护。')
    } else if (path === '/about') {
      title = `${tx('关于')} 2fa.hot · ${chinese ? '2FA 多功能工具' : 'Multifunctional 2FA tool'}`
      description = chinese
        ? '了解 2FA Hot（2fa.hot）：Minecraft 风格的 2FA / TOTP 多功能工具，在浏览器内取码，支持批量生成、二维码导入与可选本地历史。查看项目介绍、设计来源和联系方式。'
        : 'Meet 2FA Hot (2fa.hot), a Minecraft-inspired multifunctional 2FA and TOTP tool with batch codes, QR import and optional local history. Explore its project information, design origins and contact details.'
    } else if (path === '/guides') {
      title = `${guideTitle} | 2fa.hot`
      description = chinese
        ? '了解双重验证与 TOTP，排查无效验证码，学习导入 Google Authenticator 二维码。'
        : 'Learn how two-factor authentication and TOTP work, troubleshoot invalid codes and import Google Authenticator QR exports.'
    } else if (article) {
      title = `${article.title} | 2fa.hot`
      description = article.description
    } else if (privatePage) {
      title = tx(path === '/history' ? '本地历史 — 2fa.hot' : '获取验证码 — 2fa.hot')
      description = tx('密钥如何计算、保存和传递。')
    }
    const image = `${siteUrl}/og-image.png`
    const graph: Record<string, unknown>[] = []
    if (indexable) {
      graph.push({
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: `${siteUrl}/`,
        name: '2fa.hot',
        alternateName: '2FA hot'
      })
      graph.push({
        '@type':
          path === '/about' ? 'AboutPage' : path === '/guides' ? 'CollectionPage' : 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: title,
        description,
        inLanguage: language,
        isPartOf: { '@id': `${siteUrl}/#website` }
      })
      if (path === '/')
        graph.push({
          '@type': 'WebApplication',
          '@id': `${canonical}#app`,
          name: '2fa.hot',
          url: canonical,
          description,
          applicationCategory: 'SecurityApplication',
          operatingSystem: 'Any',
          browserRequirements: 'Requires JavaScript and a browser with Web Crypto support.',
          inLanguage: language,
          isAccessibleForFree: true,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          featureList: [
            'TOTP: SHA-1, SHA-256, SHA-512; 6 or 8 digits',
            'Batch generation: up to 100 entries',
            'QR import',
            'Google Authenticator migration import',
            'Optional local history'
          ],
          license: 'https://opensource.org/license/mit',
          image
        })
      if (path !== '/') {
        const crumbs = [{ name: '2fa.hot', item: siteUrl + localizedPath('/', language) }]
        if (article)
          crumbs.push({ name: guideTitle, item: siteUrl + localizedPath('/guides', language) })
        crumbs.push({ name: article?.title || title.split(' | ')[0]!, item: canonical })
        graph.push({
          '@type': 'BreadcrumbList',
          itemListElement: crumbs.map((crumb, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            ...crumb
          }))
        })
      }
      if (article)
        graph.push({
          '@type': 'Article',
          '@id': `${canonical}#article`,
          headline: article.title,
          description,
          inLanguage: language,
          mainEntityOfPage: { '@id': `${canonical}#webpage` },
          author: { '@type': 'Organization', name: '2fa.hot', url: `${siteUrl}/about` },
          publisher: { '@type': 'Organization', name: '2fa.hot', url: `${siteUrl}/about` },
          image,
          citation: article.sources.map((source) => source.url)
        })
    }
    return {
      title,
      meta: [
        { name: 'description', content: description },
        {
          name: 'robots',
          content: indexable
            ? 'index, follow, max-image-preview:large'
            : 'noindex, nofollow, noarchive'
        },
        // Never expose secret-bearing route URLs in social metadata or structured data.
        ...(indexable
          ? [
              { property: 'og:type', content: article ? 'article' : 'website' },
              { property: 'og:site_name', content: '2fa.hot' },
              { property: 'og:title', content: title },
              { property: 'og:description', content: description },
              { property: 'og:url', content: canonical },
              {
                property: 'og:locale',
                content: `${new Intl.Locale(language).language}_${new Intl.Locale(language).maximize().region}`
              },
              { property: 'og:image', content: image },
              { property: 'og:image:width', content: '1200' },
              { property: 'og:image:height', content: '630' },
              { property: 'og:image:alt', content: '2fa.hot — 2FA & TOTP code generator' },
              { name: 'twitter:card', content: 'summary_large_image' },
              { name: 'twitter:title', content: title },
              { name: 'twitter:description', content: description },
              { name: 'twitter:image', content: image },
              { name: 'twitter:image:alt', content: '2fa.hot — 2FA & TOTP code generator' }
            ]
          : [])
      ],
      link: indexable
        ? [
            { rel: 'canonical', href: canonical },
            ...locales.map((code) => ({
              rel: 'alternate' as const,
              hreflang: code,
              href: siteUrl + localizedPath(path, code)
            })),
            { rel: 'alternate' as const, hreflang: 'x-default', href: siteUrl + path }
          ]
        : [],
      script: graph.length
        ? [
            {
              key: 'site-schema',
              type: 'application/ld+json',
              innerHTML: serializeJsonLd({ '@context': 'https://schema.org', '@graph': graph })
            }
          ]
        : []
    }
  })
}
