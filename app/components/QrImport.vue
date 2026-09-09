<script setup lang="ts">
const clipboardHint = useClipboardHint()
import { decodeQrImage } from '~/utils/qr-image'
import { isMigrationUri } from '~/utils/ga-migration'
const { tx } = useMessages()
import { parseOtp, toOtpUri } from '~/utils/otp'
const emit = defineEmits<{
  close: []
  import: [value: string]
  batch: [value: string]
  migration: [value: string]
}>()
const open = shallowRef(true),
  issue = shallowRef(''),
  scanning = shallowRef(false),
  processing = shallowRef(false)
const choices = shallowRef<string[]>([]),
  facing = shallowRef<'environment' | 'user'>('environment')
const video = useTemplateRef<HTMLVideoElement>('video'),
  input = useTemplateRef<HTMLInputElement>('file')
let stream: MediaStream | undefined,
  timer: ReturnType<typeof setTimeout> | undefined,
  active = true
let pendingResult: { kind: 'import' | 'batch' | 'migration'; value: string } | undefined
function finishClose() {
  if (pendingResult?.kind === 'import') emit('import', pendingResult.value)
  if (pendingResult?.kind === 'batch') emit('batch', pendingResult.value)
  if (pendingResult?.kind === 'migration') emit('migration', pendingResult.value)
  pendingResult = undefined
  emit('close')
}
function stop() {
  clearTimeout(timer)
  stream?.getTracks().forEach((t) => t.stop())
  stream = undefined
  scanning.value = false
}
function openMigration(value = '') {
  pendingResult = { kind: 'migration', value }
  open.value = false
}
function accept(value: string) {
  if (isMigrationUri(value)) {
    openMigration(value)
    return
  }
  try {
    const c = parseOtp(value)
    if (!value.startsWith('otpauth://')) throw new Error('二维码不是 TOTP 配置。')
    pendingResult = { kind: 'import', value: toOtpUri(c) }
    open.value = false
  } catch (e) {
    issue.value = (e as Error).message
  }
}
async function image(file?: File) {
  if (!file || processing.value || !open.value || !active) return
  stop()
  issue.value = ''
  choices.value = []
  processing.value = true
  try {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 10_000_000)
      throw new Error('请选择 10MB 以内的 PNG、JPEG 或 WebP 图片。')
    const bitmap = await createImageBitmap(file)
    try {
      if (bitmap.width * bitmap.height > 16_000_000)
        throw new Error('图片尺寸过大，请裁剪二维码后重试。')
      const values = await decodeQrImage(bitmap, bitmap.width, bitmap.height, true)
      if (active) {
        if (values.length === 1) accept(values[0]!)
        else if (values.length > 1) choices.value = values
        else issue.value = '未识别到二维码，请换一张清晰图片。'
      }
    } finally {
      bitmap.close()
    }
  } catch (e) {
    issue.value = (e as Error).message
  } finally {
    processing.value = false
    if (input.value) input.value.value = ''
  }
}
function pastedImage(event: ClipboardEvent) {
  if (!open.value || !active) return
  const file = Array.from(event.clipboardData?.items || [])
    .find((item) => item.kind === 'file' && item.type.startsWith('image/'))
    ?.getAsFile()
  if (!file) return
  event.preventDefault()
  void image(file)
}
async function pasteImage() {
  if (processing.value || !open.value) return
  issue.value = ''
  await clipboardHint.start()
  if (!active || !open.value) return
  try {
    const items = await navigator.clipboard.read()
    clipboardHint.finish(true)
    if (!active || !open.value) return
    for (const item of items) {
      const type = item.types.find((type) =>
        ['image/png', 'image/jpeg', 'image/webp'].includes(type)
      )
      if (type) {
        const blob = await item.getType(type)
        await image(new File([blob], 'clipboard-image', { type }))
        return
      }
    }
    issue.value = '剪贴板中没有图片。'
  } catch {
    clipboardHint.finish(false)
    if (active && open.value) issue.value = '无法读取剪贴板，请使用系统粘贴。'
  }
}
async function scan() {
  if (!active || !stream || !video.value) return
  try {
    if (video.value.readyState >= 2) {
      const found = await decodeQrImage(
        video.value,
        video.value.videoWidth,
        video.value.videoHeight
      )
      if (found.length) {
        stop()
        accept(found[0]!)
        return
      }
    }
  } catch {
    issue.value = '暂时无法识别，请尝试图片导入。'
    stop()
    return
  }
  timer = setTimeout(scan, 200)
}
async function camera() {
  stop()
  issue.value = ''
  try {
    const media = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: facing.value } },
      audio: false
    })
    if (!active || !open.value) {
      media.getTracks().forEach((t) => t.stop())
      return
    }
    stream = media
    scanning.value = true
    await nextTick()
    if (video.value) {
      video.value.srcObject = media
      await video.value.play()
      scan()
    }
  } catch {
    issue.value = '未获得摄像头权限或摄像头不可用，可选择二维码图片。'
    stop()
  }
}
function switchCamera() {
  facing.value = facing.value === 'environment' ? 'user' : 'environment'
  return camera()
}
function importAll() {
  if (choices.value.some(isMigrationUri)) {
    openMigration(choices.value.join('\n'))
    return
  }
  const valid = choices.value.filter((value) => {
    try {
      return value.startsWith('otpauth://') && !!parseOtp(value)
    } catch {
      return false
    }
  })
  if (!valid.length) {
    issue.value = '没有可导入的 TOTP 配置。'
    return
  }
  pendingResult = { kind: 'batch', value: valid.join('\n') }
  open.value = false
}
function choiceLabel(value: string, index: number) {
  if (isMigrationUri(value)) return `Google Authenticator · QR ${index + 1}`
  try {
    const c = parseOtp(value)
    return c.label || c.issuer || tx('二维码 {count}', { count: index + 1 })
  } catch {
    return tx('二维码 {count}（格式不支持）', { count: index + 1 })
  }
}
function hidden() {
  if (document.hidden) stop()
}
watch(open, (v) => {
  if (!v) {
    stop()
  }
})
onMounted(() => {
  document.addEventListener('visibilitychange', hidden)
  document.addEventListener('paste', pastedImage)
})
onBeforeUnmount(() => {
  active = false
  stop()
  document.removeEventListener('visibilitychange', hidden)
  document.removeEventListener('paste', pastedImage)
})
</script>
<template>
  <UModal
    v-model:open="open"
    @after:leave="finishClose"
    :title="tx('导入二维码')"
    :description="tx('识别在此设备完成，图片不会上传。')"
    ><template #body
      ><div class="modal-stack">
        <UContextMenu
          :items="[
            {
              label: tx('粘贴'),
              icon: 'i-lucide-clipboard-paste',
              disabled: processing,
              onSelect: pasteImage
            }
          ]"
        >
          <div
            class="drop-zone"
            @dragover.prevent
            @drop.prevent="image($event.dataTransfer?.files[0])"
          >
            <UIcon name="i-lucide-scan-line" class="text-3xl text-muted" />
            <p>{{ tx('将二维码图片拖到这里') }}</p>
            <UButton
              variant="outline"
              color="neutral"
              :loading="processing"
              @click="input?.click()"
              >{{ tx('选择图片') }}</UButton
            >
            <UButton
              variant="outline"
              color="neutral"
              icon="i-lucide-clipboard-paste"
              :disabled="processing"
              @click="pasteImage"
              >{{ tx('粘贴') }}</UButton
            >
            <span>{{ tx('PNG、JPEG、WebP · 最大 10MB') }}</span
            ><input
              ref="file"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              class="sr-only"
              :aria-label="tx('选择二维码图片')"
              @change="image(($event.target as HTMLInputElement).files?.[0])"
            />
          </div>
        </UContextMenu>
        <div v-if="choices.length" class="modal-stack">
          <p>{{ tx('识别到二维码：{count}，请选择配置。', { count: choices.length }) }}</p>
          <UButton
            v-for="(choice, index) in choices"
            :key="index"
            color="neutral"
            variant="outline"
            @click="accept(choice)"
            >{{ choiceLabel(choice, index) }}</UButton
          ><UButton class="primary-button" @click="importAll">{{
            tx('将有效配置加入批量取码')
          }}</UButton>
        </div>
        <video
          v-if="scanning"
          ref="video"
          autoplay
          muted
          playsinline
          class="camera-preview"
        /><UButton
          v-if="scanning"
          color="neutral"
          variant="outline"
          icon="i-lucide-switch-camera"
          @click="switchCamera"
          >{{ tx('切换摄像头') }}</UButton
        >
        <UButton color="neutral" variant="outline" icon="i-lucide-import" @click="openMigration()"
          >Google Authenticator · {{ tx('导入') }}</UButton
        >
        <ActionHint
          :open="clipboardHint.visible.value"
          :message="tx('如果浏览器询问剪贴板权限，请点允许。')"
          icon="i-lucide-clipboard-paste"
          @close="clipboardHint.visible.value = false"
        />
        <p v-if="issue" class="inline-error" role="alert">{{ tx(issue) }}</p>
        <UButton
          color="neutral"
          variant="ghost"
          :icon="scanning ? 'i-lucide-camera-off' : 'i-lucide-camera'"
          @click="scanning ? stop() : camera()"
          >{{ tx(scanning ? '关闭摄像头' : '使用摄像头扫描') }}</UButton
        >
      </div></template
    ></UModal
  >
</template>
<style scoped>
.drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 32px 20px;
  border: 1px dashed var(--control-line);
  border-radius: var(--ui-radius);
  background: var(--wash);
}
.drop-zone span {
  font-size: var(--text-caption);
  color: var(--ui-text-muted);
}
.camera-preview {
  width: 100%;
  max-height: 260px;
  background: black;
  border-radius: var(--ui-radius);
}
</style>

<style scoped>
.clipboard-permission-notice {
  color: var(--accent-ink);
  font-weight: 600;
}
</style>
