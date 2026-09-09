# jsSHA

Lite uses the unmodified ES3-compatible UMD build of jsSHA 3.3.2 for local HMAC-SHA-1, SHA-256 and SHA-512 computation.

- Source: https://github.com/Caligatio/jsSHA
- Release package: https://registry.npmjs.org/jssha/-/jssha-3.3.2.tgz
- Vendored file: `public/lite-assets/sha.js` (from `dist/sha.js`)
- License: [BSD-3-Clause](jsSHA-LICENSE.txt)

No runtime CDN request is made. The custom Base32, TOTP and input handling is in `public/lite-assets/otp.js`; UI behavior is in `public/lite-assets/ui.js`.
