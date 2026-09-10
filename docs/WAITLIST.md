# Wait list · 功能许愿

查看正在探索的功能，也欢迎提出你希望 2fa.hot 增加的内容。清单会持续更新；收录不代表承诺上线日期。

[网站清单](https://2fa.hot/zh-CN/waitlist) · [我要许愿 / Make a wish](https://github.com/LZSMIAO/2fa-hot/issues/new?template=feature-request.yml) · [查看大家的愿望 / Community wishes](https://github.com/LZSMIAO/2fa-hot/issues?q=is%3Aissue%20label%3Aenhancement)

## 如何许愿

1. 先查找是否已有相同建议。有的话可以用 👍 表达支持，或在原讨论中补充使用场景。
2. 点击“我要许愿”，登录 GitHub，填写功能方向、使用场景、遇到的问题和期待的效果。可以使用你熟悉的语言。
3. 提交后会创建公开的 GitHub Issue，后续讨论与处理进度保留在同一处。是否进入开发由维护者评估。

**不要填写真实密钥、验证码、账号密码、私密取码链接，也不要附上含有这些内容的二维码、截图或备份。** 安全漏洞请通过[私密报告](https://github.com/LZSMIAO/2fa-hot/security/advisories/new)提交。

Use the links above to browse or submit feature wishes in any language. Posting requires a GitHub account and creates a public issue. Check for duplicates first; reactions and additional context are welcome. Never include secrets, codes, passwords or private account data. Listed ideas are not release commitments.

## 探索中的功能 / Under consideration

- [授权取码分享](#授权取码分享)：本人在线批准并代算，接收人只获取验证码。**尚未上线。**
- Authorized code sharing: the owner stays online and approves access; recipients receive codes without the original secret. **Not available yet.** Revocation stops future access, not codes already received.

## 授权取码分享

- 状态：待设计、待实现。
- 记录日期：2026-09-10。
- 目标：用户分享取码权限，接收人只获取验证码，不接收原始 2FA 密钥。避免将明文密钥或可在接收方解密出密钥的数据直接放进分享链接。

### 优先方案：本人设备在线批准并代算

1. 分享者点击“临时分享”，设置有效期和接收人。
2. 生成不可猜测的随机邀请链接，不包含原始密钥。
3. 接收人打开邀请并完成身份确认，由分享者确认放行。邀请链接本身不应成为绕过接收人验证的唯一凭证。
4. 分享者浏览器在本地计算当前验证码，通过经过身份确认的端到端加密通道发送；中转服务只转发密文。
5. 接收方页面只显示验证码，不提供密钥或密钥导出能力。
6. 到期或撤销后停止提供新验证码；分享者离线时明确提示暂时无法取码。

实施前需要设计接收人身份与加密通道的绑定、邀请有效期、授权及撤销状态、断线重连和请求频率限制。不能仅凭中转服务提供的公钥就宣称已经确认接收人身份。

### 备选方案与取舍

| 方案                 | 密钥位置                   | 主要限制                                                                               |
| -------------------- | -------------------------- | -------------------------------------------------------------------------------------- |
| 本人设备代算（优先） | 分享者设备                 | 分享者必须在线；手机后台可能暂停或断开连接                                             |
| 服务器代算           | 服务器受保护存储或密钥服务 | 支持分享者离线，但网站需要承担密钥保管、访问控制和审计责任，改变当前本地计算的隐私边界 |
| 预生成短期验证码     | 原密钥留在分享者设备       | 仅适合有限时间窗口；已经交付的验证码无法撤回，不适合长期授权                           |

### 必须明确的安全边界

- 获得验证码就获得了相应的登录验证能力，即使没有拿到原密钥。接收人仍能复制或转发已收到的验证码。
- 撤销只能阻止继续获取验证码，不能收回已经显示且仍被原服务接受的验证码，也不能终止原服务已建立的登录会话。
- 如果仅凭链接就能取码，任何拿到链接的人都能使用该权限；隐藏原密钥不等于链接可以公开分享。
- 将密钥加密放进链接、再在接收方浏览器解密，不能保证接收人无法提取密钥。隐藏按钮、混淆代码或不可导出的浏览器密钥也不能作为对接收人设备的绝对保护。
- 对普通网页中的标准 TOTP，不能同时承诺“分享者离线、服务器不持有密钥或等效计算能力、接收人永久独立取码且无法复制这种能力”。
- 本人在线代算方案减少密钥交付范围，但不能保证抵御分享者设备被控制、恶意浏览器扩展或页面脚本被篡改。

### 参考

- [RFC 6238：TOTP](https://www.rfc-editor.org/rfc/rfc6238.html)
- [W3C：授权链接设计建议](https://www.w3.org/TR/capability-urls/)
