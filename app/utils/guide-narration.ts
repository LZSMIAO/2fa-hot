export function narrationLanguage(locale: string): string | undefined {
  if (locale === 'en') return 'en-US'
  if (locale === 'zh-CN' || locale === 'zh-TW') return locale
  return undefined
}

export function narrationText(text: string): string {
  return text.replace(/2fa/gi, 'Two F-A')
}

export function narrationSegments(text: string, language: string) {
  return narrationText(text)
    .split(/(Two F-A)/g)
    .filter(Boolean)
    .flatMap((part) =>
      (part.match(/[^。！？.!?]+[。！？.!?]?/g) || []).flatMap((sentence) =>
        (sentence.match(/.{1,140}/gu) || []).map((value) => ({
          text: part === 'Two F-A' ? 'Two, eff, ay' : value,
          language
        }))
      )
    )
}
