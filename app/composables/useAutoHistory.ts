import type { OtpConfig } from '~/utils/otp'

/** Save settled, valid input rather than individual keystrokes or copy actions. */
export function useAutoHistory(configs: () => OtpConfig[]) {
  const vault = useVault()
  const error = shallowRef('')
  watch(
    () => JSON.stringify(configs()),
    (_, __, onCleanup) => {
      const values = configs()
      if (!values.length) return
      const version = vault.recentVersion.value
      const timer = setTimeout(() => {
        if (version === vault.recentVersion.value) vault.remember(values)
      }, 800)
      onCleanup(() => clearTimeout(timer))
    },
    { immediate: true }
  )
  watch(
    [() => JSON.stringify(configs()), vault.enabled, vault.unlocked],
    ([, enabled, unlocked], _, onCleanup) => {
      const values = configs()
      error.value = ''
      if (!enabled || !unlocked || !values.length) return
      let active = true
      let timer: ReturnType<typeof setTimeout>
      const save = async () => {
        if (!active || !vault.enabled.value || !vault.unlocked.value) return
        // Single and batch workspaces share one vault. Wait for an in-flight
        // operation instead of dropping the other workspace's pending save.
        if (vault.busy.value) {
          timer = setTimeout(save, 100)
          return
        }
        try {
          await vault.save(values)
        } catch (cause) {
          if (active) error.value = (cause as Error).message
        }
      }
      timer = setTimeout(save, 800)
      onCleanup(() => {
        active = false
        clearTimeout(timer)
      })
    },
    { immediate: true }
  )
  return error
}
