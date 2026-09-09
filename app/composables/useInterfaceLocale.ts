import { en } from '@nuxt/ui/locale'
import { supportedLocales } from '~~/shared/locales'

export function useInterfaceLocale() {
  const { tx, locale } = useMessages()
  const current = computed(
    () => supportedLocales.find((item) => item.code === locale.value) || supportedLocales[2]
  )
  const uiLocale = computed(() => ({
    ...en,
    code: current.value.language,
    name: current.value.name,
    dir: current.value.dir,
    messages: {
      ...en.messages,
      modal: { close: tx('关闭') },
      toast: { close: tx('关闭') },
      alert: { close: tx('关闭') },
      dropdownMenu: { noMatch: tx('没有结果'), search: tx('搜索…') }
    }
  }))
  useHead(() => ({ htmlAttrs: { lang: current.value.language, dir: current.value.dir } }))
  return uiLocale
}
