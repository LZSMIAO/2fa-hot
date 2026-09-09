# 2fa.hot

<!-- website:intro:start -->

以 Minecraft 為風格設計的線上 2FA 多功能工具。只需貼上已有密鑰，取得並複製目前驗證碼。

正在集成更多相關功能…它不僅支援自動識別批量數據，同時支援多種密鑰形式識別 - 無論您從Excel表單複製過來的傻逼格式、因爲您的客戶不會使用、連帶密碼+密鑰一起複製過來，都能識別並給出相應提示。

當然——我們的網站非常照顧您弱智客戶的智商。

Introducing：無障礙指南。甚至可選用語音一對一教學如何使用密鑰登錄賬戶！

<!-- website:intro:end -->

[繁體中文](README.md) · [简体中文](docs/readme/README.zh-CN.md) · [English](docs/readme/README.en.md) · [開始使用](https://2fa.hot/zh-TW) · [使用說明](https://2fa.hot/zh-TW/help) · [Issues](https://github.com/LZSMIAO/2fa-hot/issues)

![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82?style=flat-square&logo=nuxt&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-3-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white)

[![2fa.hot](assets/home-zh-TW.png)](https://2fa.hot)

<!-- website:body:start -->

## 為什麼做這個？為什麼重複造輪子？

...大概是2021年，第四次工業革命，人類進入AI時代。由此，經常看到有人濫用，甚至專業程序員，也乾這種勾當——只用5分鐘 就生成一個他媽的漸變、不對齊、用了100個不同設計風格ui、1000種元素的前端。甚至 還能賣給灰產用戶賺大錢。看得我噁心，我從床上爬起來，吐了一遍又一遍，可惜沒被穩穩接住。

2fa.hot 大部分由 vibe coding 完成，從零至上線共耗費 4 小時——當然，我用它改到已差不多能看才上綫——正如我和同事的某些項目一樣，我們一遍一遍修訂，直到他符合我們的審美，直到它從未上綫。某些項目，也許未來會被各位熟知，雖然你們也不會知道那是我們做的。就像6年前，我第一次打開Premiere pro，直到把我的影片編輯到近乎完美，你們也不知道某些影片是我做的。

我不反對AI，我是文科生，沒有Ai，我可能連他媽怎麽開一個網站都不知道。我只是希望某些人能善用AI，它能幫你做事，但不能成爲你，永遠。

我知道這改變不了現在快節奏的生活，也攔不住那些。我只能做這些。

---

<details>
<summary>隱藏文字</summary>
好吧，好吧，我知道你不喜歡閱讀文字。擺脫宏大敘事。其實這個站點是方便我朋友的在線店舖、電商項目多帳戶登錄使用。還有哪天訪問量多了我能貼廣告發大財:P
</details>

## 域名相關

原本想註冊2fa.mc 但由於無法註冊 **2FA®** 以提交摩納哥管局認證作罷...

假如我寫這段話的時候繃住了呢。 於是.HOT 來了。好吧，好吧，我承認這是性感的，我們所以回來。

## 具體能做什麼

- 單條／批次取碼：支援 Base32 密鑰、otpauth:// 設定連結。
- 掃碼匯入：圖片、拖放、相機；支援 Google Authenticator 匯出 QR 碼、多帳號和分張匯出，收齊後選擇需要的帳號。
- 連結直達：開啟 [https://2fa.hot/2fa/你的密鑰](https://2fa.hot/2fa/你的密鑰)，直接顯示目前驗證碼。
- 本機紀錄：預設不儲存，可主動開啟；密碼保護可隨時開啟或取消，支援備份與還原。
- 30 種語言：適配手機、深淺主題；不會用就點教學，跟著鑽石劍走一遍。

支援 TOTP、SHA-1／SHA-256／SHA-512、6／8 位驗證碼。HOTP、Steam 專用格式不參與取碼；遷移檔案中的 HOTP／MD5 帳號可解析匯出。

…And More

## 怎麼用

1. 找到你已有的 2FA 密鑰，可以是以前儲存的，也可以是別人提供的。它不是登入密碼，也不是六位驗證碼。
2. 在 2fa.hot 貼上密鑰，或匯入 QR 碼。
3. 複製目前驗證碼，填到需要驗證的網站或 App。快過期時等下一組。

Google Authenticator 匯入：在 App 中選擇「轉移帳號 → 匯出帳號」，再到本站「匯入 QR 碼 → Google Authenticator」掃描或上傳。多張 QR 碼要全部匯入，重複掃描會自動去重。

## 密鑰放在哪裡

首頁取碼和 QR 碼辨識完全在瀏覽器內完成。主動開啟本機紀錄後，紀錄會儲存在你的瀏覽器中。驗證碼計算、QR 碼辨識與歷史紀錄儲存均在本地完成。你還可以設定密碼加密保護，也可以不設密碼，直接查看。

直達連結把完整密鑰放在網址路徑中。開啟連結時，包含密鑰的網址會隨頁面請求送達網站託管服務，驗證碼仍在瀏覽器內計算。「請求包含密鑰」不代表「密鑰已被保存為日誌」；是否留存請求網址取決於服務的日誌設定，網址也可能保留在瀏覽器歷史裡。首頁輸入框取碼則不會把密鑰放進頁面請求網址。｜注意別把真實連結、QR 碼或密鑰貼進公開截圖和 Issue，或提供給你不信任的人。忘記本機紀錄口令後，網站無法幫你找回。

[隱私說明](https://2fa.hot/privacy)

<!-- website:body:end -->

## 素材來源與致謝

- Minecraft 背景、音效與貼圖：Mojang / Microsoft。[背景](credits/PANORAMA-SOURCE.md) · [音效](credits/AUDIO-SOURCE.md) · [經驗條](credits/HUD-SOURCE.md) · [箱子](credits/CHEST-SOURCE.md) · [試煉鑰匙](credits/TRIAL-KEY-SOURCE.md) · [沙漠場景](credits/DESERT-SOURCE.md)。
- 丛雨角色皮膚：[Konata / LittleSkin，作品 513373](https://littleskin.cn/skinlib/show/513373)。角色姿勢與場景編排由本專案製作，皮膚權利歸原作者所有。
- 介面設計參考：[OreUI](https://katorly.dev/OreUI/zh-CN/)。
- 字體：VT323 Project Authors、Inter Project Authors、JetBrains Mono Project Authors，採用 SIL Open Font License 1.1。[VT323 授權](credits/VT323-OFL.txt) · [Inter 授權](credits/Inter-OFL.txt) · [JetBrains Mono 授權](credits/JetBrains-Mono-OFL.txt)。
- 介面圖示：[Lucide Contributors](https://github.com/lucide-icons/lucide)，[ISC 授權](https://github.com/lucide-icons/lucide/blob/main/LICENSE)。

本專案與 Mojang / Microsoft 無隸屬或官方合作關係。第三方素材的權利及授權仍歸各自權利人；列出來源不表示取得額外授權。預覽圖包含上述第三方素材。

## 授權與公開部署

本版本的專案自有程式碼及文件採用 [AGPL-3.0](LICENSE)，並附有 [NOTICE](NOTICE) 的合理來源署名要求。公開部署衍生網站時，保留可見的 2fa.hot 來源連結；修改版提供網路服務時，須向使用者提供該版本的對應原始碼。本機自用免展示署名，原始碼內的聲明仍須保留。第三方素材依各自條款使用；此前已按 MIT 發布的版本不受追溯變更。

```sh
pnpm install
pnpm dev
# Production build
pnpm build
```
