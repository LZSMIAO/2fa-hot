import type { ShallowRef } from 'vue'
import type { createVault } from './useVault'

export function useHistoryProtection(
  vault: ReturnType<typeof createVault>,
  error: ShallowRef<string>,
  run: (action: () => Promise<unknown>) => Promise<void>
) {
  const protectionOpen = shallowRef(false)
  const changingPassword = shallowRef(false)
  const needsNewPassword = computed(
    () => nextProtection.value && (!vault.passwordProtected.value || changingPassword.value)
  )
  const protectionChanged = computed(
    () =>
      nextProtection.value !== vault.passwordProtected.value ||
      (nextProtection.value && changingPassword.value)
  )
  const nextProtection = shallowRef(true)
  const newPassword = shallowRef('')
  const newConfirmation = shallowRef('')
  function openProtection() {
    changingPassword.value = false
    nextProtection.value = vault.passwordProtected.value
    newPassword.value = ''
    newConfirmation.value = ''
    error.value = ''
    protectionOpen.value = true
  }
  async function saveProtection() {
    if (!protectionChanged.value) return
    if (needsNewPassword.value && newPassword.value !== newConfirmation.value) {
      error.value = '两次口令不一致。'
      return
    }
    await run(async () => {
      await vault.setPassword(nextProtection.value ? newPassword.value : undefined)
      protectionOpen.value = false
      newPassword.value = ''
      newConfirmation.value = ''
    })
  }

  return {
    protectionOpen,
    changingPassword,
    needsNewPassword,
    protectionChanged,
    nextProtection,
    newPassword,
    newConfirmation,
    openProtection,
    saveProtection
  }
}
