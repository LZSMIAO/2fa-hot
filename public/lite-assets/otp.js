/* Lite's ES5 compatibility layer. Cryptographic primitives are provided by jsSHA. */
;(function (root) {
  'use strict'
  function fail(code) {
    throw new Error(code)
  }
  function trim(s) {
    return String(s).replace(/^\s+|\s+$/g, '')
  }
  function params(text) {
    var out = {},
      entries = text ? text.split('&') : [],
      i,
      pair,
      key,
      value
    for (i = 0; i < entries.length; i++) {
      pair = entries[i].split('=')
      try {
        key = decodeURIComponent(pair.shift().replace(/\+/g, ' '))
        value = decodeURIComponent(pair.join('=').replace(/\+/g, ' '))
      } catch (e) {
        fail('invalid')
      }
      if (
        key !== 'secret' &&
        key !== 'algorithm' &&
        key !== 'digits' &&
        key !== 'period' &&
        key !== 'issuer'
      )
        fail('unsupported')
      if (Object.prototype.hasOwnProperty.call(out, key)) fail('duplicate')
      if (!value) fail('parameters')
      out[key] = value
    }
    return out
  }
  function base32(raw) {
    var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
      compact = raw.toUpperCase().replace(/[ \t]/g, ''),
      secret = compact.replace(/=+$/, ''),
      bits = 0,
      acc = 0,
      hex = '',
      i,
      v,
      padding = compact.length - secret.length
    if (!/^[A-Z2-7]+={0,6}$/.test(compact) || secret.length < 16 || secret.length > 2048)
      fail('secret')
    if (secret.length % 8 === 1 || secret.length % 8 === 3 || secret.length % 8 === 6)
      fail('secret')
    if (padding && (compact.length % 8 || padding !== (8 - (secret.length % 8)) % 8)) fail('secret')
    for (i = 0; i < secret.length; i++) {
      acc = (acc << 5) | alphabet.indexOf(secret.charAt(i))
      bits += 5
      if (bits >= 8) {
        bits -= 8
        v = (acc >>> bits) & 255
        hex += ('0' + v.toString(16)).slice(-2)
      }
      acc &= (1 << bits) - 1
    }
    if (bits && acc !== 0) fail('secret')
    return { secret: secret, hex: hex }
  }
  function parse(raw, defaults) {
    var input = trim(raw),
      p = {},
      match,
      query,
      decoded,
      algorithm,
      digits,
      period
    defaults = defaults || {}
    if (!input || input.length > 8192) fail('secret')
    if (/[\r\n]/.test(input)) fail('multiple')
    if (/^otpauth:/i.test(input)) {
      match = /^otpauth:\/\/totp\/([^?#]+)\?([^#]+)$/i.exec(input)
      if (!match) fail('unsupported')
      defaults = {}
      p = params(match[2])
      input = p.secret || ''
    } else if (/^(?:https?:|\/|#)/i.test(input)) {
      // Only fragment links from this application; path secrets are never navigated to.
      match =
        /^(?:(?:https?:\/\/(?:2fa\.hot|www\.2fa\.hot|localhost(?::\d+)?|127\.0\.0\.1(?::\d+)?))?(?:\/(?:[a-z]{2}(?:-[A-Za-z]{2})?\/)?(?:2fa|lite(?:\/code)?)\/?))?#([^#]+)$/.exec(
          input
        )
      if (!match) fail('unsupported')
      defaults = {}
      query = match[1].split('?')
      if (query.length > 2) fail('invalid')
      try {
        input = decodeURIComponent(query[0])
      } catch (e) {
        fail('invalid')
      }
      p = params(query[1] || '')
      if (p.secret) fail('duplicate')
    }
    decoded = base32(input)
    algorithm = String(
      p.algorithm || (defaults.algorithm !== undefined ? defaults.algorithm : 'SHA-1')
    )
      .toUpperCase()
      .replace(/^SHA(1|256|512)$/, 'SHA-$1')
    digits = Number(p.digits || (defaults.digits !== undefined ? defaults.digits : 6))
    period = Number(p.period || (defaults.period !== undefined ? defaults.period : 30))
    if (algorithm !== 'SHA-1' && algorithm !== 'SHA-256' && algorithm !== 'SHA-512')
      fail('unsupported')
    if ((digits !== 6 && digits !== 8) || period % 1 || period < 15 || period > 120)
      fail('parameters')
    return {
      secret: decoded.secret,
      hex: decoded.hex,
      algorithm: algorithm,
      digits: digits,
      period: period
    }
  }
  function code(config, time) {
    var counter = Math.floor(time / 1000 / config.period),
      hex = counter.toString(16),
      sha,
      digest,
      offset,
      number
    while (hex.length < 16) hex = '0' + hex
    sha = new root.jsSHA(config.algorithm, 'HEX')
    sha.setHMACKey(config.hex, 'HEX')
    sha.update(hex)
    digest = sha.getHMAC('HEX')
    offset = parseInt(digest.slice(-1), 16) * 2
    number = (parseInt(digest.substr(offset, 8), 16) & 0x7fffffff) % Math.pow(10, config.digits)
    return ('00000000' + number).slice(-config.digits)
  }
  function fragment(c) {
    return (
      '#' +
      c.secret +
      '?algorithm=' +
      c.algorithm.replace('-', '') +
      '&digits=' +
      c.digits +
      '&period=' +
      c.period
    )
  }
  root.LiteOTP = { parse: parse, code: code, fragment: fragment }
})(typeof window !== 'undefined' ? window : this)
