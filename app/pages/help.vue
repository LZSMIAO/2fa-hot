<script setup lang="ts">
const localePath = useLocalePath()
definePageMeta({ viewTransition: false })
const { tx } = useMessages()
const route = useRoute()
// Position the freshly mounted article before its first paint. Nuxt's later
// router scroll then resolves to the same position instead of flashing the top.
onMounted(() => {
  if (!route.hash) return
  const target = document.getElementById(decodeURIComponent(route.hash.slice(1)))
  target?.scrollIntoView({ behavior: 'instant', block: 'start' })
})
</script>
<template>
  <article class="content-page">
    <NuxtLink :to="localePath('/')" class="back-link"
      ><UIcon name="i-lucide-arrow-left" />{{ tx('返回验证码工具') }}</NuxtLink
    >
    <h1>{{ tx('使用说明') }}</h1>
    <p class="article-lead">{{ tx('输入格式、验证参数，以及常见问题。') }}</p>
    <nav class="article-nav" :aria-label="tx('本页目录')">
      <a href="#start">{{ tx('开始取码') }}</a
      ><a href="#troubleshooting">{{ tx('问题排查') }}</a
      ><a href="#links">{{ tx('取码链接') }}</a
      ><a href="#history">{{ tx('历史与备份') }}</a>
    </nav>
    <h2 id="start">{{ tx('如何获取验证码') }}</h2>
    <ol>
      <li>
        {{
          tx(
            '如果你已经有别人提供或以前保存的 2FA 密钥，直接复制即可，不用重新设置账号。密钥是一长串字母和数字，不是登录密码，也不是会过期的六位验证码。'
          )
        }}
      </li>
      <li>{{ tx('将密钥粘贴到首页，也可以导入二维码图片或扫描二维码。') }}</li>
      <li>{{ tx('复制当前验证码，回到原服务完成验证。') }}</li>
    </ol>
    <p>
      {{
        tx(
          '密钥通常由字母 A–Z 和数字 2–7 组成。六位验证码是计算结果，不能反推出密钥。网站不会替你找回已丢失的密钥。'
        )
      }}
    </p>
    <h2 id="troubleshooting">{{ tx('验证码为什么无法使用？') }}</h2>
    <ul>
      <li>{{ tx('确认设备开启了自动设置日期和时间。') }}</li>
      <li>{{ tx('使用本周期的验证码，接近更新时可以等下一组。') }}</li>
      <li>{{ tx('检查密钥是否完整，以及原服务是否重新设置过双重验证。') }}</li>
      <li>{{ tx('确保算法、位数、更新周期与原服务一致。默认 SHA-1、6 位、30 秒。') }}</li>
    </ul>
    <h2 id="links">{{ tx('通过链接取码') }}</h2>
    <p>
      {{ tx('生成有效验证码后，点击“获取链接”。链接形式为')
      }}<code dir="ltr">https://2fa.hot/2fa/{{ tx('密钥') }}</code
      >{{ tx('，打开后立即显示验证码。非默认算法、位数和周期会自动包含在链接参数中。') }}
    </p>
    <p>
      {{
        tx(
          '链接包含完整密钥，会随页面请求到达站点托管服务，并可能保留在浏览器历史中。请仅交给需要使用的人，不要发布到公共空间。'
        )
      }}
    </p>
    <p>{{ tx('把链接末尾的“密钥”换成你自己的完整密钥，打开就能查看当前验证码。') }}</p>
    <h2>{{ tx('批量取码') }}</h2>
    <p>
      {{
        tx(
          '每行输入一个密钥或 otpauth 配置 URI。也可使用“标签 + 制表符 + 密钥”。每次最多 100 条，格式有误的行会单独标记，不影响其他结果。“复制全部”只包含有效验证码，不包含密钥。'
        )
      }}
    </p>
    <h2>{{ tx('二维码与配置链接') }}</h2>
    <p>
      {{
        tx(
          '在 Google Authenticator 中打开“转移账号 → 导出账号”，选好账号后生成二维码。在这里扫码或选择截图；有多张二维码时，请全部导入。'
        )
      }}
    </p>
    <h2 id="history">{{ tx('本地历史与备份') }}</h2>
    <p>
      {{
        tx(
          '默认不保存。你可以主动开启本地历史并设置解锁口令，有效输入会在开启并解锁后自动加密保存，单条和批量均支持；教学演示过程不保存。闲置 30 分钟后自动锁定，解锁后继续自动保存。'
        )
      }}
    </p>
    <p>
      {{
        tx(
          '口令无法找回，浏览器数据清理后记录也会丢失。可导出加密备份，并在开启、解锁本地历史后导入合并。不同设备之间不自动同步。'
        )
      }}
    </p>
    <h2>{{ tx('复制或扫码没有反应？') }}</h2>
    <p>
      {{
        tx(
          '复制和摄像头需要浏览器权限以及 HTTPS（本地开发可用 localhost）。权限被拒绝时，可以手动选中验证码复制，或用图片导入代替摄像头。网站不会自动读取你的剪贴板。'
        )
      }}
    </p>
  </article>
</template>
