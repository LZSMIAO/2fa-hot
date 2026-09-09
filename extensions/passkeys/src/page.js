// Only public WebAuthn request/response data crosses this page-world bridge.
;(() => {
  if (!window.isSecureContext || window.top !== window || !navigator.credentials) return
  const nativeCreate = navigator.credentials.create.bind(navigator.credentials)
  const nativeGet = navigator.credentials.get.bind(navigator.credentials)
  const namespace = '2fa.hot/passkeys/v1'
  const b64 = (v) => {
    if (!(v instanceof ArrayBuffer) && !ArrayBuffer.isView(v))
      throw new TypeError('Expected BufferSource')
    const bytes = ArrayBuffer.isView(v)
      ? new Uint8Array(v.buffer, v.byteOffset, v.byteLength)
      : new Uint8Array(v)
    if (bytes.length > 2048) throw new TypeError('Buffer too large')
    return btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }
  const binary = (v) =>
    Uint8Array.from(atob(v.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)).buffer
  function hydrate(value) {
    const registration = 'attestationObject' in value.response
    const response = Object.create(
      registration
        ? AuthenticatorAttestationResponse.prototype
        : AuthenticatorAssertionResponse.prototype
    )
    for (const [key, v] of Object.entries(value.response)) {
      if (key === 'transports' || key === 'publicKeyAlgorithm') continue
      Object.defineProperty(response, key, {
        value: v === null ? null : binary(v),
        enumerable: true
      })
    }
    if (registration)
      Object.defineProperties(response, {
        getTransports: { value: () => [...value.response.transports] },
        getPublicKey: { value: () => binary(value.response.publicKey) },
        getPublicKeyAlgorithm: { value: () => -7 },
        getAuthenticatorData: { value: () => binary(value.response.authenticatorData) }
      })
    const credential = Object.create(PublicKeyCredential.prototype)
    Object.defineProperties(credential, {
      id: { value: value.id, enumerable: true },
      rawId: { value: binary(value.rawId), enumerable: true },
      type: { value: 'public-key', enumerable: true },
      authenticatorAttachment: { value: value.authenticatorAttachment, enumerable: true },
      response: { value: response, enumerable: true },
      getClientExtensionResults: { value: () => structuredClone(value.clientExtensionResults) },
      toJSON: { value: () => structuredClone(value) }
    })
    return credential
  }
  function request(kind, options) {
    const native = kind === 'create' ? nativeCreate : nativeGet
    if (
      !options?.publicKey ||
      options.mediation === 'conditional' ||
      options.mediation === 'silent'
    )
      return native(options)
    if (options.signal?.aborted)
      return Promise.reject(new DOMException('Request aborted', 'AbortError'))
    let serialized
    try {
      const p = options.publicKey
      serialized = { ...p, challenge: b64(p.challenge) }
      if (p.user) serialized.user = { ...p.user, id: b64(p.user.id) }
      for (const field of ['excludeCredentials', 'allowCredentials'])
        if (p[field]) serialized[field] = p[field].map((d) => ({ ...d, id: b64(d.id) }))
      if (JSON.stringify(serialized).length > 64000) return native(options)
    } catch {
      return native(options)
    }
    const id = crypto.randomUUID()
    return new Promise((resolve, reject) => {
      let done = false
      const cleanup = () => {
        done = true
        clearTimeout(timer)
        window.removeEventListener('message', receive)
        options.signal?.removeEventListener('abort', abort)
      }
      const cancel = () =>
        window.postMessage({ namespace, direction: 'cancel', id }, location.origin)
      const abort = () => {
        if (done) return
        cleanup()
        cancel()
        reject(new DOMException('Request aborted', 'AbortError'))
      }
      const timer = setTimeout(
        () => {
          if (done) return
          cleanup()
          cancel()
          reject(new DOMException('Request timed out', 'NotAllowedError'))
        },
        Math.min(120000, Math.max(15000, options.publicKey.timeout || 120000))
      )
      const receive = (event) => {
        const data = event.data
        if (
          event.source !== window ||
          event.origin !== location.origin ||
          data?.namespace !== namespace ||
          data.direction !== 'response' ||
          data.id !== id ||
          done
        )
          return
        cleanup()
        if (data.fallback) {
          resolve(native(options))
          return
        }
        if (data.error) {
          reject(new DOMException(data.error, 'NotAllowedError'))
          return
        }
        try {
          resolve(hydrate(data.value))
        } catch {
          reject(new DOMException('Invalid credential response', 'UnknownError'))
        }
      }
      window.addEventListener('message', receive)
      options.signal?.addEventListener('abort', abort, { once: true })
      window.postMessage(
        { namespace, direction: 'request', id, kind, options: serialized },
        location.origin
      )
    })
  }
  navigator.credentials.create = (options) => request('create', options)
  navigator.credentials.get = (options) => request('get', options)
})()
