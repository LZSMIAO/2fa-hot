<script setup lang="ts">
import { analyzePaste, pastedBatchText, type PasteAnalysis } from '~/utils/smart-paste'
import { type OtpConfig } from '~/utils/otp'
const props = defineProps<{ source: string; analysis: PasteAnalysis; masked?: boolean }>()
const emit = defineEmits<{
  select: [config: OtpConfig, source: string]
  batch: [text: string]
  cancel: []
  inspect: [source: string]
}>()
const { tx } = useMessages()
const draft = shallowRef(props.source)
watch(
  () => props.source,
  (source) => {
    draft.value = source
  }
)
const associations = ref<Record<string, number>>({})
const concealed = shallowRef(!!props.masked)
const result = computed(() => analyzePaste(draft.value))
const panel = useTemplateRef<HTMLElement>('panel')
const inputId = useId()
let animation: Animation | undefined
onMounted(() => {
  if (!panel.value || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  animation = panel.value.animate(
    [{ height: '52px' }, { height: panel.value.offsetHeight + 'px' }],
    { duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
  )
})
onBeforeUnmount(() => animation?.cancel())
const selected = ref<number[]>(
  props.analysis.kind === 'multiple' ? props.analysis.candidates.map((_, i) => i) : []
)
const allSelected = computed(
  () =>
    result.value.candidates.length > 0 && selected.value.length === result.value.candidates.length
)
function toggleAll() {
  selected.value = allSelected.value ? [] : result.value.candidates.map((_, i) => i)
}
watch(draft, () => {
  associations.value = {}
  selected.value = result.value.kind === 'review' ? [] : result.value.candidates.map((_, i) => i)
})
function toggleAccount(account: string, index: number) {
  if (associations.value[account] === index) delete associations.value[account]
  else {
    associations.value[account] = index
    if (!selected.value.includes(index)) selected.value.push(index)
  }
}
watch(
  selected,
  (indices) => {
    for (const [account, index] of Object.entries(associations.value))
      if (!indices.includes(index)) delete associations.value[account]
  },
  { deep: true }
)
function useSelected() {
  const configs = [...selected.value]
    .sort((a, b) => a - b)
    .filter((i) => result.value.candidates[i])
    .map((i) => {
      const candidate = result.value.candidates[i]!
      return {
        ...candidate.config,
        label:
          candidate.suggestedAccount && associations.value[candidate.suggestedAccount] === i
            ? candidate.suggestedAccount
            : candidate.config.label
      }
    })
  if (configs.length === 1) emit('select', configs[0]!, draft.value)
  else if (configs.length > 1) emit('batch', pastedBatchText(configs))
}
</script>
<template>
  <section ref="panel" class="paste-review">
    <div class="paste-source">
      <label class="sr-only" :for="inputId">{{ tx('密钥') }}</label>
      <UTextarea
        :id="inputId"
        v-model="draft"
        class="w-full"
        :rows="1"
        wrap="off"
        :maxlength="100000"
        :spellcheck="false"
        :style="{ WebkitTextSecurity: concealed ? 'disc' : undefined }"
        :ui="{ base: 'paste-source-input font-mono text-base' }"
      />
      <UButton
        color="neutral"
        variant="ghost"
        size="sm"
        :icon="concealed ? 'i-lucide-eye' : 'i-lucide-eye-off'"
        :aria-label="tx(concealed ? '显示密钥' : '隐藏密钥')"
        @click="concealed = !concealed"
      />
    </div>
    <div class="paste-options" aria-live="polite">
      <div v-if="result.candidates.length > 1" class="paste-review-toolbar">
        <p class="paste-review-heading">
          {{ tx('检测到 {count} 条候选密钥', { count: result.candidates.length }) }}
        </p>
        <UButton
          v-if="result.candidates.length"
          color="neutral"
          variant="ghost"
          size="sm"
          :aria-pressed="allSelected"
          @click="toggleAll"
          >{{ tx(allSelected ? '取消全选' : '全选') }}</UButton
        >
      </div>
      <p
        v-if="result.candidates.some((candidate) => candidate.suggestedAccount)"
        class="field-hint"
      >
        {{ tx('无法确定账号对应哪条密钥，请选择关联或直接取码。') }}
      </p>
      <p v-if="result.issue" class="inline-error">{{ tx(result.issue) }}</p>
      <p v-else-if="!result.candidates.length" class="field-hint">
        {{ tx('未识别到完整密钥，请修改粘贴原文后重试。') }}
      </p>
      <div v-if="result.candidates.length" class="paste-candidates">
        <div v-for="(candidate, i) in result.candidates" :key="i" class="paste-candidate">
          <input
            v-model="selected"
            type="checkbox"
            :value="i"
            :aria-label="candidate.config.secret"
          />
          <span>
            <code>{{
              concealed
                ? candidate.config.secret.slice(0, 4) + '••••' + candidate.config.secret.slice(-4)
                : candidate.config.secret
            }}</code>
            <small
              >{{ candidate.config.algorithm }} ·
              {{ tx('{count} 位', { count: candidate.config.digits }) }} ·
              {{ candidate.config.period }}s</small
            >
            <small v-if="candidate.config.label"
              >{{ tx('关联账号') }}: {{ candidate.config.label }}</small
            >
            <div v-if="candidate.suggestedAccount" class="account-choice">
              <UButton
                color="neutral"
                variant="outline"
                size="sm"
                :icon="
                  associations[candidate.suggestedAccount] === i
                    ? 'i-lucide-check'
                    : 'i-lucide-link'
                "
                :aria-pressed="associations[candidate.suggestedAccount] === i"
                @click="toggleAccount(candidate.suggestedAccount, i)"
              >
                {{ tx(associations[candidate.suggestedAccount] === i ? '取消' : '关联账号') }}
              </UButton>
              <span>{{ candidate.suggestedAccount }}</span>
            </div>
          </span>
        </div>
      </div>
      <div class="paste-actions">
        <UButton
          v-if="result.candidates.length"
          class="primary-button"
          :disabled="!selected.length"
          @click="useSelected"
          >{{ tx(selected.length > 1 ? '转到批量取码' : '使用所选密钥') }}</UButton
        >
        <UButton color="neutral" variant="ghost" @click="emit('cancel')">{{ tx('取消') }}</UButton>
      </div>
    </div>
  </section>
</template>
<style scoped>
.paste-review {
  border: 2px solid var(--control-line);
  background: var(--ore-input);
  box-shadow: var(--ore-inset);
  overflow: hidden;
}
.paste-review-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.25rem 0.75rem;
}
.paste-review-heading {
  font-weight: 600;
  color: var(--ui-text-highlighted);
}
.paste-candidates {
  max-height: 16rem;
  overflow-y: auto;
  margin: 0.75rem -1rem;
  padding-inline: 1rem;
  scrollbar-gutter: stable;
}
.paste-candidate {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 0.25rem;
  align-items: start;
  border-bottom: 1px solid var(--ui-border);
  cursor: pointer;
}
.paste-candidate input {
  margin-top: 0.3rem;
  accent-color: var(--action);
}
.paste-candidate span {
  min-width: 0;
}
.paste-candidate code,
.paste-candidate small {
  display: block;
  overflow-wrap: anywhere;
}
.paste-candidate small {
  color: var(--ui-text-muted);
}
.paste-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-block: 0.75rem;
}
.paste-source {
  position: relative;
  height: 50px;
}
.paste-source :deep(.paste-source-input) {
  border: 0;
  box-shadow: none;
  outline: none;
  padding-inline-end: 4rem;
  scrollbar-gutter: stable;
  height: 50px;
  min-height: 50px;
  max-height: 50px;
  resize: none;
  overflow: auto;
}
.paste-source > button {
  position: absolute;
  top: 2px;
  right: 10px;
  width: 2.75rem;
  height: 2.75rem;
  justify-content: center;
}
.paste-candidates,
.paste-source :deep(textarea) {
  scrollbar-width: thin;
  scrollbar-color: var(--control-line) transparent;
  overscroll-behavior: contain;
}
.paste-source:focus-within {
  box-shadow: inset 0 -2px var(--accent-ink);
}
@supports selector(::-webkit-scrollbar) {
  .paste-candidates,
  .paste-source :deep(textarea) {
    scrollbar-width: auto;
  }
  .paste-candidates::-webkit-scrollbar,
  .paste-source :deep(textarea::-webkit-scrollbar) {
    width: 6px;
    height: 6px;
  }
  .paste-candidates::-webkit-scrollbar-thumb,
  .paste-source :deep(textarea::-webkit-scrollbar-thumb) {
    background: var(--control-line);
    border-radius: 0;
  }
  .paste-candidates::-webkit-scrollbar-track,
  .paste-source :deep(textarea::-webkit-scrollbar-track),
  .paste-candidates::-webkit-scrollbar-corner,
  .paste-source :deep(textarea::-webkit-scrollbar-corner) {
    background: transparent;
  }
}
</style>
<style scoped>
.paste-options {
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--ui-border);
  background: var(--panel);
}
.paste-actions {
  margin-bottom: 0;
}
</style>

<style scoped>
.account-choice {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  overflow-wrap: anywhere;
}
</style>
