---
title: 代码
---

# 代码

## 说明

`codeWing`(标识 `code`)是处理代码块(`<pre><code>`)的不可变翅膀对象。

它是 `holds: 'inline'` 的容器,里面的文本在 `repair` 阶段会被规整为纯文本,不会嵌套别的行内标记或块。

在空行敲 ` ``` ` 再按空格或 Enter,就会变成代码块——像 ` ```ts ` 那样在后面接上语言,那门语言也会一并被识别。用 `Tab`/`Shift+Tab` 给代码行加缩进或减缩进,选中多行时一并生效。按 Enter 会自动延续上一行的缩进深度。

光标在代码块内时会出现动态上下文工具栏,提供直接输入语言的框、"无语言"按钮,以及常用语言的快捷按钮:

```
javascript typescript jsx tsx · python java kotlin swift
c cpp csharp go rust · php ruby sql
html xml css scss · json yaml toml markdown
bash powershell dockerfile diff
```

即使是上面列表里没有的语言,也可以直接在输入框里敲上去,输入的值会原样传给语法高亮器。

## 上色要接到翅膀上

`highlight` 是一个接收源码和语言、返回令牌数组的钩子函数:`(source, lang) => { text: string, type?: string }[]`。

令牌的 `type` 返回 `CODE_TOKEN_TYPES` 中定义的十四种标准令牌类型之一(`keyword`、`string`、`number`、`comment`、`function`、`class`、`variable`、`operator`、`punctuation`、`tag`、`attribute`、`literal`、`regexp`、`meta`)。

核心样式表通过 `[data-nabi-token="…"]` 选择器,给五种默认令牌(`comment`、`string`、`keyword`、`number`、`literal`)赋上主题颜色。要用深色模式或自定义颜色,可以覆盖对应的 CSS 选择器。

```css
.dark .nabi-content [data-nabi-token="keyword"] { color: #c9a0ff; }
```

要接入 Shiki、Prism 这类外部高亮器时,用 `makeCodeAttach` 来搭建 `attach` 钩子。

```ts
import { codeWing, makeCodeAttach } from 'nabi-note'

const wing = { ...codeWing, attach: makeCodeAttach({ highlight: myHighlighter }) }
```

如果像 Shiki 那样异步加载语法包,可以传入 `version` 选项,在语法加载完成时重新给编辑器画面上色:

```ts
let grammarAge = 0
const wing = {
  ...codeWing,
  attach: makeCodeAttach({ highlight: myHighlighter, version: () => grammarAge }),
}

// 异步语言语法加载完成时
grammarAge += 1
```

存下来的 HTML 结构遵循标准格式:`<pre data-nabi-lang="ts"><code class="language-ts">`。每个令牌都用 `data-nabi-token` 属性安全地标记。

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, codeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翅膀清单把种类知识、命令、装配器一起搭起来 —— 这就是 `registry`
const { nabi, registry } = createNabiWith([codeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 演示

<WingDemo path="/wing/block/code" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
