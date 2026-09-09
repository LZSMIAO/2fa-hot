# 2fa.hot

<!-- website:intro:start -->

以 Minecraft 为风格设计的线上 2FA 多功能工具。只需贴上已有密钥，取得并复制目前验证码。

正在集成更多相关功能…它不仅支援自动识别批量数据，同时支援多种密钥形式识别 - 无论您从Excel表单复制过来的傻逼格式、因为您的客户不会使用、连带密码+密钥一起复制过来，都能识别并给出相应提示。

当然——我们的网站非常照顾您弱智客户的智商。

Introducing：无障碍指南。甚至可选用语音一对一教学如何使用密钥登录账户！

<!-- website:intro:end -->

[繁体中文](../../README.md) · [简体中文](README.zh-CN.md) · [English](README.en.md) · [开始使用](https://2fa.hot/zh-CN) · [使用说明](https://2fa.hot/zh-CN/help) · [Issues](https://github.com/LZSMIAO/2fa-hot/issues)

![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82?style=flat-square&logo=nuxt&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-3-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white)

[![2fa.hot](../../assets/home-zh-CN.png)](https://2fa.hot)

<!-- website:body:start -->

## 为什么做这个？为什么重复造轮子？

...大概是2021年，第四次工业革命，人类进入AI时代。由此，经常看到有人滥用，甚至专业程序员，也干这种勾当——只用5分钟 就生成一个他妈的渐变、不对齐、用了100个不同设计风格ui、1000种元素的前端。甚至 还能卖给灰产用户赚大钱。看得我恶心，我从床上爬起来，吐了一遍又一遍，可惜没被稳稳接住。

2fa.hot 大部分由 vibe coding 完成，从零至上线共耗费 4 小时——当然，我用它改到已差不多能看才上线——正如我和同事的某些项目一样，我们一遍一遍修订，直到他符合我们的审美，直到它从未上线。某些项目，也许未来会被各位熟知，虽然你们也不会知道那是我们做的。就像6年前，我第一次打开Premiere pro，直到把我的影片编辑到近乎完美，你们也不知道某些影片是我做的。

我不反对AI，我是文科生，没有Ai，我可能连他妈怎么开一个网站都不知道。我只是希望某些人能善用AI，它能帮你做事，但不能成为你，永远。

我知道这改变不了现在快节奏的生活，也拦不住那些。我只能做这些。

---

<details>
<summary>隐藏文字</summary>
好吧，好吧，我知道你不喜欢阅读文字。摆脱宏大叙事。其实这个站点是方便我朋友的在线店铺、电商项目多账户登录使用。还有哪天访问量多了我能贴广告发大财:P
</details>

## 域名相关

原本想注册2fa.mc 但由于无法注册 **2FA®** 以提交摩纳哥管局认证作罢...

假如我写这段话的时候绷住了呢。 于是.HOT 来了。好吧，好吧，我承认这是性感的，我们所以回来。

## 具体能做什么

- 单条／批次取码：支援 Base32 密钥、otpauth:// 设定连结。
- 扫码汇入：图片、拖放、相机；支援 Google Authenticator 汇出 QR 码、多帐号和分张汇出，收齐后选择需要的帐号。
- 连结直达：开启 [https://2fa.hot/2fa/你的密钥](https://2fa.hot/2fa/你的密钥)，直接显示目前验证码。
- 本机纪录：预设不储存，可主动开启；密码保护可随时开启或取消，支援备份与还原。
- 30 种语言：适配手机、深浅主题；不会用就点教学，跟著钻石剑走一遍。

支援 TOTP、SHA-1／SHA-256／SHA-512、6／8 位验证码。HOTP、Steam 专用格式不参与取码；迁移档案中的 HOTP／MD5 帐号可解析汇出。

…And More

## 怎么用

1. 找到你已有的 2FA 密钥，可以是以前储存的，也可以是别人提供的。它不是登入密码，也不是六位验证码。
2. 在 2fa.hot 贴上密钥，或汇入 QR 码。
3. 复制目前验证码，填到需要验证的网站或 App。快过期时等下一组。

Google Authenticator 汇入：在 App 中选择「转移帐号 → 汇出帐号」，再到本站「汇入 QR 码 → Google Authenticator」扫描或上传。多张 QR 码要全部汇入，重复扫描会自动去重。

## 密钥放在哪里

首页取码和 QR 码识别完全在浏览器内完成。主动开启本地记录后，记录会储存在你的浏览器中。验证码计算、QR 码识别与历史记录储存均在本地完成。你还可以设置密码加密保护，也可以不设密码，直接查看。

直达链接把完整密钥放在网址路径中。打开链接时，包含密钥的网址会随页面请求送达网站托管服务，验证码仍在浏览器内计算。“请求包含密钥”不代表“密钥已被保存为日志”；是否留存请求网址取决于服务的日志设置，网址也可能保留在浏览器历史里。首页输入框取码则不会把密钥放进页面请求网址。｜注意别把真实链接、QR 码或密钥贴进公开截图和 Issue，或提供给你不信任的人。忘记本地记录口令后，网站无法帮你找回。

[隐私说明](https://2fa.hot/privacy)

<!-- website:body:end -->

## 素材来源与致谢

- Minecraft 背景、音效与贴图：Mojang / Microsoft。[背景](../../credits/PANORAMA-SOURCE.md) · [音效](../../credits/AUDIO-SOURCE.md) · [经验条](../../credits/HUD-SOURCE.md) · [箱子](../../credits/CHEST-SOURCE.md) · [试炼钥匙](../../credits/TRIAL-KEY-SOURCE.md) · [沙漠场景](../../credits/DESERT-SOURCE.md)。
- 丛雨角色皮肤：[Konata / LittleSkin，作品 513373](https://littleskin.cn/skinlib/show/513373)。角色姿势与场景编排由本项目制作，皮肤权利归原作者所有。
- 界面设计参考：[OreUI](https://katorly.dev/OreUI/zh-CN/)。
- 字体：VT323 Project Authors、Inter Project Authors、JetBrains Mono Project Authors，采用 SIL Open Font License 1.1。[VT323 许可](../../credits/VT323-OFL.txt) · [Inter 许可](../../credits/Inter-OFL.txt) · [JetBrains Mono 许可](../../credits/JetBrains-Mono-OFL.txt)。
- 界面图标：[Lucide Contributors](https://github.com/lucide-icons/lucide)，[ISC 许可](https://github.com/lucide-icons/lucide/blob/main/LICENSE)。

本项目与 Mojang / Microsoft 无隶属或官方合作关系。第三方素材的权利及许可仍归各自权利人；列出来源不表示取得额外授权。预览图包含上述第三方素材。

## 授权与公开部署

本版本的项目自有代码及文档采用 [AGPL-3.0](../../LICENSE)，并附有 [NOTICE](../../NOTICE) 的合理来源署名要求。公开部署衍生网站时，保留可见的 2fa.hot 来源链接；修改版提供网络服务时，须向用户提供该版本的对应源代码。本地自用免展示署名，源代码内的声明仍须保留。第三方素材依各自条款使用；此前已按 MIT 发布的版本不受追溯变更。

```sh
pnpm install
pnpm dev
# Production build
pnpm build
```
