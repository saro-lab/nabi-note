---
title: AI 氛围编程
description: llms.txt
---

# AI 氛围编程

**`llms.txt`** 是网站用来把内容交给 AI 代理（LLM）的一套规格。不用 HTML，而是用代理能
直接读懂的 Markdown，把项目的结构和用法整理好。完整规格在 [llmstxt.org](https://llmstxt.org/)。

这个站点也开了这道门。地址不用背下来——像下面这样，**把地址交给代理**，剩下的它自己会
跟着走。

```
https://nabi.saro.me/llms.txt
```

Cursor、Claude Code、OpenAI Codex、Windsurf 等都支持 llms.txt 标准。

## 第一次引入的时候

要把 nabi-note 装进还没用过它的站点时，一次性告诉代理想打开哪些功能、有没有浅色/深色
模式、打算怎么部署——剩下的它会自己装配起来。**下面三种情况只有最后一句不一样，其他
照抄就行**。

### npm + 服务器渲染（SSR）——每次请求都在服务器（Node）上画好再送下去

不管是自己搭的 Node 后端，还是 Next.js、Nuxt、SvelteKit 这类 SSR 框架，都算这一种——
两者都是每次请求在 Node 上把文档画好再送下去。

```
我们想把 nabi-note 装进来当新编辑器用。说明书用 https://nabi.saro.me/llms.txt。
我们站点有浅色/深色模式，编辑器也要跟着配。默认自带的翅膀全部打开。

我们这边用 Nuxt 做服务器渲染，想让访客一进页面文字就已经画好了。用 npm 装进来，
接上 SSR 和 hydrate。
```

### npm + 只在浏览器里装配（CSR）——有打包工具但不需要服务器渲染

```
我们想把 nabi-note 装进来当新编辑器用。说明书用 https://nabi.saro.me/llms.txt。
我们站点有浅色/深色模式，编辑器也要跟着配。默认自带的翅膀全部打开。

前端用 Vite 打包，不需要服务器渲染。用 npm 装进来，只在浏览器里装配就行。
```

### CDN——没有打包工具的静态页面

```
我们想把 nabi-note 装进来当新编辑器用。说明书用 https://nabi.saro.me/llms.txt。
我们站点有浅色/深色模式，编辑器也要跟着配。默认自带的翅膀全部打开。

这个页面是没有打包工具的静态 HTML。用 <script> 标签接上。
```

:::: tip 浅色·深色不用另外交代
`nabi.css` 已经带着浅色默认值、`.dark` 覆盖和明确的 `.light` 覆盖三份。页面的
`dark`/`light` 类不用动，编辑器会自动跟着走。要换品牌色的话，让代理顺便读一下
`llms/styling.md`。
::::

这三段提示只有最后一句不一样——代理会分别去找并读 `llms/ssr.md`（加上
`llms/quickstart-npm.md`）、`llms/quickstart-npm.md`、`llms/quickstart-cdn.md`，
照那条路接上。

## 修改、增加或去掉功能的时候

nabi-note 已经装好之后，改动或新增功能时，比起直接叫它动手实现，**先让它调查、
拿出计划**更安全——尤其是牵扯到后端的功能，得先知道要准备什么。

### 例子——先调查、先拿计划

```
我想加上传功能。读一下 https://nabi.saro.me/llms/wings.md 和
https://nabi.saro.me/llms/api-reference.md，查一下要打开 upload 翅膀，
我们后端需要准备什么（接收文件的地址、允许的扩展名和大小限制、失败时该
返回什么样子）。先别动手实现，只要把要准备的东西列成计划给我看看。
```

代理会在 `llms/wings.md` 里查到 `upload` 是一只接收 `Uploader` 的工具（tool）
翅膀，再在 `llms/api-reference.md` 里核对 `mountUpload`·`Uploader`·
`allowLocalUrls` 的实际签名，然后把后端要开放的地方和前端自己决定的值分开，
整理成一份计划。看过计划、确认没问题后，再让它接着实现。

### 更简单的例子——可以直接叫它动手

不需要计划的小改动，可以直接开口。

```
读一下 https://nabi.saro.me/llms/styling.md，把强调色和深色主题的背景
换成我们的品牌色就行。
```

:::: tip 违反契约的翅膀会在注册那一刻就被扔出来
让代理造新翅膀时，让它顺便读一下
[`llms/custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md)。用保留字
当名字、或者要画节点却没给 `toHtml` 这类常见的错——不会等到后面才出问题，
**注册的那一刻就会被扔出来。** 那份文档"注册的那一刻就会死"一节整理了会
踩到哪些坑。
::::

:::: tip 装好之后，留一行字就够了
第一次接上之后，以后不用每次都重新交代地址。在项目的规则文件（`CLAUDE.md`·
`.cursorrules` 等）里留这样一行，之后只要说"用 nabi-note 做 ~"，代理自己
就会去找地址。

```md
这个项目用 `nabi-note` 做编辑器。相关工作前，先看一下
https://nabi.saro.me/llms.txt。
```
::::

## 接下来的文档

- [{{ t('menu_intro_index') }}](../intro) —— 本文档用的词
- [{{ t('menu_wing_custom') }}](../wing/custom) —— 把还没有的格式做成人读的文档

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
