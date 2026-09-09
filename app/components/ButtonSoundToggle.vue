<script setup lang="ts">
const { tx } = useMessages()
const enabled = shallowRef(false)
const ready = shallowRef(false)
const player = useTemplateRef<HTMLAudioElement>('player')
const toast = useTemplateRef<HTMLAudioElement>('toast')
const experience = useTemplateRef<HTMLAudioElement>('experience')
const preferenceKey = '2fa-hot:button-sound'
type Sound = 'click' | 'experience' | 'toast'
let context: AudioContext | undefined
let gain: GainNode | undefined
const buffers = new Map<Sound, AudioBuffer>()
const voices = new Set<AudioBufferSourceNode>()
const loading = new AbortController()
let prepared = false
let disposed = false

function prepare() {
  if (prepared || disposed || !enabled.value) return
  prepared = true
  try {
    context = new AudioContext({ latencyHint: 'interactive' })
    gain = context.createGain()
    gain.gain.value = 0.35
    gain.connect(context.destination)
    const audioContext = context
    for (const kind of ['click', 'experience', 'toast'] as const) {
      void fetch(`/audio/minecraft-${kind}.ogg`, { signal: loading.signal })
        .then((response) => {
          if (!response.ok) throw new Error('Audio unavailable')
          return response.arrayBuffer()
        })
        .then((data) => audioContext.decodeAudioData(data))
        .then((buffer) => {
          if (!disposed) buffers.set(kind, buffer)
        })
        .catch(() => {
          /* The preloaded audio element remains the fallback. */
        })
    }
  } catch {
    /* Older browsers use the audio elements below. */
  }
}
function unlock() {
  if (!enabled.value) return
  prepare()
  if (context?.state === 'suspended') void context.resume().catch(() => {})
}
function stop() {
  for (const voice of voices) {
    voice.stop()
    voice.disconnect()
  }
  voices.clear()
  player.value?.pause()
  experience.value?.pause()
  toast.value?.pause()
}
function play(kind: Sound = 'click') {
  if (!enabled.value || disposed) return
  unlock()
  const buffer = buffers.get(kind)
  if (context && gain && buffer && context.state !== 'closed') {
    // A fresh source avoids media-element seek latency and supports rapid taps.
    if (voices.size >= 4) {
      const oldest = voices.values().next().value
      oldest?.stop()
      if (oldest) voices.delete(oldest)
    }
    const voice = context.createBufferSource()
    voice.buffer = buffer
    const voiceGain = context.createGain()
    voiceGain.gain.value = kind === 'toast' ? 0.75 / 0.35 : 1
    voice.connect(voiceGain)
    voiceGain.connect(gain)
    voice.onended = () => {
      voices.delete(voice)
      voice.disconnect()
      voiceGain.disconnect()
    }
    voices.add(voice)
    voice.start()
    return
  }
  const fallback =
    kind === 'toast' ? toast.value : kind === 'experience' ? experience.value : player.value
  if (fallback) {
    fallback.currentTime = 0
    void fallback.play().catch(() => {})
  }
}
function scriptedSound(event: Event) {
  const kind = (event as CustomEvent).detail
  play(kind === 'toast' || kind === 'experience' ? kind : 'click')
}
function toggle() {
  enabled.value = !enabled.value
  try {
    localStorage.setItem(preferenceKey, enabled.value ? 'on' : 'off')
  } catch {
    /* In-memory preference still works. */
  }
  if (enabled.value) {
    prepare()
    play()
  } else stop()
}
function controlFor(target: EventTarget | null) {
  if (!(target instanceof Element)) return null
  const control = target.closest(
    'button, a[href], [role="button"], [role="tab"], [role="menuitem"], [role="menuitemcheckbox"]'
  )
  return control &&
    !control.closest('[data-sound-toggle], [data-sound-custom], [disabled], [aria-disabled="true"]')
    ? control
    : null
}
let touch: { id: number; x: number; y: number; control: Element; moved: boolean } | undefined
let lastPointer: { control: Element; at: number } | undefined
function pointerSound(control: Element) {
  play()
  lastPointer = { control, at: performance.now() }
}
function handlePointerDown(event: PointerEvent) {
  if (!event.isTrusted || event.button !== 0 || !event.isPrimary) return
  unlock()
  const control = controlFor(event.target)
  if (!control || !enabled.value) return
  if (event.pointerType === 'touch')
    touch = { id: event.pointerId, x: event.clientX, y: event.clientY, control, moved: false }
  else pointerSound(control)
}
function handlePointerMove(event: PointerEvent) {
  if (
    touch?.id === event.pointerId &&
    Math.hypot(event.clientX - touch.x, event.clientY - touch.y) > 10
  )
    touch.moved = true
}
function handlePointerUp(event: PointerEvent) {
  if (touch?.id !== event.pointerId) return
  const press = touch
  touch = undefined
  if (!press.moved && controlFor(event.target) === press.control) pointerSound(press.control)
}
function cancelPointer() {
  touch = undefined
}
function handleClick(event: MouseEvent) {
  if (!event.isTrusted || !enabled.value) return
  const control = controlFor(event.target)
  if (!control) return
  if (
    event.detail > 0 &&
    lastPointer?.control === control &&
    performance.now() - lastPointer.at < 1000
  ) {
    lastPointer = undefined
    return
  }
  play()
}
function handleKey(event: KeyboardEvent) {
  if (event.isTrusted) unlock()
}
function syncPreference(event: StorageEvent) {
  if (event.key !== preferenceKey && event.key !== null) return
  enabled.value = event.key !== null && event.newValue === 'on'
  if (enabled.value) prepare()
  else stop()
}
onMounted(() => {
  try {
    enabled.value = localStorage.getItem(preferenceKey) === 'on'
  } catch {
    enabled.value = false
  }
  ready.value = true
  if (player.value) player.value.volume = 0.35
  if (experience.value) experience.value.volume = 0.35
  if (toast.value) toast.value.volume = 0.75
  prepare()
  document.addEventListener('pointerdown', handlePointerDown, { capture: true, passive: true })
  document.addEventListener('pointermove', handlePointerMove, { capture: true, passive: true })
  document.addEventListener('pointerup', handlePointerUp, { capture: true, passive: true })
  document.addEventListener('pointercancel', cancelPointer, true)
  document.addEventListener('keydown', handleKey, true)
  document.addEventListener('click', handleClick, true)
  window.addEventListener('storage', syncPreference)
  window.addEventListener('2fa-ui-sound', scriptedSound)
})
onBeforeUnmount(() => {
  disposed = true
  loading.abort()
  stop()
  if (context) void context.close().catch(() => {})
  document.removeEventListener('pointerdown', handlePointerDown, true)
  document.removeEventListener('pointermove', handlePointerMove, true)
  document.removeEventListener('pointerup', handlePointerUp, true)
  document.removeEventListener('pointercancel', cancelPointer, true)
  document.removeEventListener('keydown', handleKey, true)
  document.removeEventListener('click', handleClick, true)
  window.removeEventListener('storage', syncPreference)
  window.removeEventListener('2fa-ui-sound', scriptedSound)
})
</script>

<template>
  <UButton
    class="icon-button"
    data-sound-toggle
    color="neutral"
    variant="ghost"
    :icon="enabled ? 'i-lucide-volume-2' : 'i-lucide-volume-x'"
    :aria-pressed="enabled"
    :aria-label="tx('按钮音效')"
    :title="tx(enabled ? '关闭按钮音效' : '开启按钮音效')"
    @click="toggle"
  />
  <audio
    ref="player"
    src="/audio/minecraft-click.ogg"
    :preload="ready && enabled ? 'auto' : 'none'"
    aria-hidden="true"
  />
  <audio
    ref="experience"
    src="/audio/minecraft-experience.ogg"
    :preload="ready && enabled ? 'auto' : 'none'"
    aria-hidden="true"
  />
  <audio
    ref="toast"
    src="/audio/minecraft-toast.ogg"
    :preload="ready && enabled ? 'auto' : 'none'"
    aria-hidden="true"
  />
</template>
