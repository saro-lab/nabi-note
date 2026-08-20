---
title: 代码
---

# 代码

## 说明

`codeWing`（名字 `code`）是拥有代码块（`<pre>`）的**常量**——不带括号调用。

它是 `holds: 'inline'` 的容器，里面由 `repair` 强制压成纯文本——标记或别的
翅膀都插不进来。这不是契约里另外开的一个字段，而是这只翅膀自己收拾自己的
内容。

在空行里敲 ` ``` ` 再按空格或 Enter，就成了代码块——像 ` ```ts ` 那样在后面
接上语言，那门语言也会一起被认出来。用 `Tab`/`Shift+Tab` 给行加减缩进（选中
多行就一起来）。Enter 会承接上一行的缩进。

只有光标在代码里面时上下文工具栏才会出现——一个直接敲语言的输入框、
"无语言"，还有几个常用语言的格子。

```
javascript typescript jsx tsx · python java kotlin swift
c cpp csharp go rust · php ruby sql
html xml css scss · json yaml toml markdown
bash powershell dockerfile diff
```

这份清单只是**捷径**——不是核心认得的语言清单。这里没有的语言，直接敲进
第一个框里就行,那个值会原样交给上色器。

## 上色要接到翅膀上

`highlight` 是一个**返回种类而不是颜色的钩子**——形状是 `(源码, 语言) =>
{text, type?}[]`，`type` 固定是 `keyword`·`string`·`number`·`comment`·
`function`·`class`·`variable`·`operator`·`punctuation`·`tag`·`attribute`·
`literal`·`regexp`·`meta` 这十四个里的一个（`CODE_TOKEN_TYPES`）。

颜色由核心样式表直接用 `[data-nabi-token="…"]` 选择器定死——**只有五个种类
有颜色**（`comment`·`string`·`keyword`·`number`·`literal`）。其余种类只挂
标记、没有颜色规则,就用正文颜色。因为值是写死的颜色而不是 CSS 变量,想用
别的颜色或深色版本就得自己覆盖那个选择器。

```css
.dark .nabi-content [data-nabi-token="keyword"] { color: #c9a0ff; }
```

语法词典本身不在这个包里——Prism、highlight.js、Shiki 这类得自己接上。

上色这一边**接在翅膀上**——不用另外 mount。用 `makeCodeAttach` 造一个
`attach` 换到代码翅膀上，`mountSurface` 就会把它挂上。这个站点的演示就是
这样接上 Shiki 的例子（`.vitepress/src/highlight.ts`）。

```ts
import { codeWing, makeCodeAttach } from 'nabi-note'

// 翅膀是常量 —— 只换掉附着的那部分（`attach`）
const wing = { ...codeWing, attach: makeCodeAttach({ highlight }) }
```

一起给 `version` 的话,**文档没变、但上色那一边变了**的时候会重新上色。
异步取语法的上色器（Shiki 第一次遇到某门语言时就是这样）正是这种情况——
语法到了但文档没变，`onChange` 不会响，没有这个就得随便再敲一个字才上得了
色。

```ts
let grammarAge = 0
const wing = {
  ...codeWing,
  attach: makeCodeAttach({ highlight, version: () => grammarAge }),
}
// 语法晚到时 —— 把这个数加一就会重新上色
grammarAge += 1
```

存下来的值遵照外面的惯例——`<pre data-nabi-lang="ts"><code
class="language-ts">`，颜色以 `data-nabi-token` 属性的形式出去（不是内联
`style`）。

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
