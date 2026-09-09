<script setup lang="ts">
const clipboardHint = useClipboardHint()
import {
  analyzePaste,
  extractedSurroundingText,
  pastedInputText,
  type PasteAnalysis
} from '~/utils/smart-paste'
import SmartPasteReview from './SmartPasteReview.vue'
import MigrationDialog from './MigrationDialog.vue'
import { isMigrationUri } from '~/utils/ga-migration'
const migrationSource = shallowRef<string | null>(null)
const { tx } = useMessages()
import {
  parseOtp,
  defaults,
  DEMO_SECRET,
  type Algorithm,
  type OtpConfig,
  type OtpKind
} from '~/utils/otp'
const props = defineProps<{ guideStep?: number }>()
const emit = defineEmits<{ batch: [value: string]; guideCode: [value: string] }>()
const guiding = computed(() => props.guideStep !== undefined)
const raw = shallowRef(''),
  revealed = shallowRef(true),
  advanced = shallowRef(true),
  qrOpen = shallowRef(false),
  issue = shallowRef(''),
  pasteIssue = shallowRef(''),
  composing = shallowRef(false)
const algorithm = shallowRef<Algorithm>('SHA-1'),
  digits = shallowRef<6 | 8>(6),
  period = shallowRef(30),
  kind = shallowRef<OtpKind>('totp')
const kindItems = [
  { label: 'TOTP', value: 'totp' as const },
  { label: 'Steam Guard', value: 'steam' as const }
]
const algorithmItems = [
  { label: 'SHA-1', value: 'SHA-1' as const },
  { label: 'SHA-256', value: 'SHA-256' as const },
  { label: 'SHA-512', value: 'SHA-512' as const }
]
const digitItems = computed(() => [
  { label: tx('{count} 位', { count: 6 }), value: 6 as const },
  { label: tx('{count} 位', { count: 8 }), value: 8 as const }
])
const periodItems = computed(() => [
  { label: tx('30 秒'), value: 30 },
  { label: tx('60 秒'), value: 60 }
])
const extracted = shallowRef('')
const originalInput = shallowRef('')
const pendingPaste = shallowRef<{ source: string; analysis: PasteAnalysis } | null>(null)
const restoredDetails = shallowRef({ label: '', issuer: '' })
const field = useTemplateRef<{ inputRef?: HTMLInputElement }>('secretField')
const vault = useVault()
const displayRaw = computed(() =>
  guiding.value ? (props.guideStep! >= 2 ? DEMO_SECRET : '') : raw.value
)
function toggleAdvanced() {
  advanced.value = !advanced.value
  window.dispatchEvent(new CustomEvent('2fa-ui-sound', { detail: 'parameters' }))
}
function updateRaw(value: string) {
  if (guiding.value) return
  if (isMigrationUri(value)) {
    migrationSource.value = value
    raw.value = value
    nextTick(() => {
      raw.value = ''
    })
  } else raw.value = value
}
const inputAnalysis = computed(() => analyzePaste(raw.value))
const config = computed<OtpConfig | null>(() => {
  if (guiding.value) return props.guideStep! >= 2 ? parseOtp(DEMO_SECRET) : null
  if (
    !raw.value.trim() ||
    composing.value ||
    pendingPaste.value ||
    inputAnalysis.value.candidates.length > 1
  )
    return null
  try {
    const kindOptions = kind.value === 'steam' ? { kind: 'steam' as const } : {}
    return parseOtp(raw.value, {
      ...restoredDetails.value,
      ...kindOptions,
      algorithm: algorithm.value,
      digits: digits.value,
      period: period.value
    })
  } catch {
    return null
  }
})
const activeKind = computed(() => config.value?.kind ?? kind.value)
const steamSelected = computed(() => activeKind.value === 'steam')
const isUri = computed(() => /^otpauth:/i.test(raw.value.trim()))
const compactScreen = shallowRef(false)
const resultExpanded = shallowRef(false)
let compactQuery: MediaQueryList | undefined
function updateCompactScreen() {
  compactScreen.value = compactQuery?.matches || false
}
// Keep the result open during edits; only clearing the input collapses it again.
watch([config, raw], () => {
  if (config.value) resultExpanded.value = true
  else if (!raw.value.trim() && !guiding.value) resultExpanded.value = false
})
onMounted(() => {
  compactQuery = window.matchMedia('(max-width: 700px)')
  updateCompactScreen()
  compactQuery.addEventListener('change', updateCompactScreen)
})
onBeforeUnmount(() => compactQuery?.removeEventListener('change', updateCompactScreen))
let pasteRevision = 0
watch(guiding, () => {
  pasteRevision++
})
let validation: ReturnType<typeof setTimeout> | undefined
watch(
  raw,
  () => {
    pasteRevision++
    extracted.value = ''
    originalInput.value = ''
    pendingPaste.value = null

    restoredDetails.value = { label: '', issuer: '' }
    kind.value = 'totp'
    algorithm.value = defaults.algorithm
    digits.value = defaults.digits
    period.value = defaults.period
    pasteIssue.value = ''
    issue.value = ''
  },
  { flush: 'sync' }
)
watch([raw, kind, algorithm, digits, period, composing], () => {
  clearTimeout(validation)
  issue.value = ''
  if (!raw.value.trim() || composing.value) return
  validation = setTimeout(() => {
    if (pendingPaste.value || guiding.value) return
    if (!config.value && inputAnalysis.value.candidates.length) {
      inspectPaste(raw.value)
      return
    }
    try {
      parseOtp(raw.value, {
        ...(kind.value === 'steam' ? { kind: 'steam' as const } : {}),
        algorithm: algorithm.value,
        digits: digits.value,
        period: period.value
      })
    } catch (e) {
      issue.value = (e as Error).message
    }
  }, 300)
})
onBeforeUnmount(() => clearTimeout(validation))
function clear() {
  clearTimeout(validation)
  pasteRevision++
  pasteIssue.value = ''
  issue.value = ''
  pendingPaste.value = null
  extracted.value = ''
  originalInput.value = ''

  raw.value = ''
  revealed.value = true
  advanced.value = true
  field.value?.inputRef?.focus()
}
function clearWithSound() {
  window.dispatchEvent(new CustomEvent('2fa-ui-sound', { detail: 'parameters' }))
  clear()
}
async function paste() {
  const revision = ++pasteRevision
  await clipboardHint.start()
  if (revision !== pasteRevision || guiding.value) return
  try {
    const text = await navigator.clipboard.readText()
    clipboardHint.finish(true)
    if (revision !== pasteRevision || guiding.value) return
    inspectPaste(text)
  } catch {
    clipboardHint.finish(false)
    if (revision !== pasteRevision) return
    pasteIssue.value = '无法读取剪贴板，请使用系统粘贴。'
  }
}
function acceptPaste(value: OtpConfig, source = '') {
  raw.value = value.secret
  kind.value = value.kind ?? 'totp'
  algorithm.value = value.algorithm
  digits.value = value.kind === 'steam' || value.digits === 5 ? 6 : value.digits
  period.value = value.period
  restoredDetails.value = { label: value.label, issuer: value.issuer }
  pendingPaste.value = null
  originalInput.value = source
  extracted.value = extractedSurroundingText(source)
    ? '已从粘贴内容中提取密钥，已忽略周围文字。'
    : source && source !== value.secret
      ? '已自动整理输入格式。'
      : ''
  pasteIssue.value = ''
  issue.value = ''
}
function inspectPaste(source: string) {
  extracted.value = ''
  originalInput.value = ''
  pasteRevision++
  if (guiding.value) return
  pasteIssue.value = ''
  if (!source.trim()) {
    pasteIssue.value = '剪贴板中没有文本，请先复制密钥。'
    return
  }
  if (isMigrationUri(source.trim())) {
    updateRaw(source.trim())
    return
  }
  const analysis = analyzePaste(source)
  if (analysis.kind === 'single') acceptPaste(analysis.candidates[0]!.config, source)
  else if (analysis.candidates.length > 1) pendingPaste.value = { source, analysis }
  else {
    updateRaw(source)
    pendingPaste.value = null
    pasteIssue.value = analysis.issue || ''
  }
}
function recognizeMixedInput() {
  if (guiding.value || composing.value || !raw.value.trim()) return
  if (config.value && inputAnalysis.value.candidates.length <= 1) return
  if (analyzePaste(raw.value).candidates.length) inspectPaste(raw.value)
}
function finishComposition() {
  composing.value = false
  nextTick(recognizeMixedInput)
}
function handlePaste(event: ClipboardEvent) {
  if (guiding.value || !event.clipboardData) return
  const text = event.clipboardData.getData('text/plain')
  if (!text) return
  event.preventDefault()
  const input = event.target as HTMLInputElement
  const start = input.selectionStart ?? 0,
    end = input.selectionEnd ?? raw.value.length
  inspectPaste(pastedInputText(raw.value, text, start, end))
}
function transferPaste(value: string) {
  pendingPaste.value = null

  emit('batch', value)
}
function importValue(value: string) {
  pendingPaste.value = null
  extracted.value = ''
  originalInput.value = ''

  raw.value = value
  try {
    kind.value = parseOtp(value).kind ?? 'totp'
  } catch {
    kind.value = 'totp'
  }
  qrOpen.value = false
}
watch(
  vault.pending,
  (value) => {
    if (!value) return
    pendingPaste.value = null

    raw.value = value.secret
    kind.value = value.kind ?? 'totp'
    algorithm.value = value.algorithm
    digits.value = value.kind === 'steam' || value.digits === 5 ? 6 : value.digits
    period.value = value.period
    restoredDetails.value = { label: value.label, issuer: value.issuer }
    vault.pending.value = undefined
  },
  { immediate: true }
)
onMounted(() => {
  window.addEventListener('pagehide', clear)
})
onBeforeUnmount(() => {
  clearTimeout(validation)
  window.removeEventListener('pagehide', clear)
})
</script>
<template>
  <div class="workspace ore-workspace-frame">
    <section class="input-panel" aria-labelledby="secret-heading">
      <div class="section-heading">
        <h2 id="secret-heading">{{ tx('密钥') }}</h2>
      </div>
      <label class="sr-only" for="secret">{{ tx('2FA 密钥') }}</label>
      <UInput
        v-show="!pendingPaste || guiding"
        id="secret"
        ref="secretField"
        :model-value="displayRaw"
        :readonly="guiding"
        @update:model-value="updateRaw"
        class="w-full secret-field"
        dir="ltr"
        :type="revealed ? 'text' : 'password'"
        size="xl"
        :placeholder="tx('密钥或 otpauth:// 链接')"
        autocomplete="off"
        autocapitalize="off"
        :spellcheck="false"
        :aria-invalid="!guiding && !!issue"
        :aria-describedby="!guiding && issue ? 'secret-help secret-error' : 'secret-help'"
        :ui="{
          base: 'font-mono text-base h-13 pr-24 ring-[var(--control-line)] focus-visible:ring-primary'
        }"
        @paste="handlePaste"
        @compositionstart="composing = true"
        @compositionend="finishComposition"
        @blur="recognizeMixedInput"
      >
        <template #trailing>
          <div class="secret-actions">
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              icon="i-lucide-eraser"
              class="secret-action"
              :aria-label="tx('清空')"
              :title="tx('清空')"
              :disabled="guiding || (!raw && !pendingPaste)"
              data-sound-custom
              @click="clearWithSound"
            />
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              class="secret-action"
              :icon="revealed ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              :aria-label="tx(revealed ? '隐藏密钥' : '显示密钥')"
              @click="revealed = !revealed"
            />
          </div>
        </template>
      </UInput>
      <SmartPasteReview
        v-if="pendingPaste && !guiding"
        :key="pendingPaste.source"
        :source="pendingPaste.source"
        :analysis="pendingPaste.analysis"
        :masked="!revealed"
        @select="acceptPaste"
        @batch="transferPaste"
        @cancel="pendingPaste = null"
        @clear="clearWithSound"
        @inspect="inspectPaste"
      />
      <PasteNotice v-if="extracted && !pendingPaste" :message="extracted" :source="originalInput" />
      <p id="secret-help" class="field-hint">
        {{ tx('密钥：Base32 / otpauth:// / Steam') }}
      </p>
      <p
        v-if="!guiding && !pendingPaste && issue"
        id="secret-error"
        class="inline-error"
        role="alert"
      >
        {{ tx(issue) }}
      </p>
      <div class="input-tools">
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-clipboard-paste"
          :disabled="guiding"
          @click="paste"
          >{{ tx('粘贴') }}</UButton
        >
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-scan-line"
          :disabled="guiding"
          @click="qrOpen = true"
          >{{ tx('导入二维码') }}</UButton
        >
      </div>
      <ActionHint
        :open="clipboardHint.visible.value"
        :message="tx('如果浏览器询问剪贴板权限，请点允许。')"
        icon="i-lucide-clipboard-paste"
        @close="clipboardHint.visible.value = false"
      />
      <p v-if="!guiding && pasteIssue" class="inline-notice">{{ tx(pasteIssue) }}</p>
      <div class="advanced">
        <button
          class="advanced-toggle"
          data-sound-custom
          :disabled="guiding"
          :aria-label="tx('验证参数')"
          :aria-expanded="advanced && !guiding"
          aria-controls="verification-options"
          @click="toggleAdvanced"
        >
          <span class="parameter-sky" :class="{ 'is-moon': advanced }" aria-hidden="true">
            <span class="parameter-sun" />
            <span class="parameter-moon" />
          </span>
        </button>
        <div class="advanced-stage">
          <div
            id="verification-options"
            class="advanced-options"
            :class="{ 'is-hidden': !advanced || guiding }"
            :inert="!advanced || guiding"
            :aria-hidden="!advanced || guiding"
          >
            <p v-if="isUri" class="field-hint">
              {{ tx('参数由配置链接指定，请在原链接中修改。') }}
            </p>
            <div v-else class="option-grid" :class="{ 'steam-options': steamSelected }">
              <div class="option-field option-kind">
                <label for="otp-kind">{{ tx('验证方式') }}</label
                ><McSelect id="otp-kind" v-model="kind" :items="kindItems" />
              </div>
              <template v-if="!steamSelected">
                <div class="option-field">
                  <label for="algorithm">{{ tx('算法') }}</label
                  ><McSelect id="algorithm" v-model="algorithm" :items="algorithmItems" />
                </div>
                <div class="option-field">
                  <label for="digits">{{ tx('位数') }}</label
                  ><McSelect id="digits" v-model="digits" :items="digitItems" />
                </div>
                <div class="option-field">
                  <label for="period">{{ tx('周期') }}</label
                  ><McSelect id="period" v-model="period" :items="periodItems" />
                </div>
              </template>
              <div v-else class="steam-profile" role="status">
                <span class="steam-profile-title">Steam Guard</span>
                <span>{{ tx('{digits} 位 · 每 {period} 秒更新', { digits: 5, period: 30 }) }}</span>
              </div>
            </div>
          </div>
          <DesertAccent :class="{ 'is-hidden': advanced && !guiding }" />
        </div>
      </div>
    </section>
    <div
      class="result-reveal"
      :class="{ 'is-expanded': resultExpanded }"
      :inert="compactScreen && !resultExpanded"
      :aria-hidden="compactScreen && !resultExpanded ? true : undefined"
    >
      <div class="result-reveal-clip">
        <section class="result-panel" :aria-label="tx('验证码结果')">
          <OtpResult :config="config" :guide-step="guideStep" @code="emit('guideCode', $event)" />
        </section>
      </div>
    </div>
  </div>
  <LazyQrImport
    v-if="qrOpen"
    @migration="migrationSource = $event"
    @close="qrOpen = false"
    @import="importValue"
    @batch="
      (value) => {
        qrOpen = false
        emit('batch', value)
      }
    "
  />
  <MigrationDialog
    v-if="migrationSource !== null"
    :initial="migrationSource"
    @close="migrationSource = null"
    @import="importValue"
    @batch="emit('batch', $event)"
  />
</template>

<style scoped>
.advanced-toggle {
  position: absolute;
  inset-inline-end: 0;
  top: -1.375rem;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  justify-content: center;
  background: var(--panel);
  cursor: pointer;
  z-index: 1;
}
.advanced {
  position: relative;
  padding-top: 0.75rem;
}
.parameter-sky {
  position: relative;
  overflow: hidden;
  display: block;
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
  pointer-events: none;
}
.parameter-sun,
.parameter-moon {
  position: absolute;
  inset: 0;
  image-rendering: pixelated;
  background: var(--panel) url('/textures/sun.png') center / 3rem 3rem no-repeat;
  background-blend-mode: screen;
  mask-image: radial-gradient(circle at center, #000 20%, rgb(0 0 0 / 80%) 35%, transparent 68%);
  pointer-events: none;
  transition:
    opacity 240ms ease-out,
    transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
}
.parameter-moon {
  background-image: url('/textures/moon_phases.png');
  background-size: 11rem 5.5rem;
  background-position: left top;
  opacity: 0;
  transform: translateY(65%);
}
.is-moon .parameter-sun {
  opacity: 0;
  transform: translateY(-65%);
}
.is-moon .parameter-moon {
  opacity: 1;
  transform: translateY(0);
}
@media (prefers-reduced-motion: reduce) {
  .parameter-sun,
  .parameter-moon {
    transition: none;
  }
}
.option-grid {
  font-family:
    system-ui,
    -apple-system,
    'PingFang SC',
    'Microsoft YaHei',
    sans-serif;
}
.secret-actions {
  display: flex;
  align-items: center;
  gap: 0.125rem;
}
.secret-action {
  width: 2.25rem;
  height: 2.25rem;
  min-width: 2.25rem;
  min-height: 2.25rem;
  justify-content: center;
}
.secret-action:disabled {
  opacity: 1;
  color: var(--ui-text-highlighted);
  cursor: default;
}
.advanced-stage {
  display: grid;
}
.advanced-stage > * {
  grid-area: 1 / 1;
  min-width: 0;
}
.advanced-stage .is-hidden {
  visibility: hidden;
  pointer-events: none;
}
.advanced-options {
  align-self: start;
}
.advanced-stage > .desert-accent.is-hidden {
  display: none;
}
.option-field {
  min-width: 0;
}
.option-grid.steam-options {
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
}
.steam-profile {
  display: flex;
  align-items: center;
  align-self: end;
  gap: 0.75rem;
  min-height: 2.75rem;
  padding: 0.5rem 0.75rem;
  border: 2px solid var(--ore-outline);
  background: var(--ore-control);
  box-shadow: var(--ore-bevel);
  color: var(--ui-text-highlighted);
  font-size: var(--text-caption);
}
.steam-profile-title {
  font-family: 'VT323', monospace;
  font-size: 1.25rem;
  line-height: 1;
}
@media (max-width: 700px) {
  .option-grid.steam-options {
    grid-template-columns: 1fr;
  }
  .steam-profile {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>

<style scoped>
/* Keep first-paint hints independent of downloaded Latin fonts. */
.secret-field :deep(#secret::placeholder),
#secret-help {
  font-family:
    system-ui,
    -apple-system,
    'PingFang SC',
    'Microsoft YaHei',
    sans-serif;
}
</style>

<style scoped>
.clipboard-permission-notice {
  color: var(--accent-ink);
  font-weight: 600;
}
</style>
