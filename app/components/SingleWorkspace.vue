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
const { tx, locale } = useMessages()
import { parseOtp, defaults, DEMO_SECRET, type Algorithm, type OtpConfig } from '~/utils/otp'
const props = defineProps<{ guideStep?: number }>()
const emit = defineEmits<{ batch: [value: string]; guideCode: [value: string] }>()
const guiding = computed(() => props.guideStep !== undefined)
const raw = shallowRef(''),
  revealed = shallowRef(true),
  advanced = shallowRef(false),
  qrOpen = shallowRef(false),
  issue = shallowRef(''),
  pasteIssue = shallowRef(''),
  composing = shallowRef(false)
const algorithm = shallowRef<Algorithm>('SHA-1'),
  digits = shallowRef<6 | 8>(6),
  period = shallowRef(30)
const extracted = shallowRef('')
const originalInput = shallowRef('')
const pendingPaste = shallowRef<{ source: string; analysis: PasteAnalysis } | null>(null)
const restoredDetails = shallowRef({ label: '', issuer: '' })
const field = useTemplateRef<{ inputRef?: HTMLInputElement }>('secretField')
const vault = useVault()
const displayRaw = computed(() =>
  guiding.value ? (props.guideStep! >= 2 ? DEMO_SECRET : '') : raw.value
)
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
    return parseOtp(raw.value, {
      ...restoredDetails.value,
      algorithm: algorithm.value,
      digits: digits.value,
      period: period.value
    })
  } catch {
    return null
  }
})
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
    algorithm.value = defaults.algorithm
    digits.value = defaults.digits
    period.value = defaults.period
    pasteIssue.value = ''
    issue.value = ''
  },
  { flush: 'sync' }
)
watch([raw, algorithm, digits, period, composing], () => {
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
  advanced.value = false
  field.value?.inputRef?.focus()
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
  algorithm.value = value.algorithm
  digits.value = value.digits
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
  qrOpen.value = false
}
watch(
  vault.pending,
  (value) => {
    if (!value) return
    pendingPaste.value = null

    raw.value = value.secret
    algorithm.value = value.algorithm
    digits.value = value.digits
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
        <button
          class="text-action clear-input"
          :disabled="guiding || (!raw && !pendingPaste)"
          @click="clear"
        >
          {{ tx('清空') }}
        </button>
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
          base: 'font-mono text-base h-13 pr-12 ring-[var(--control-line)] focus-visible:ring-primary'
        }"
        @paste="handlePaste"
        @compositionstart="composing = true"
        @compositionend="finishComposition"
        @blur="recognizeMixedInput"
      >
        <template #trailing
          ><UButton
            color="neutral"
            variant="ghost"
            size="sm"
            class="icon-button"
            :icon="revealed ? 'i-lucide-eye-off' : 'i-lucide-eye'"
            :aria-label="tx(revealed ? '隐藏密钥' : '显示密钥')"
            @click="revealed = !revealed"
        /></template>
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
        @inspect="inspectPaste"
      />
      <PasteNotice v-if="extracted && !pendingPaste" :message="extracted" :source="originalInput" />
      <p id="secret-help" class="field-hint">{{ tx('支持 Base32 密钥和验证器配置链接。') }}</p>
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
          :disabled="guiding"
          :aria-expanded="advanced && !guiding"
          aria-controls="verification-options"
          @click="advanced = !advanced"
        >
          <span>{{ tx('验证参数') }}</span>
          <UIcon
            name="i-lucide-chevron-down"
            class="disclosure-icon"
            :class="{ expanded: advanced }"
          />
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
            <div v-else class="option-grid">
              <div>
                <label for="algorithm">{{ tx('算法') }}</label
                ><select id="algorithm" v-model="algorithm">
                  <option>SHA-1</option>
                  <option>SHA-256</option>
                  <option>SHA-512</option>
                </select>
              </div>
              <div>
                <label for="digits">{{ tx('位数') }}</label
                ><select id="digits" v-model.number="digits">
                  <option :value="6">{{ tx('{count} 位', { count: 6 }) }}</option>
                  <option :value="8">{{ tx('{count} 位', { count: 8 }) }}</option>
                </select>
              </div>
              <div>
                <label for="period">{{ tx('周期') }}</label
                ><select id="period" v-model.number="period">
                  <option v-if="period !== 30 && period !== 60" :value="period">
                    {{
                      new Intl.NumberFormat(locale, {
                        style: 'unit',
                        unit: 'second',
                        unitDisplay: 'long'
                      }).format(period)
                    }}
                  </option>
                  <option :value="30">{{ tx('30 秒') }}</option>
                  <option :value="60">{{ tx('60 秒') }}</option>
                </select>
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
  position: relative;
  z-index: 1;
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
