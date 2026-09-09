<script setup lang="ts">
const localePath = useLocalePath()
import {
  analyzePaste,
  extractedSurroundingText,
  pastedInputText,
  type PasteAnalysis
} from '~/utils/smart-paste'
import { unlocalizedPath } from '~~/shared/seo/routes'
import { toOtpUri } from '~/utils/otp'
import SmartPasteReview from './SmartPasteReview.vue'
const { tx } = useMessages()
import { parseOtp, algorithmFrom, toAccessPath, identity, type OtpConfig } from '~/utils/otp'
const expandedConfig = useState<OtpConfig | null>('expanded-otp-config', () => null)
onBeforeRouteLeave((to) => {
  if (!unlocalizedPath(to.path).startsWith('/2fa/')) expandedConfig.value = null
})
const route = useRoute()
const input = shallowRef(''),
  issue = shallowRef(''),
  config = shallowRef<OtpConfig | null>(null)
const extracted = shallowRef('')
const originalInput = shallowRef('')
const pendingPaste = shallowRef<{ source: string; analysis: PasteAnalysis } | null>(null)
const batchTransfer = useState<string>('smart-batch-transfer', () => '')
watch(
  input,
  () => {
    extracted.value = ''
    originalInput.value = ''
    issue.value = ''
    pendingPaste.value = null
  },
  { flush: 'sync' }
)
const composing = shallowRef(false)
watch([input, composing], (_, __, onCleanup) => {
  if (composing.value) return
  const timer = setTimeout(() => {
    if (!pendingPaste.value) recognizeMixedInput()
  }, 300)
  onCleanup(() => clearTimeout(timer))
})
const missing = computed(() => !route.params.secret)
function load() {
  config.value = null
  issue.value = ''
  if (!route.params.secret) return
  try {
    const options = route.query
    for (const name of ['algorithm', 'digits', 'period'])
      if (Array.isArray(options[name])) throw new Error('链接参数重复，请检查链接。')
    config.value = parseOtp(String(route.params.secret), {
      algorithm: algorithmFrom(String(options.algorithm ?? 'SHA1')),
      digits: Number(options.digits ?? 6) as 6 | 8,
      period: Number(options.period ?? 30)
    })
    if (expandedConfig.value && identity(expandedConfig.value) === identity(config.value)) {
      config.value = {
        ...config.value,
        label: expandedConfig.value.label,
        issuer: expandedConfig.value.issuer
      }
    }
  } catch (e) {
    issue.value = (e as Error).message
  }
}
function submit() {
  if (pendingPaste.value) return
  recognizeMixedInput()
  if (pendingPaste.value) return
  try {
    const parsed = parseOtp(input.value)
    expandedConfig.value = parsed
    navigateTo(localePath(toAccessPath(parsed)))
    input.value = ''
  } catch (e) {
    issue.value = (e as Error).message
  }
}
function acceptPaste(value: OtpConfig, source = '') {
  input.value = toOtpUri(value)

  pendingPaste.value = null
  originalInput.value = source
  extracted.value = extractedSurroundingText(source)
    ? '已从粘贴内容中提取密钥，已忽略周围文字。'
    : source && source !== input.value
      ? '已自动整理输入格式。'
      : ''
  issue.value = ''
}
function inspectPaste(source: string) {
  extracted.value = ''
  originalInput.value = ''
  issue.value = ''
  if (!source.trim()) {
    issue.value = '剪贴板中没有文本，请先复制密钥。'
    return
  }
  const analysis = analyzePaste(source)
  if (analysis.kind === 'single') acceptPaste(analysis.candidates[0]!.config, source)
  else if (analysis.candidates.length > 1) pendingPaste.value = { source, analysis }
  else {
    input.value = source
    pendingPaste.value = null
    issue.value = analysis.issue || '密钥格式不正确，请检查是否包含多余字符。'
  }
}
function recognizeMixedInput() {
  if (analyzePaste(input.value).candidates.length > 1) {
    inspectPaste(input.value)
    return
  }
  try {
    parseOtp(input.value)
    return
  } catch {}
  if (analyzePaste(input.value).candidates.length) inspectPaste(input.value)
}
function handlePaste(event: ClipboardEvent) {
  const text = event.clipboardData?.getData('text/plain')
  if (!text) return
  event.preventDefault()
  const field = event.target as HTMLInputElement
  inspectPaste(
    pastedInputText(
      input.value,
      text,
      field.selectionStart ?? 0,
      field.selectionEnd ?? input.value.length
    )
  )
}
function transferPaste(value: string) {
  batchTransfer.value = value
  pendingPaste.value = null
  void navigateTo(localePath('/'))
}
function clear() {
  config.value = null
  input.value = ''
  navigateTo(localePath('/'), { replace: true })
}
watch(() => route.fullPath, load)
onMounted(load)
useHead({ meta: [{ name: 'referrer', content: 'no-referrer' }] })
</script>
<template>
  <div class="direct-page">
    <NuxtLink :to="localePath('/')" class="back-link"
      ><UIcon name="i-lucide-arrow-left" />{{ tx('返回首页') }}</NuxtLink
    >
    <div v-if="missing" class="direct-intro">
      <h1>{{ tx('获取验证码') }}</h1>
    </div>
    <div v-if="missing" class="direct-input">
      <UFormField v-show="!pendingPaste" :label="tx('2FA 密钥')"
        ><UInput
          v-model="input"
          type="password"
          class="w-full"
          size="xl"
          autocomplete="off"
          :placeholder="tx('输入密钥')"
          @paste="handlePaste"
          @compositionstart="composing = true"
          @compositionend="composing = false"
          @blur="recognizeMixedInput"
          @keydown.enter="submit"
      /></UFormField>
      <PasteNotice v-if="extracted && !pendingPaste" :message="extracted" :source="originalInput" />
      <SmartPasteReview
        v-if="pendingPaste"
        :key="pendingPaste.source"
        :source="pendingPaste.source"
        :analysis="pendingPaste.analysis"
        masked
        @select="acceptPaste"
        @batch="transferPaste"
        @cancel="pendingPaste = null"
        @inspect="inspectPaste"
      />
      <UButton
        v-if="!pendingPaste"
        class="primary-button w-full mt-4"
        :disabled="!!pendingPaste"
        @click="submit"
        >{{ tx('获取验证码') }}<UIcon name="i-lucide-arrow-right"
      /></UButton>
    </div>
    <div v-else-if="issue" class="direct-error">
      <UIcon name="i-lucide-circle-alert" class="text-3xl" />
      <h2>{{ tx('无法获取验证码') }}</h2>
      <p>{{ tx(issue) }}</p>
      <UButton :to="localePath('/2fa/')" color="neutral" variant="outline">{{
        tx('重新输入密钥')
      }}</UButton>
    </div>
    <div v-else class="direct-result">
      <OtpResult :config="config" standalone />
      <div v-if="config" class="direct-meta">
        <span>{{
          tx('{digits} 位 · 每 {period} 秒更新', { digits: config.digits, period: config.period })
        }}</span>
      </div>
      <SecretReveal v-if="config" :key="config.secret" :secret="config.secret" />
    </div>
    <p v-if="missing && issue" class="inline-error" role="alert">{{ tx(issue) }}</p>
    <div class="direct-bottom">
      <NuxtLink :to="localePath('/help')">{{ tx('验证码无法使用？') }}</NuxtLink
      ><button @click="clear">{{ tx('清空并返回首页') }}</button>
    </div>
  </div>
</template>
<style scoped>
.direct-page {
  max-width: 48rem;
  margin: 2rem auto 0;
  padding: 0 1.5rem;
}
.direct-intro {
  margin: 1.75rem 0 2rem;
}
.direct-intro h1 {
  font-size: var(--text-title);
  font-weight: 600;
  line-height: 1.3;
}
.direct-result {
  margin-top: 1.75rem;
  padding: 2.5rem;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  background: var(--wash);
  view-transition-name: otp-result;
}
.direct-result :deep(.otp-digits) {
  font-size: 5rem;
  margin-block: 3rem;
}
.direct-result :deep(.otp-digits.eight) {
  font-size: 4rem;
}
.direct-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: var(--text-caption);
  color: var(--ui-text-muted);
  margin-top: 1rem;
  border-top: 1px solid var(--ui-border);
  padding-top: 0.5rem;
}
.direct-bottom {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: var(--text-label);
  color: var(--ui-text-muted);
  margin-top: 1rem;
}
.direct-bottom > * {
  min-height: 2.75rem;
  display: inline-flex;
  align-items: center;
}
.direct-error {
  padding: 2rem;
  background: var(--wash);
  border-radius: var(--ui-radius);
}
.direct-error h2 {
  font-size: var(--text-section);
  margin: 0.75rem 0;
}
.direct-error p {
  color: var(--ui-text-muted);
  margin-bottom: 1.25rem;
}
.direct-input {
  padding: 1.75rem;
  background: var(--panel);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
}
@media (max-width: 600px) {
  .direct-page {
    margin-top: 1rem;
    padding-inline: 1.25rem;
  }
  .direct-intro {
    margin: 1.5rem 0;
  }
  .direct-result {
    padding: 1.5rem 1.25rem;
  }
  .direct-result :deep(.otp-digits) {
    font-size: 3rem;
  }
  .direct-result :deep(.otp-digits.eight) {
    font-size: 2.25rem;
  }
}
@media (max-width: 360px) {
  .direct-result {
    padding-inline: 1rem;
  }
  .direct-result :deep(.otp-digits) {
    font-size: 2.75rem;
  }
  .direct-result :deep(.otp-digits.eight) {
    font-size: 2rem;
  }
  .direct-meta {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
