<script setup lang="ts">
const localePath = useLocalePath()
const { tx } = useMessages()
useHead({
  link: [
    {
      rel: 'preload',
      href: '/fonts/vt323-regular.ttf',
      as: 'font',
      type: 'font/ttf',
      crossorigin: 'anonymous'
    }
  ]
})
import { toAccessPath, DEMO_SECRET, type OtpConfig } from '~/utils/otp'
const props = defineProps<{
  config: OtpConfig | null
  error?: string
  standalone?: boolean
  guideStep?: number
}>()
const vault = useVault()
const expandedConfig = useState<OtpConfig | null>('expanded-otp-config', () => null)
const emit = defineEmits<{ code: [value: string] }>()
const codeElement = useTemplateRef<HTMLElement>('codeElement')
const config = computed(() => props.config)
const digitCount = computed(() => props.config?.digits ?? 6)
const { code, error: calculationError, remaining, progress, current } = useOtp(config)
const showResultLinks = computed(
  () =>
    !!config.value &&
    !!code.value &&
    !props.error &&
    !calculationError.value &&
    config.value.kind !== 'steam'
)
const { copied, message, copy } = useCopy()
const { copied: linkCopied, message: linkMessage, copy: copyLink } = useCopy()
async function handleLink() {
  if (!props.config || props.guideStep !== undefined) return
  if (!props.standalone) {
    exportMode.value = 'link'
    return
  }
  await copyLink(`${window.location.origin}${localePath(toAccessPath(props.config))}`)
}
const copyConfirmed = computed(
  () => copied.value || (props.guideStep !== undefined && props.guideStep >= 3)
)
watch(code, (value) => emit('code', value), { immediate: true })
const shortcutHint = shallowRef(false)
const desktopShortcut = shallowRef(false)
let shortcutMedia: MediaQueryList | undefined
function updateShortcutDevice() {
  desktopShortcut.value = !!shortcutMedia?.matches
}
const shortcutHintSeen = useState('copy-shortcut-hint-seen-v4', () => false)
let shortcutTimer: ReturnType<typeof setTimeout> | undefined
function finishShortcutHint() {
  clearTimeout(shortcutTimer)
  shortcutHint.value = false
  shortcutHintSeen.value = true
  try {
    localStorage.setItem('2fa-copy-shortcut-hint-seen-v4', '1')
  } catch {}
}
onMounted(() => {
  shortcutMedia = matchMedia('(min-width: 701px) and (hover: hover) and (pointer: fine)')
  updateShortcutDevice()
  shortcutMedia.addEventListener('change', updateShortcutDevice)
  try {
    shortcutHintSeen.value ||= localStorage.getItem('2fa-copy-shortcut-hint-seen-v4') === '1'
  } catch {}
  watch(desktopShortcut, (desktop) => {
    if (!desktop) shortcutHint.value = false
  })
})
onBeforeUnmount(() => {
  shortcutMedia?.removeEventListener('change', updateShortcutDevice)
  if (shortcutHint.value) finishShortcutHint()
  clearTimeout(shortcutTimer)
})

const autoHistoryError = useAutoHistory(() =>
  props.config &&
  code.value &&
  !props.error &&
  !calculationError.value &&
  props.guideStep === undefined
    ? [props.config]
    : []
)
const working = shallowRef(false),
  note = shallowRef(''),
  exportMode = shallowRef<'qr' | 'link' | null>(null)
watch(config, () => {
  note.value = ''
  message.value = ''
  copied.value = false
  exportMode.value = null
  linkCopied.value = false
  linkMessage.value = ''
})
async function copyCurrent(fromButton = false) {
  if (
    !props.config ||
    !code.value ||
    props.error ||
    calculationError.value ||
    working.value ||
    props.guideStep !== undefined
  )
    return
  working.value = true
  note.value = ''
  try {
    const value = await current()
    if (await copy(value)) {
      if (fromButton && desktopShortcut.value && !shortcutHintSeen.value) {
        shortcutHintSeen.value = true
        shortcutHint.value = true
        try {
          localStorage.setItem('2fa-copy-shortcut-hint-seen-v4', '1')
        } catch {}
        clearTimeout(shortcutTimer)
        shortcutTimer = setTimeout(finishShortcutHint, 8000)
      }
    }
  } catch (e) {
    note.value = (e as Error).message
  } finally {
    working.value = false
  }
}
function handleCopyShortcut(event: KeyboardEvent) {
  if (!codeElement.value?.getClientRects().length) return
  if (
    event.key !== 'Enter' ||
    event.defaultPrevented ||
    event.repeat ||
    event.isComposing ||
    event.keyCode === 229 ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    event.shiftKey
  )
    return
  if (
    !props.config ||
    !code.value ||
    props.error ||
    calculationError.value ||
    props.guideStep !== undefined
  )
    return
  // Keep native activation, form editing, and modal keyboard controls intact.
  if (document.querySelector('[role="dialog"], [role="alertdialog"], [role="menu"]')) return
  const target = event.target
  if (
    target instanceof HTMLElement &&
    target.id !== 'secret' &&
    target.closest(
      'input, textarea, select, button, a, [contenteditable="true"], [role="combobox"], [role="listbox"]'
    )
  )
    return
  event.preventDefault()
  void copyCurrent()
}
onMounted(() => window.addEventListener('keydown', handleCopyShortcut))
onBeforeUnmount(() => window.removeEventListener('keydown', handleCopyShortcut))
defineExpose({ copyCurrent })
function prepareSizeChange() {
  if (!props.config || props.guideStep !== undefined) return
  void preloadRouteComponents(
    localePath(props.standalone ? '/' : toAccessPath(props.config))
  ).catch(() => {})
}
async function expand() {
  if (!props.config || props.guideStep !== undefined) return
  if (props.standalone) {
    vault.pending.value = { ...props.config }
    await navigateTo(localePath('/'))
  } else {
    expandedConfig.value = { ...props.config }
    await navigateTo(localePath(toAccessPath(props.config)))
  }
}
</script>
<template>
  <div class="result-head">
    <span>{{ tx(standalone ? '当前有效验证码' : '当前验证码') }}</span>
    <div class="result-head-actions">
      <span v-if="config?.secret === DEMO_SECRET" class="result-status">{{ tx('示例') }}</span>
      <UButton
        color="neutral"
        variant="ghost"
        :icon="standalone ? 'i-lucide-minimize-2' : 'i-lucide-maximize-2'"
        class="expand-button"
        :aria-label="tx(standalone ? '缩小验证码' : '放大验证码')"
        :title="tx(standalone ? '返回工具首页' : '放大到独立取码页')"
        :disabled="
          !config ||
          config.kind === 'steam' ||
          !!error ||
          !!calculationError ||
          guideStep !== undefined
        "
        @pointerenter="prepareSizeChange"
        @focus="prepareSizeChange"
        @click="expand"
      />
    </div>
  </div>
  <div
    ref="codeElement"
    class="otp-digits"
    :class="{ empty: !code, eight: digitCount === 8 }"
    data-testid="otp-code"
    :aria-label="code ? tx('当前验证码 {code}', { code }) : tx('输入密钥后显示验证码')"
  >
    <span class="otp-slots" aria-hidden="true">
      <span
        v-for="position in digitCount"
        :key="position"
        class="otp-slot"
        :class="{ 'otp-slot-group': position === digitCount / 2 + 1 }"
      >
        <Transition name="otp-ready">
          <span v-if="code" :key="code" class="otp-slot-value">{{ code[position - 1] }}</span>
          <span v-else key="waiting" class="otp-slot-dot" />
        </Transition>
      </span>
    </span>
  </div>
  <div :class="{ expiring: config && remaining <= 5 }">
    <div class="countdown-meta">
      <span>{{ config ? tx(remaining <= 5 ? '即将更新' : '剩余时间') : '' }}</span
      ><span v-if="config" class="countdown-value mono" aria-hidden="true"
        ><span>{{ String(remaining).padStart(2, '0') }}</span>
        <span>/ {{ config.period }}s</span></span
      ><span v-else class="countdown-value mono">— / 30s</span>
    </div>
    <div class="countdown-track" aria-hidden="true">
      <div
        class="countdown-fill"
        :style="{ clipPath: `inset(0 ${100 - (config ? progress : 0)}% 0 0)` }"
      />
    </div>
  </div>
  <UButton
    class="primary-button result-copy"
    :id="standalone ? undefined : 'tutorial-copy-code'"
    :aria-disabled="guideStep !== undefined || undefined"
    :class="{ 'is-copied': copyConfirmed }"
    :disabled="!config || !!error || !!calculationError"
    :loading="working"
    aria-keyshortcuts="Enter"
    @click="copyCurrent(true)"
    ><span class="copy-icon" aria-hidden="true"
      ><Transition name="copy-feedback"
        ><UIcon
          :key="copyConfirmed ? 'copied' : 'copy'"
          :name="copyConfirmed ? 'i-lucide-check' : 'i-lucide-copy'" /></Transition></span
    >{{ tx(copyConfirmed ? '已复制' : '复制验证码')
    }}<UKbd value="↵" class="ml-auto opacity-70 bg-white/10 text-white ring-0"
  /></UButton>
  <ActionHint
    :open="shortcutHint && !!code && guideStep === undefined"
    :message="tx('按回车可快速复制验证码')"
    icon="i-lucide-corner-down-left"
    @close="finishShortcutHint"
  />
  <p v-if="error || calculationError" class="inline-error" role="alert">
    {{ tx(error || calculationError) }}
  </p>
  <p class="sr-only" role="status">{{ tx(copyConfirmed ? '验证码已复制' : '') }}</p>
  <p v-if="autoHistoryError" class="inline-error" role="alert">{{ tx(autoHistoryError) }}</p>
  <p v-if="message || note" class="inline-notice" role="status">{{ tx(message || note) }}</p>
  <div
    class="export-reveal"
    :class="{ 'is-open': showResultLinks }"
    :inert="!showResultLinks"
    :aria-hidden="!showResultLinks"
  >
    <div class="export-reveal-inner">
      <div class="result-links">
        <button
          class="text-action"
          :disabled="!config || guideStep !== undefined"
          @click="exportMode = 'qr'"
        >
          <UIcon name="i-lucide-qr-code" />{{ tx('二维码') }}</button
        ><button
          class="text-action"
          :disabled="!config || guideStep !== undefined"
          @click="handleLink"
        >
          <UIcon :name="standalone && linkCopied ? 'i-lucide-check' : 'i-lucide-link'" />{{
            tx(standalone ? (linkCopied ? '已复制' : '复制链接') : '获取链接')
          }}
        </button>
      </div>
    </div>
  </div>
  <p v-if="standalone && linkMessage" class="inline-error" role="alert">{{ tx(linkMessage) }}</p>
  <LazyExportDialog
    v-if="exportMode && config"
    :mode="exportMode"
    :config="config"
    @close="exportMode = null"
  />
</template>

<style scoped>
.export-reveal {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 240ms cubic-bezier(0.22, 1, 0.36, 1);
}
.export-reveal.is-open {
  grid-template-rows: 1fr;
}
.export-reveal-inner {
  min-height: 0;
  overflow: hidden;
}
.export-reveal .result-links {
  transform: translateY(-8px);
  transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
}
.export-reveal.is-open .result-links {
  transform: translateY(0);
}
@media (prefers-reduced-motion: reduce) {
  .export-reveal,
  .export-reveal .result-links {
    transition: none;
  }
}
.otp-digits {
  display: grid;
  place-items: center;
  letter-spacing: 0;
  font-family: 'VT323', monospace;
  font-weight: 400;
}
.otp-digits.empty {
  opacity: 1;
  letter-spacing: 0;
}
.otp-slots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.09em;
  height: 1.3em;
}
.otp-slot {
  display: grid;
  place-items: center;
  width: 0.74em;
  overflow: hidden;
  height: 1.12em;
  border: 1px solid var(--ui-border);
  background: var(--ore-input);
  box-shadow: var(--ore-inset);
}
.otp-slot-group {
  margin-inline-start: 0.14em;
}
.otp-slot-value,
.otp-slot-dot {
  grid-area: 1 / 1;
}
.otp-slot-value {
  /* Center the enlarged line box in the fixed slot; do not offset the rolling animation. */
  font-size: 1.08em;
  line-height: 1;
}
.otp-slot-dot {
  width: 0.08em;
  height: 0.08em;
  background: var(--ui-text-muted);
}
/* Only the numerals move; slot geometry and the current copy value stay stable. */
.otp-ready-enter-active {
  transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
}
.otp-ready-leave-active {
  transition: transform 180ms cubic-bezier(0.4, 0, 1, 1);
}
.otp-ready-enter-from {
  transform: translateY(120%);
}
.otp-ready-leave-to {
  transform: translateY(-120%);
}
@media (prefers-reduced-motion: reduce) {
  .otp-ready-enter-active,
  .otp-ready-leave-active {
    transition: none;
  }
}
</style>

<style scoped>
.shortcut-hint {
  color: var(--accent-ink);
  font-weight: 500;
}
</style>
