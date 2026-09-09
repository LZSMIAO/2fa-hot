# 2fa.hot

<!-- website:intro:start -->

An online multifunctional 2FA tool designed in the style of Minecraft. Just paste an existing secret key to get and copy the current verification code.

More related features are being integrated… It not only automatically recognizes batch data, but also recognizes multiple forms of secret keys—whether it's the fucking idiotic format you copied from an Excel sheet, or your customer doesn't know how to use it and copies the password and secret key together, it can recognize it and give the corresponding prompts.

Of course—our website takes very good care of your idiot customers' intelligence.

Introducing: the accessibility guide. You can even choose one-on-one voice guidance on how to use a secret key to log into an account!

<!-- website:intro:end -->

[繁體中文](../../README.md) · [简体中文](README.zh-CN.md) · [English](README.en.md) · [Start](https://2fa.hot) · [Help](https://2fa.hot/help) · [Issues](https://github.com/LZSMIAO/2fa-hot/issues)

![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82?style=flat-square&logo=nuxt&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-3-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white)

[![2fa.hot](../../assets/home-en.png)](https://2fa.hot)

<!-- website:body:start -->

## Why I made this? Why reinvent the wheel?

...Around 2021, the Fourth Industrial Revolution, humanity entered the AI era. Since then, I often see people abusing it—even professional programmers pulling this shit—taking just 5 minutes to generate a fucking gradient, misaligned frontend with 100 different UI design styles and 1,000 elements. They can even sell it to gray-market users and make a fortune. It makes me sick. I crawled out of bed and threw up again and again. Unfortunately, I wasn’t caught steadily.

Most of 2fa.hot was built through vibe coding, taking 4 hours from scratch to launch—of course, I used it to revise things until they were almost presentable before going live—just like some projects my colleagues and I work on. We revise them again and again until they meet our aesthetic standards, until they have never gone live. Some projects might become familiar to you in the future, although you won't know we made them. Just like when I first opened Premiere pro 6 years ago and kept editing my videos until they were nearly perfect—you don't know that some videos were made by me either.

I'm not against AI. I studied the humanities. Without AI, I might not even know how the fuck to put a website online. I just hope certain people can use AI well. It can help you do things, but it can never become you. Ever.

I know this won't change today's fast-paced life, or stop any of that. This is all I can do.

---

<details>
<summary>Hidden text</summary>
Fine, fine, I know you don't like reading. Enough with the grand narrative. This site is actually here to help my friends log into multiple accounts for their online shops and e-commerce projects. And maybe one day it'll get enough traffic for me to slap ads on it and get rich :P
</details>

If another code website places a secret in a URL path or query, such as `/2fa/SECRET` or `?secret=SECRET`, opening the link directly sends the secret in an HTTP request. The remote website service or CDN receives that data and may record and retain it through access logs, monitoring or application logging. Whether it is actually recorded, and for how long, depends on that site's settings and policies.

## Domain drama

I originally wanted 2fa.mc, but gave up because I couldn't register **2FA®** to submit to Monaco's domain registry...

What if I kept a straight face while writing this? Then .HOT came along. Fine, fine, I'll admit it: that's sexy. We're going back.

## What exactly can it do

- Single / batch codes: supports Base32 secret keys and otpauth:// configuration links.
- QR import: images, drag and drop, and camera; supports Google Authenticator export QR codes, multiple accounts and multi-part exports. Collect all parts, then choose the accounts you need.
- Direct links: open [https://2fa.hot/2fa#YOUR_SECRET](https://2fa.hot/2fa#YOUR_SECRET) to display the current verification code directly. The secret stays after `#` for local browser processing and is not sent to the remote service in the HTTP page request.
- Local history: saving is off by default and can be enabled manually; password protection can be enabled or disabled at any time, with backup and restore support.
- 30 languages: mobile layouts and light / dark themes; if you don't know how to use it, open the guide and follow the diamond sword.

Supports TOTP, SHA-1 / SHA-256 / SHA-512, and 6- / 8-digit codes. HOTP and Steam-specific formats are not used to generate codes; HOTP / MD5 accounts in migration files can be decoded and exported.

…And More

## How to use it

1. Find your existing 2FA secret key. It may be one you saved earlier or one somebody gave you. It is not a login password or a six-digit code.
2. Paste the key at 2fa.hot, or import a QR code.
3. Copy the current verification code into the website or app that needs verification. If it's about to expire, wait for the next one.

Google Authenticator import: select “Transfer accounts → Export accounts” in the app, then scan or upload through “Import QR code → Google Authenticator” here. Import every QR code in a multi-part export. Duplicate scans are automatically deduplicated.

## Where the secret keys go

Code generation on the homepage and QR recognition happen entirely in your browser. Once you enable local history, records are stored in your browser. Code generation, QR recognition and history storage all happen locally. You can also set a password for encryption, or leave it unset and view records directly.

New direct links use `/2fa#SECRET`. The browser reads the secret and verification parameters after # locally; they are not sent with the page request. Legacy `/2fa/SECRET` links still work, but their path sends the secret to the hosting service. Full links still contain secrets and may remain in browser history. Do not share them publicly or with people you do not trust. Forgotten local-history passphrases cannot be recovered.

[Privacy](https://2fa.hot/privacy)

<!-- website:body:end -->

## Sources and credits

- Minecraft backgrounds, sounds and textures: Mojang / Microsoft. [Panorama](../../credits/PANORAMA-SOURCE.md) · [Audio](../../credits/AUDIO-SOURCE.md) · [Experience bar](../../credits/HUD-SOURCE.md) · [Chest](../../credits/CHEST-SOURCE.md) · [Trial key](../../credits/TRIAL-KEY-SOURCE.md) · [Desert scene](../../credits/DESERT-SOURCE.md).
- Congyu character skin: [Konata on LittleSkin, entry 513373](https://littleskin.cn/skinlib/show/513373). The pose and scene composition are project-created; skin rights remain with the creator.
- Interface design reference: [OreUI](https://katorly.dev/OreUI/zh-CN/).
- Fonts: VT323 Project Authors, Inter Project Authors and JetBrains Mono Project Authors, under SIL Open Font License 1.1. [VT323 license](../../credits/VT323-OFL.txt) · [Inter license](../../credits/Inter-OFL.txt) · [JetBrains Mono license](../../credits/JetBrains-Mono-OFL.txt).
- Interface icons: [Lucide Contributors](https://github.com/lucide-icons/lucide), under the [ISC license](https://github.com/lucide-icons/lucide/blob/main/LICENSE).

This project is not affiliated with or officially partnered with Mojang / Microsoft. Third-party assets retain their respective ownership and licenses; attribution does not grant additional permission. Preview images contain the third-party assets listed above.

## License and public deployments

Project-owned code and documentation in this release use [AGPL-3.0](../../LICENSE) with the reasonable attribution notice in [NOTICE](../../NOTICE). Public derivative deployments must retain accessible 2fa.hot attribution. Modified network versions must offer users their Corresponding Source. Personal/local-only use is exempt from on-screen attribution, but source notices remain. Third-party assets retain their own terms. Earlier MIT releases are not retroactively relicensed.

```sh
pnpm install
pnpm dev
# Production build
pnpm build
```
