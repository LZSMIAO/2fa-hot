# 2FA.HOT

<!-- website:intro:start -->

以 Minecraft 风格为设计参考的多功能线上 2FA 工具。贴上已有密钥，取得目前验证码。支援片段直链，取码全由本地处理。

正在集成更多功能…

它不仅支援自动识别/切换批量数据，同时支援多种密钥格式 - 无论是从Excel表单复制过来的傻逼格式、或因您的客户不会使用、连带密码+密钥一起复制过来，都能识别并有相应提示。

Introducing：

无障碍指南。可选用语音 一对一教学如何使用密钥登录账户！

<!-- website:intro:end -->

[繁體中文](../../README.md) · [简体中文](README.zh-CN.md) · [English](README.en.md) · [开始使用](https://2fa.hot/zh-CN) · [使用说明](https://2fa.hot/zh-CN/help) · [Issues](https://github.com/LZSMIAO/2fa-hot/issues)

![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82?style=flat-square&logo=nuxt&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-3-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white)

[![2fa.hot](../../assets/home-zh-CN.png)](https://2fa.hot)

<!-- website:body:start -->

## 具体能做什么

- 单条／批次取码：支援 Base32 密钥、otpauth:// 设定连结。
- 扫码汇入：图片、拖放、相机；支援 Google Authenticator 汇出 QR 码、多帐号和分张汇出，收齐后选择需要的帐号。
- 连结直达：支援开启 [https://2fa.hot/2fa#你的密钥](https://2fa.hot/2fa#你的密钥)，直接显示目前验证码。密钥放在 `#` 后，由浏览器本地读取与计算，不随 HTTP 页面请求传送至远端，避免密钥随这次请求传出。
- 本机纪录：预设不储存记录，可主动开启；密码保护可随时开启或取消，支援备份与还原。
- 30 种语言：适配手机、深浅主题；不会用就点教学，跟著钻石剑走一遍。

支援 TOTP、SHA-1／SHA-256／SHA-512、6／8 位验证码。HOTP、Steam 专用格式不参与取码；迁移档案中的 HOTP／MD5 帐号可解析汇出。

Google Authenticator 汇入：在 Google验证器 App 中选择「转移帐号 → 汇出帐号」，再到本站「汇入 QR 码 → Google Authenticator」扫描/上传，即可导出密钥至任何地方。

…And More

## 怎么用

1. 复制 2FA 密钥，在 2fa.hot 贴上密钥或汇入 QR 码。
2. 在倒计时内复制目前验证码，填到要验证的网站或 App。快过期时等下一组。
3. 生成全由本地处理的直接连结，一键复制/批量生成。

## 密钥放在哪里

首页取码和 QR 码辨识 完全在浏览器内完成。

主动开启本机纪录后，纪录会储存在你的浏览器中。验证码计算、QR 码辨识与历史纪录储存均在本地完成。还可以设定密码加密保护，也可以不设密码，直接查看。

新直达连结使用 `/2fa#密钥`，密钥和验证参数位于 `#` 后面，仅由浏览器本地读取，不会随页面请求传至托管服务。旧 `/2fa/密钥` 连结仍可兼容使用，但网址路径中的密钥会随请求送达托管服务。专案部署设定已停用 Workers 日志与 Logpush；这不会改变旧连结传送密钥的方式。完整连结仍含密钥，也可能留在浏览器历史里，所以我们不推荐您使用旧路径式直链。

最后，请勿公开分享或交给不信任的人。忘记本机纪录口令后，网站无法帮你找回。

## 域名相关

原本想注册2fa.mc 但由于无法注册 **2FA®** 以提交摩纳哥管局认证作罢。

...假如我写这段话的时候绷住了呢。于是.HOT 来了。好吧，好吧，我承认这是性感的，我们所以回去。

## 为什么做这个？重复造轮子？

在过去，我用过很多类似的在线工具，直链取得代码。如果你不知道的话，只要访问带密钥的网址，例如 `/2fa/密钥` 或 `?secret=密钥`，浏览器会把密钥随 HTTP 请求传送出去，对方的远端网站服务或 CDN 能收到这份资料，也能透过存取日志、监控或应用程式记录并留存。也就是说，这些请求中的密钥可能被明文储存；假如你曾经还贴入过账户+密码+2FA，而对方也上传并留存这些内容... BOOM! 当然，是否实际留存取决于对方的实作、设定与隐私政策:))

...大概是2021年，第四次工业革命，人类进入AI时代。由此，经常看到有人在滥用，甚至专业程序员，也干这种勾当——只用5分钟 就生成一个他妈的渐变、不对齐、用了100个不同设计风格ui、1000种元素的前端。

像是某些连我讯息都不敢回的人，只用AI随便做一个粗制滥造的垃圾系统 就能卖货给灰产用户发大财。

…这一切看得我恶心，我从床上爬起来，吐了一遍又一遍，可惜没被稳稳接住。

我想要做的 有钱人都做过了。2fa.hot 几乎由 Vibe Coding 完成——当然，我将它改到勉强满意才上线。正如我和同事的某些项目一样，我们希望早日上线，但止不住一遍遍修订，直到符合我们的要求，直到它从未上线。某些项目也许未来会被读这条文字的各位熟知，尽管你们也不会知道那是我们做的。这感觉 像是回到6年前，打开Premiere Pro，全身心投入创作，乐此不疲。可如今我却再做不出影片了，令人感叹。

我想要说的 前人们都说过了。我不反对AI。6年前 我是文科生，我可能连他妈怎么开个网站都不知道。我希望 某些人能善用AI。它能帮你做事，但不能成为你，永远。请别用它代替你的想法，代替你的人生；别用它写出个自己都懒得玩的设计、各种影响体验的BUG逻辑… 快用localhost打开，继续打磨100遍。否则，那不是你自己的，别放出来恶心任何人。卖钱？你不配，只能一直在灰色产业摸爬滚打。

我想要的公平都是不公们虚构的。我知道 我改变不了当今快节奏的生活，也拦不住的那些。它们。

[隐私说明](https://2fa.hot/privacy)

<!-- website:body:end -->

## 素材来源与致谢

- Minecraft 背景、音效与贴图：Mojang / Microsoft。[背景](../../credits/PANORAMA-SOURCE.md) · [音效](../../credits/AUDIO-SOURCE.md) · [经验条](../../credits/HUD-SOURCE.md) · [箱子](../../credits/CHEST-SOURCE.md) · [试炼钥匙](../../credits/TRIAL-KEY-SOURCE.md) · [沙漠场景](../../credits/DESERT-SOURCE.md)。
- 丛雨角色皮肤：[Konata / LittleSkin，作品 513373](https://littleskin.cn/skinlib/show/513373)。角色姿势与场景编排由本专案制作，皮肤权利归原作者所有。
- 介面设计参考：[OreUI](https://katorly.dev/OreUI/zh-CN/)。
- 字体：VT323 Project Authors、Inter Project Authors、JetBrains Mono Project Authors，采用 SIL Open Font License 1.1。[VT323 授权](../../credits/VT323-OFL.txt) · [Inter 授权](../../credits/Inter-OFL.txt) · [JetBrains Mono 授权](../../credits/JetBrains-Mono-OFL.txt)。
- 介面图示：[Lucide Contributors](https://github.com/lucide-icons/lucide)，[ISC 授权](https://github.com/lucide-icons/lucide/blob/main/LICENSE)。

本专案与 Mojang / Microsoft 无隶属或官方合作关系。第三方素材的权利及授权仍归各自权利人；列出来源不表示取得额外授权。预览图包含上述第三方素材。

## 授权与公开部署

本版本的专案自有程式码及文件采用 [AGPL-3.0](../../LICENSE)，并附有 [NOTICE](../../NOTICE) 的合理来源署名要求。公开部署衍生网站时，保留可见的 2fa.hot 来源连结；修改版提供网路服务时，须向使用者提供该版本的对应原始码。本机自用免展示署名，原始码内的声明仍须保留。第三方素材依各自条款使用；此前已按 MIT 发布的版本不受追溯变更。

```sh
pnpm install
pnpm dev
# Production build
pnpm build
```
