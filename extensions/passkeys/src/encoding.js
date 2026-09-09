export const utf8 = (value) => new TextEncoder().encode(value)
export function encode(value) {
  const bytes = new Uint8Array(value)
  let text = ''
  for (let i = 0; i < bytes.length; i += 8192)
    text += String.fromCharCode(...bytes.subarray(i, i + 8192))
  return btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
export function decode(value, max = 1000000) {
  if (typeof value !== 'string' || value.length > max * 2 || !/^[A-Za-z0-9_-]*$/.test(value))
    throw new Error('凭据编码不正确。')
  const bytes = Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), (c) =>
    c.charCodeAt(0)
  )
  if (bytes.length > max || encode(bytes) !== value) throw new Error('凭据编码不正确。')
  return bytes
}
export const random = (size) => crypto.getRandomValues(new Uint8Array(size))
export function concat(...values) {
  const result = new Uint8Array(values.reduce((n, v) => n + v.length, 0))
  let offset = 0
  for (const value of values) {
    result.set(value, offset)
    offset += value.length
  }
  return result
}
export function cbor(value) {
  const head = (major, n) =>
    n < 24
      ? Uint8Array.of(major * 32 + n)
      : n < 256
        ? Uint8Array.of(major * 32 + 24, n)
        : Uint8Array.of(major * 32 + 25, n >> 8, n & 255)
  if (typeof value === 'number') return value < 0 ? head(1, -1 - value) : head(0, value)
  if (typeof value === 'string') {
    const b = utf8(value)
    return concat(head(3, b.length), b)
  }
  if (value instanceof Uint8Array) return concat(head(2, value.length), value)
  const entries = value instanceof Map ? [...value] : Object.entries(value)
  return concat(head(5, entries.length), ...entries.flatMap(([k, v]) => [cbor(k), cbor(v)]))
}
export function derSignature(raw) {
  const b = new Uint8Array(raw)
  if (b.length !== 64) throw new Error('签名格式不正确。')
  const integer = (v) => {
    while (v.length > 1 && v[0] === 0) v = v.slice(1)
    if (v[0] & 128) v = concat(Uint8Array.of(0), v)
    return concat(Uint8Array.of(2, v.length), v)
  }
  const body = concat(integer(b.slice(0, 32)), integer(b.slice(32)))
  return concat(Uint8Array.of(48, body.length), body)
}
