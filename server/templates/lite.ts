export default `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="referrer" content="no-referrer" />
    <meta name="robots" content="noindex, nofollow, noarchive" />
    <title>2fa.hot Lite</title>
    <link rel="icon" href="data:," />
    <link rel="stylesheet" href="/lite-assets/style.css" />
  </head>
  <body>
    <div class="page">
      <div class="header">
        <a class="brand" href="/">2fa.hot</a><span class="mode">Lite</span
        ><a id="full" class="full" href="/">Full version</a>
      </div>
      <div class="languages" aria-label="Language">
        <button type="button" data-lang="zh-TW">繁體中文</button
        ><button type="button" data-lang="zh-CN">简体中文</button
        ><button type="button" data-lang="en">English</button>
      </div>
      <h1 data-text="title">Your code. Nothing extra.</h1>
      <p class="lead" data-text="intro">
        Local 2FA codes. No animation, sound or account required.
      </p>
      <noscript
        ><p class="error">
          JavaScript is required to calculate codes locally. 請啟用 JavaScript 以在本地取碼。
        </p></noscript
      >
      <div class="panel">
        <label for="secret" data-text="secretLabel">Secret or otpauth:// link</label>
        <input
          id="secret"
          type="password"
          autocomplete="off"
          spellcheck="false"
          autocapitalize="off"
          maxlength="8192"
          aria-describedby="hint"
        />
        <p id="hint" class="hint" data-text="hint">
          One Base32 secret at a time. Spaces between groups are supported.
        </p>
        <label class="reveal"
          ><input id="reveal" type="checkbox" /> <span data-text="reveal">Show secret</span></label
        >
        <div class="options">
          <label
            ><span data-text="algorithm">Algorithm</span
            ><select id="algorithm">
              <option>SHA-1</option>
              <option>SHA-256</option>
              <option>SHA-512</option>
            </select></label
          >
          <label
            ><span data-text="digits">Digits</span
            ><select id="digits">
              <option>6</option>
              <option>8</option>
            </select></label
          >
          <label
            ><span data-text="period">Period (seconds)</span
            ><input id="period" type="text" inputmode="numeric" value="30" maxlength="3"
          /></label>
        </div>
        <div class="actions">
          <button id="generate" type="button" class="primary" disabled data-text="generate">
            Get code</button
          ><button id="clear" type="button" disabled data-text="clear">Clear</button>
        </div>
        <p id="error" class="error" role="alert"></p>
        <div class="result">
          <label for="code" data-text="current">Current code</label>
          <input
            id="code"
            class="code"
            type="text"
            readonly
            value="------"
            autocomplete="off"
            aria-label="Current code"
          />
          <p id="countdown" class="countdown">—</p>
          <button id="copy" type="button" class="primary" disabled data-text="copy">
            Copy code
          </button>
          <button id="link" type="button" disabled data-text="link">Copy link</button>
          <p id="status" class="hint" role="status" aria-live="polite"></p>
          <div id="manual" class="manual">
            <label for="copy-value" data-text="manual">Select and copy manually</label
            ><input id="copy-value" type="text" readonly autocomplete="off" />
          </div>
        </div>
      </div>
      <p class="privacy" data-text="privacy">
        Secrets stay in this browser. No history is saved. Shared links still contain your secret;
        keep them private.
      </p>
      <div class="footer">
        <span>2fa.hot Lite</span><a href="https://github.com/LZSMIAO/2fa-hot">Source · AGPL-3.0</a>
      </div>
    </div>
    <script src="/lite-assets/sha.js"></script>
    <script src="/lite-assets/otp.js"></script>
    <script src="/lite-assets/ui.js"></script>
  </body>
</html>
`
