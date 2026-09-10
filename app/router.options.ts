import type { RouterConfig } from '@nuxt/schema'
import { START_LOCATION } from 'vue-router'
import { unlocalizedPath } from '~~/shared/seo/routes'

export default {
  scrollBehavior(to, from, savedPosition) {
    const nuxtApp = useNuxtApp()
    const router = useRouter()
    const samePath = to.path.replace(/\/$/, '') === from.path.replace(/\/$/, '')

    const position = () => {
      if (savedPosition) return savedPosition
      const path = unlocalizedPath(to.path)
      // On code pages, the fragment is secret data, never a DOM selector.
      if (path === '/2fa' || path.startsWith('/2fa/')) return samePath ? false : { left: 0, top: 0 }
      if (to.hash) {
        let id: string
        try {
          id = decodeURIComponent(to.hash.slice(1))
        } catch {
          return false
        }
        const element = document.getElementById(id)
        if (!element) return false
        const margin = Number.parseFloat(getComputedStyle(element).scrollMarginTop) || 0
        const padding =
          Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
        return { el: element, top: margin + padding }
      }
      return samePath && !from.hash ? false : { left: 0, top: 0 }
    }

    const scrollToTop = to.meta.scrollToTop
    if (
      !samePath &&
      (typeof scrollToTop === 'function' ? scrollToTop(to, from) : scrollToTop) === false
    )
      return false
    if (samePath || from === START_LOCATION) return position()
    return new Promise((resolve) => {
      nuxtApp.hooks.hookOnce('page:loading:end', () => {
        requestAnimationFrame(() => {
          resolve(router.currentRoute.value.fullPath === to.fullPath ? position() : false)
        })
      })
    })
  }
} satisfies RouterConfig
