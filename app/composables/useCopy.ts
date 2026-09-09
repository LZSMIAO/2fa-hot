export function useCopy() {
  const copied = shallowRef(false),
    message = shallowRef('')
  let timer: ReturnType<typeof setTimeout> | undefined
  async function copy(text: string) {
    copied.value = false
    message.value = ''
    try {
      await navigator.clipboard.writeText(text)
      copied.value = true
      clearTimeout(timer)
      timer = setTimeout(() => {
        copied.value = false
      }, 1600)
      return true
    } catch {
      message.value = '无法自动复制，请选中内容手动复制。'
      return false
    }
  }
  onBeforeUnmount(() => clearTimeout(timer))
  return { copied, message, copy }
}
