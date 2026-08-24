---
title: AI 氛围编程
description: 借助 llms.txt，指导你和 AI 编程助手一起引入并开发 NABI NOTE。
---

# AI 氛围编程

**`llms.txt`** 是网站用来把项目结构和用法高效交给 AI 代理（LLM）的一套标准规格。不用 HTML
标记，而是用 AI 容易解析的干净 Markdown 文档提供项目的规格和 API。完整规格见
[llmstxt.org](https://llmstxt.org/)。

NABI NOTE 官方站点也完整支持 `llms.txt`。不需要一段段复制文档，**只要把下面这个 URL
交给 AI 代理**，它就会自己去探索文档并完成工作。

```
https://nabi.saro.me/llms.txt
```

Cursor、Claude Code、OpenAI Codex、Windsurf 等主流 AI 编程工具都支持 llms.txt 标准。

## 第一次引入的时候

第一次把 NABI NOTE 引入项目时，只要说明想要的功能、是否支持浅色/深色模式、部署环境
（SSR/CSR/CDN），AI 代理就会写出最合适的代码。

### npm + 服务器渲染（SSR）——Next.js、Nuxt、SvelteKit 等

```
我们想把 nabi-note 作为新编辑器引入网站。说明书请参考
https://nabi.saro.me/llms.txt。我们站点有浅色/深色模式，编辑器主题也要跟着
匹配。默认自带的翅膀全部启用。

我们的服务用 Nuxt 做服务器端渲染，希望首次访问时页面不闪烁，能由服务器提前
渲染好再送下去。请用 npm 包安装，并用 SSR + hydrate 的方式接入。
```

### npm + 仅浏览器端（CSR）——Vite、CRA、SPA 环境

```
我们想把 nabi-note 作为新编辑器引入网站。说明书请参考
https://nabi.saro.me/llms.txt。我们站点有浅色/深色模式，编辑器主题也要跟着
匹配。默认自带的翅膀全部启用。

这是一个基于 Vite 的前端 SPA 环境，不需要服务器端渲染。请用 npm 包安装，只在
浏览器端组装。
```

### CDN——静态 HTML 环境

```
我们想把 nabi-note 作为新编辑器引入网站。说明书请参考
https://nabi.saro.me/llms.txt。我们站点有浅色/深色模式，编辑器主题也要跟着
匹配。默认自带的翅膀全部启用。

这个页面是没有构建工具的静态 HTML，请用 `<script>` 和 `<link>` 标签接入。
```

::: tip 主题（浅色/深色）会自动适配
`nabi.css` 内置了浅色默认值、`.dark` 类和明确的 `.light` 类。编辑器主题会跟着页面根元素
上 `class="dark"` 的切换自动变化。要自定义品牌专属颜色，请让代理一并参考
`llms/styling.md`。
:::

## 添加或自定义功能时

在已经接好的编辑器上添加或修改功能时，比起直接叫它动手实现，**先请它调查并拿出实现
计划**更安全——尤其是涉及后端 API 的功能（比如文件上传），需要先把需求理清楚。

### 示例提示词——先调查、先拿计划

```
我想接入文件上传功能。请参考 https://nabi.saro.me/llms/wings.md 和
https://nabi.saro.me/llms/api-reference.md，先调查一下要启用 upload
翅膀，后端 API 规格（接口地址、允许的扩展名/大小限制、响应 JSON 格式等）和
前端接入代码应该怎么设计。先不要直接写代码，把要准备的需求和实现计划整理
出来给我看。
```

### 示例提示词——简单的样式修改

```
请参考 https://nabi.saro.me/llms/styling.md，把编辑器的强调色（Accent）和
深色主题背景色改成我们的品牌颜色，用 CSS 变量重新定义。
```

::: tip 违反规格的翅膀会在注册时立刻抛出异常
让代理写新的自定义翅膀时，请让它一并参考
[`llms/custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md)。保留字冲突、缺少必需
方法之类的常见错误不会等到运行时才暴露，**会在初次注册时立刻作为异常被发现**。
:::

::: tip 记在项目规则文件里
在项目指南文档（`CLAUDE.md`、`.cursorrules`、`AGENT.md` 等）里加上下面这段话，以后只要
说"给编辑器加上 ~ 功能"，AI 就会自己去参考 `llms.txt`。

```md
本项目使用 `nabi-note` 作为 WYSIWYG 编辑器。相关工作前请先确认
https://nabi.saro.me/llms.txt 文档。
```
:::

## 接下来的文档

- [{{ t('menu_intro_index') }}](../intro) —— NABI NOTE 介绍及架构
- [{{ t('menu_wing_custom') }}](../wing/custom) —— 自定义翅膀制作指南

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
