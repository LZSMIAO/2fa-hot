import { sourceKeys } from '~~/shared/message-keys'

type Parameters = Record<string, string | number>
const marker = '\u001ei18n:'

/** Store deferred messages as text so existing error boundaries stay framework-independent. */
export function message(source: string, params: Parameters = {}) {
  return marker + JSON.stringify({ source, params })
}

export function useMessages() {
  const { t, locale } = useI18n()
  function tx(value: unknown, params: Parameters = {}): string {
    if (value == null) return ''
    const text = String(value)
    if (text.startsWith(marker)) {
      try {
        const deferred = JSON.parse(text.slice(marker.length))
        return tx(
          deferred.source,
          Object.fromEntries(
            Object.entries(deferred.params).map(([key, value]) => [
              key,
              typeof value === 'number' ? value : tx(value)
            ])
          )
        )
      } catch {
        return t(sourceKeys.get('无法完成操作，请重试。')!)
      }
    }
    const key = sourceKeys.get(text)
    return key ? t(key, params) : text
  }
  return { tx, locale, message }
}
