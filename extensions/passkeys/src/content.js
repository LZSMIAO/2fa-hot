;(() => {
  const namespace = '2fa.hot/passkeys/v1',
    active = new Map()
  const reply = (id, value) =>
    window.postMessage({ namespace, direction: 'response', id, ...value }, location.origin)
  window.addEventListener('message', async (event) => {
    const data = event.data
    if (
      event.source !== window ||
      event.origin !== location.origin ||
      data?.namespace !== namespace ||
      typeof data.id !== 'string'
    )
      return
    if (data.direction === 'cancel') {
      const token = active.get(data.id)
      active.delete(data.id)
      if (token) chrome.runtime.sendMessage({ action: 'cancel', token }).catch(() => {})
      return
    }
    if (data.direction !== 'request') return
    if (
      !['create', 'get'].includes(data.kind) ||
      !window.isSecureContext ||
      window.top !== window ||
      document.featurePolicy?.allowsFeature(`publickey-credentials-${data.kind}`) === false
    ) {
      reply(data.id, { fallback: true })
      return
    }
    if (active.size) {
      reply(data.id, { fallback: true })
      return
    }
    active.set(data.id, null)
    try {
      const result = await chrome.runtime.sendMessage({
        action: 'begin',
        kind: data.kind,
        options: data.options
      })
      if (!active.has(data.id)) {
        if (result.token)
          chrome.runtime.sendMessage({ action: 'cancel', token: result.token }).catch(() => {})
        return
      }
      if (!result.token) {
        reply(data.id, { fallback: true })
        return
      }
      active.set(data.id, result.token)
      while (active.has(data.id)) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        const status = await chrome.runtime.sendMessage({ action: 'poll', token: result.token })
        if (status.done) {
          reply(data.id, status.result)
          break
        }
      }
    } catch {
      reply(data.id, { fallback: true })
    } finally {
      active.delete(data.id)
    }
  })
  window.addEventListener('pagehide', () => {
    for (const token of active.values())
      if (token) chrome.runtime.sendMessage({ action: 'cancel', token }).catch(() => {})
    active.clear()
  })
})()
