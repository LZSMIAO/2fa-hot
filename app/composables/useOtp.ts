import { generateOtp, remainingSeconds, type OtpConfig } from '~/utils/otp'
export function useOtp(config: Ref<OtpConfig | null>) {
  const code = shallowRef(''),
    error = shallowRef(''),
    now = shallowRef(0),
    busy = shallowRef(false)
  const remaining = computed(() =>
    config.value ? remainingSeconds(config.value.period, now.value) : 0
  )
  const progress = computed(() =>
    config.value ? (remaining.value / config.value.period) * 100 : 0
  )
  let generation = 0,
    timer: ReturnType<typeof setInterval> | undefined,
    active = true
  async function update() {
    now.value = Date.now()
    const c = config.value,
      id = ++generation
    if (!c) {
      code.value = ''
      error.value = ''
      busy.value = false
      return
    }
    busy.value = true
    try {
      const result = await generateOtp(c, now.value)
      if (id === generation && active) {
        code.value = result
        error.value = ''
      }
    } catch (e) {
      if (id === generation && active) {
        code.value = ''
        error.value = (e as Error).message
      }
    } finally {
      if (id === generation) busy.value = false
    }
  }
  watch(
    config,
    () => {
      code.value = ''
      if (import.meta.client) update()
    },
    { flush: 'sync' }
  )
  function tick() {
    const old = now.value
    now.value = Date.now()
    const c = config.value
    if (c && Math.floor(old / 1000 / c.period) !== Math.floor(now.value / 1000 / c.period)) update()
  }
  onMounted(() => {
    update()
    timer = setInterval(tick, 250)
    document.addEventListener('visibilitychange', update)
  })
  onBeforeUnmount(() => {
    active = false
    generation++
    clearInterval(timer)
    document.removeEventListener('visibilitychange', update)
  })
  async function current() {
    const c = config.value,
      id = generation
    if (!c) throw new Error('请先输入有效密钥。')
    const result = await generateOtp(c, Date.now())
    if (!active || id !== generation || config.value !== c)
      throw new Error('输入已变化，请重新复制。')
    code.value = result
    return result
  }
  return { code, error, remaining, progress, busy, current }
}
