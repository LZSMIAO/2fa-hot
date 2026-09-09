/* ES5 only: this page intentionally does not load the modern app runtime. */
;(function () {
  'use strict'
  var messages = {
    en: {
      title: 'Your code. Nothing extra.',
      intro: 'Local 2FA codes. No animation, sound or account required.',
      secretLabel: 'Secret or otpauth:// link',
      hint: 'One Base32 secret at a time. Spaces between groups are supported.',
      reveal: 'Show secret',
      algorithm: 'Algorithm',
      digits: 'Digits',
      period: 'Period (seconds)',
      generate: 'Get code',
      clear: 'Clear',
      current: 'Current code',
      copy: 'Copy code',
      link: 'Copy link',
      manual: 'Select and copy manually',
      privacy:
        'Secrets stay in this browser. No history is saved. Shared links still contain your secret; keep them private.',
      full: 'Full version',
      left: 'Next code in {n}s',
      copied: 'Copied.',
      secret: 'Enter one complete Base32 secret.',
      multiple: 'Use one secret at a time. Multiple lines are not supported in Lite.',
      invalid: 'The link is not valid.',
      unsupported:
        'Use a Base32 secret, a TOTP URI or a 2fa.hot fragment link. This format is not supported.',
      duplicate: 'The link contains duplicate parameters.',
      parameters: 'Use SHA-1/256/512, 6 or 8 digits, and a period from 15 to 120 seconds.',
      unavailable: 'The code engine could not load. Reload this page to try again.',
      query: 'Use a # fragment for secrets, not URL path or query parameters.'
    },
    'zh-TW': {
      title: '取碼，就這麼簡單。',
      intro: '本地取碼。沒有動畫、音效，也不需要帳號。',
      secretLabel: '密鑰或 otpauth:// 連結',
      hint: '一次輸入一條 Base32 密鑰，可保留分組空格。',
      reveal: '顯示密鑰',
      algorithm: '演算法',
      digits: '位數',
      period: '週期（秒）',
      generate: '取得驗證碼',
      clear: '清空',
      current: '目前驗證碼',
      copy: '複製驗證碼',
      link: '複製連結',
      manual: '請選取後手動複製',
      privacy: '密鑰在此瀏覽器內處理，不儲存歷史紀錄。分享連結仍含密鑰，請妥善保管。',
      full: '完整版本',
      left: '{n} 秒後更新',
      copied: '已複製。',
      secret: '請輸入一條完整的 Base32 密鑰。',
      multiple: 'Lite 一次處理一條密鑰，不支援多行輸入。',
      invalid: '連結格式不正確。',
      unsupported: '請使用 Base32 密鑰、TOTP 設定連結或 2fa.hot 片段連結；此格式不受支援。',
      duplicate: '連結包含重複參數。',
      parameters: '請使用 SHA-1/256/512、6 或 8 位，以及 15 至 120 秒的週期。',
      unavailable: '取碼元件未能載入，請重新整理後再試。',
      query: '請用 # 片段放置密鑰，不要放在網址路徑或查詢參數中。'
    },
    'zh-CN': {
      title: '取码，就这么简单。',
      intro: '本地取码。没有动画、音效，也不需要账号。',
      secretLabel: '密钥或 otpauth:// 链接',
      hint: '一次输入一条 Base32 密钥，可保留分组空格。',
      reveal: '显示密钥',
      algorithm: '算法',
      digits: '位数',
      period: '周期（秒）',
      generate: '获取验证码',
      clear: '清空',
      current: '当前验证码',
      copy: '复制验证码',
      link: '复制链接',
      manual: '请选择后手动复制',
      privacy: '密钥在此浏览器内处理，不储存历史记录。分享链接仍含密钥，请妥善保管。',
      full: '完整版本',
      left: '{n} 秒后更新',
      copied: '已复制。',
      secret: '请输入一条完整的 Base32 密钥。',
      multiple: 'Lite 一次处理一条密钥，不支持多行输入。',
      invalid: '链接格式不正确。',
      unsupported: '请使用 Base32 密钥、TOTP 配置链接或 2fa.hot 片段链接；不支持此格式。',
      duplicate: '链接包含重复参数。',
      parameters: '请使用 SHA-1/256/512、6 或 8 位，以及 15 至 120 秒的周期。',
      unavailable: '取码组件未能加载，请刷新后重试。',
      query: '请用 # 片段放置密钥，不要放在网址路径或查询参数中。'
    }
  }
  var config = null,
    lastStep = -1,
    currentCode = '',
    locale = 'en',
    errorKey = '',
    statusKey = '',
    secretInput = document.getElementById('secret')
  function el(id) {
    return document.getElementById(id)
  }
  function text(id, value) {
    el(id).textContent = value
  }
  function language(value) {
    return /^zh/i.test(value) ? (/TW|HK|MO|Hant/i.test(value) ? 'zh-TW' : 'zh-CN') : 'en'
  }
  function translate() {
    var nodes = document.querySelectorAll('[data-text]'),
      buttons = document.querySelectorAll('[data-lang]'),
      i
    document.documentElement.lang = locale
    for (i = 0; i < nodes.length; i++)
      nodes[i].textContent = messages[locale][nodes[i].getAttribute('data-text')]
    for (i = 0; i < buttons.length; i++)
      buttons[i].setAttribute(
        'aria-pressed',
        buttons[i].getAttribute('data-lang') === locale ? 'true' : 'false'
      )
    text('full', messages[locale].full)
    el('full').href = locale === 'en' ? '/' : '/' + locale
    el('code').setAttribute('aria-label', messages[locale].current)
    text('error', errorKey ? messages[locale][errorKey] || messages[locale].invalid : '')
    text('status', statusKey ? messages[locale][statusKey] : '')
    tick()
  }
  function reset() {
    config = null
    lastStep = -1
    currentCode = ''
    el('code').value = '------'
    text('countdown', '—')
    el('copy').disabled = true
    el('link').disabled = true
    errorKey = ''
    statusKey = ''
    text('error', '')
    text('status', '')
    el('manual').style.display = 'none'
    el('copy-value').value = ''
  }
  function error(key) {
    errorKey = messages[locale][key] ? key : 'invalid'
    text('error', messages[locale][errorKey])
  }
  function tick() {
    if (!config) return
    var now = new Date().getTime(),
      step = Math.floor(now / 1000 / config.period)
    try {
      if (step !== lastStep) {
        currentCode = window.LiteOTP.code(config, now)
        el('code').value = currentCode
        lastStep = step
      }
      text(
        'countdown',
        messages[locale].left.replace(
          '{n}',
          config.period - (Math.floor(now / 1000) % config.period)
        )
      )
    } catch (e) {
      reset()
      error('unavailable')
    }
  }
  function generate() {
    reset()
    try {
      config = window.LiteOTP.parse(secretInput.value, {
        algorithm: el('algorithm').value,
        digits: el('digits').value,
        period: el('period').value
      })
      secretInput.value = config.secret
      el('algorithm').value = config.algorithm
      el('digits').value = String(config.digits)
      el('period').value = String(config.period)
      tick()
      el('copy').disabled = !config
      el('link').disabled = !config
    } catch (e) {
      reset()
      error(e.message)
    }
  }
  function copy(value) {
    var ok = false,
      field = el('copy-value')
    // execCommand also works without modern Clipboard API/Promise support.
    el('manual').style.display = 'block'
    field.value = value
    field.focus()
    field.select()
    try {
      field.setSelectionRange(0, field.value.length)
      ok = document.execCommand('copy')
    } catch (e) {}
    if (ok) {
      el('manual').style.display = 'none'
      field.value = ''
      statusKey = 'copied'
    } else {
      statusKey = 'manual'
    }
    text('status', messages[locale][statusKey])
  }
  function readHash() {
    reset()
    if (location.hash) {
      secretInput.value = location.hash
      generate()
    } else secretInput.value = ''
  }
  var match = /(?:^|[?&])lang=(en|zh-CN|zh-TW)(?:&|$)/.exec(location.search),
    buttons = document.querySelectorAll('[data-lang]'),
    i
  locale = match ? match[1] : language(navigator.language || navigator.userLanguage || 'en')
  translate()
  if (!window.jsSHA || !window.LiteOTP) {
    error('unavailable')
    return
  }
  el('generate').disabled = false
  el('clear').disabled = false
  el('generate').onclick = generate
  secretInput.oninput = reset
  // Prevent pasted rows being flattened by single-line inputs and merged into one secret.
  secretInput.onpaste = function (event) {
    var clipboard = event.clipboardData || window.clipboardData,
      raw
    if (!clipboard) return
    raw = clipboard.getData(event.clipboardData ? 'text/plain' : 'Text')
    if (/[\r\n]/.test(raw.replace(/^\s+|\s+$/g, ''))) {
      event.preventDefault()
      reset()
      error('multiple')
    }
  }
  secretInput.onkeydown = function (event) {
    if (event.keyCode === 13) {
      event.preventDefault()
      generate()
    }
  }
  el('reveal').onchange = function () {
    secretInput.type = this.checked ? 'text' : 'password'
  }
  el('algorithm').onchange = reset
  el('digits').onchange = reset
  el('period').oninput = reset
  el('clear').onclick = function () {
    reset()
    secretInput.value = ''
    el('reveal').checked = false
    secretInput.type = 'password'
    if (location.hash) {
      if (history.replaceState) history.replaceState(null, '', location.pathname + location.search)
      else location.hash = ''
    }
    secretInput.focus()
  }
  el('copy').onclick = function () {
    tick()
    if (config) copy(currentCode)
  }
  el('link').onclick = function () {
    if (config)
      copy(location.protocol + '//' + location.host + '/lite' + window.LiteOTP.fragment(config))
  }
  for (i = 0; i < buttons.length; i++)
    buttons[i].onclick = function () {
      locale = this.getAttribute('data-lang')
      translate()
    }
  window.onhashchange = readHash
  window.onpageshow = function () {
    tick()
  }
  window.addEventListener('focus', tick)
  document.addEventListener('visibilitychange', tick)
  if (location.search && !/^\?lang=(en|zh-CN|zh-TW)$/.test(location.search)) {
    error('query')
  } else readHash()
  window.setInterval(tick, 1000)
})()
