# SEO 实施与跟踪

本轮完成代码与本地验证，尚未发布，也未代替站长完成 Search Console / Bing Webmaster Tools 所有权验证及 sitemap 提交。首页保留原来的取码布局，不在工作区下方增加 SEO 文章。指南通过页脚的「2FA / TOTP」入口访问。

## 现状与范围

修改前，生产站 `https://2fa.hot` 的首页使用通用取码标题，没有 canonical 和 JSON-LD，语言依赖请求 / Cookie，没有可独立索引的多语言 URL；生产 `/sitemap.xml` 返回 404。仓库的 robots 仅禁止 `/2fa/` 与 `/history`，没有 sitemap 声明。线上 robots 还附加了 Cloudflare 管理的内容规则，允许搜索用途；发布后应核对合并结果中的 sitemap 与私密路径限制。

本轮没有 Search Console 查询数据、搜索量或排名基线，不把普通搜索结果当成固定的全球排名。Google 会根据语言、地区、设备、时间和搜索意图给出不同结果。

[Google SEO 入门指南](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) 说明，技术优化有助于搜索引擎发现和理解内容，但不保证索引或第一名。`2FA` 是宽泛关键词；先观察更贴近实际工具需求的词，再根据真实查询数据扩展内容。

## 已实现

- 首页、帮助、隐私页共 30 种语言有独立 URL。英语不加前缀，其他语言如 `/zh-CN`、`/ja`、`/ar`。
- 每个公开页具有自身 canonical、已存在译文的双向 hreflang 和 `x-default`。参数与锚点不进入 canonical。
- 首页使用各语言的 2FA / TOTP 标题，保留原有视觉字标；可访问的 H1 名称描述工具用途。帮助、隐私、关于和指南有不同的标题及摘要。
- `WebSite`、`WebPage`、`WebApplication`、`BreadcrumbList`、`Article` 按页面生成。没有虚构评分、评论、FAQ 富结果资格或文章更新时间。
- Open Graph / Twitter 分享元信息与 1200×630 PNG 分享图。指南正文只在指南页面需要时加载，工具首页只引入轻量文章元信息。
- `/sitemap.xml` 包含 100 个公开 URL：90 个首页 / 帮助 / 隐私译文，以及 10 个英文、简体中文的关于 / 指南索引 / 三篇指南页面。未翻译文章不会复制成 30 份。
- `/robots.txt` 指向 sitemap；密钥路径在所有语言下禁止抓取。历史页允许读取 `noindex`，避免爬虫因为 robots 阻挡而看不到索引指令。见 [Google noindex 说明](https://developers.google.com/search/docs/crawling-indexing/block-indexing)。
- `/2fa`、`/2fa/:secret`、`/history` 及其本地化形式采用客户端渲染、`no-store` 与响应头 `noindex, nofollow, noarchive`。这些页面没有 canonical、分享 URL 或 JSON-LD；客户端从公开页跳转后也会移除这些信息。
- 公开页面尾斜杠 301 归一化，未知指南返回 404。非正式域名返回禁止索引响应头，避免 Workers 预览站竞争收录。
- 站内导航保持语言，语言切换复用页面 key；在尚无对应译文的关于 / 指南页选择其他语言，会进入该语言的工具首页。

`robots.txt`、`noindex` 和 `no-store` 都不是访问控制。公开链接中的密钥仍会经过托管服务；继续遵循隐私说明和部署日志约束。

## 关键词与页面职责

以下是内容定位，不代表已测得搜索量、竞争难度或排名。

| 页面                                  | 主要搜索意图 / 词组                                                  | 作用                           |
| ------------------------------------- | -------------------------------------------------------------------- | ------------------------------ |
| `/`、`/zh-CN`                         | 2FA code generator、TOTP generator、2FA online、2FA 验证码、在线取码 | 直接完成取码任务               |
| `/guides/what-is-2fa`                 | what is 2FA、TOTP vs 2FA、2FA 是什么、密钥和验证码的区别             | 解释概念、使用方法与边界       |
| `/guides/totp-code-not-working`       | 2FA code not working、invalid TOTP code、验证码不正确                | 从设备时间、过期和参数排查失败 |
| `/guides/google-authenticator-import` | Google Authenticator QR export / import、谷歌验证器导入              | 展示本站迁移导入流程和限制     |
| `/help`                               | 2fa.hot help、批量取码、otpauth 格式                                 | 具体工具操作                   |
| `/about`、`/privacy`                  | 品牌、来源与数据处理                                                 | 提供源码、维护方联系和可信依据 |

上述指南均提供英文与简体中文版本；中文地址在路径前加 `/zh-CN`。

## 上线与站长平台

1. 按 [部署指南](DEPLOYMENT.md) 发布通过验证的版本。本轮未推送分支、未触发生产部署。
2. 在正式域名运行 `node scripts/check-seo.mjs https://2fa.hot`。确认 HTTP→HTTPS、域名绑定、缓存规则未覆盖应用索引设置。脚本仅发起读取请求。
3. 在 [Google Search Console](https://search.google.com/search-console) 添加或使用 `2fa.hot` 域名资源。若尚未验证，使用 Google 实际提供的 DNS TXT 值验证所有权，不在代码里放占位令牌。
4. 在 Sitemaps 提交 `https://2fa.hot/sitemap.xml`。使用 URL 检查分别检查英语首页、简体中文首页、帮助和指南，确认 Google 选择的 canonical、渲染正文与索引允许状态。只提交公开页面。
5. 在 [Bing Webmaster Tools](https://www.bing.com/webmasters/) 验证同一站点并提交相同 sitemap，检查抓取与索引报告。暂不添加需要额外密钥的 IndexNow；本次少量页面更新由 sitemap 发现即可。
6. 分享图、JSON-LD 格式本地已检查；发布后可用 [Google Rich Results Test](https://search.google.com/test/rich-results) 检查 Google 支持的类型。有效 Schema.org 数据不等于一定展示富结果。

Search Console 与 Bing 需要站长账号访问 / 所有权验证，目前不具备这些平台的操作结果。不能把生成 sitemap 记作已经提交、收录或提升排名。

## 后续依据数据推进

- 发布时：记录部署版本与日期，导出最近可用的 Search Console 查询 / 页面基线；区分品牌词与非品牌词。
- 前两周：查看 sitemap 是否读取成功、URL 是否被发现、是否存在错误 canonical、软 404、重定向或服务器错误。正常的未索引状态不通过批量重复请求解决。
- 累计有足够数据后：用可比的 28 天区间，按国家、设备、语言、页面和查询看展示、点击、点击率与平均位置。新站数据不足时，不从少量展示判断优化成败。
- 有展示但点击率低：检查标题与摘要是否准确回答该查询；已有点击但内容不足：补全具体操作、真实截图和常见边界。避免为关键词反复改 URL。
- 新增文章优先来自真实反馈和 Search Console 查询，例如多张迁移二维码缺失、TOTP 参数差异、备份恢复。先补足已有文章，再决定是否需要独立页面。
- 在相关开源目录、项目 README 和真正使用到工具的文章中获得自然引用；不购买链接、不批量发评论、不制作重复落地页。
- 用 Search Console Core Web Vitals / PageSpeed 的现场数据排定性能优先级。不要用开发模式加载时间代替生产 LCP、INP、CLS 结论。本轮没有声称 Core Web Vitals 已达标。

## 维护与验证

核心配置：`shared/seo/routes.ts`。更换域名时同步 `siteUrl`、Nuxt 配置引用与 Cloudflare 路由。

文章元信息：`shared/seo/guide-meta.ts`；正文：`shared/seo/guides.ts`；全站元信息：`app/composables/useSiteSeo.ts`。新增文章时同步页面清单 `guideSlugs`，只声明真正存在的译文。

```sh
pnpm test
pnpm typecheck
pnpm build:cloudflare
# 先确认服务已运行；此脚本不会启动或重启服务。
node scripts/check-seo.mjs http://localhost:3001
```

本轮验证：51 项测试通过；类型检查与 Cloudflare 构建通过；100 个公开 URL 的初始 HTML、唯一 canonical、JSON-LD、语言页面可访问性通过；私密页响应头、重定向、404、robots 与 PNG 分享资源通过。浏览器验证了语言切换保留输入、独立取码跳转后移除公开 SEO 信息，以及指南导航。使用的密钥均为 RFC 6238 公开测试值。
