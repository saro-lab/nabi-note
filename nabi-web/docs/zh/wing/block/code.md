---
title: 代码
description: 保存多行代码，以及用于语法高亮的语言信息。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 代码

把多行代码作为不同于普通正文的内容插入。在空段落中输入三个反引号后按 Space 或 Enter，或从工具栏切换为代码块。如果在反引号后加上 `ts` 这样的语言名称，该名称也会一起保存。

语言名称是语法高亮使用的标识符，注册列表之外的名称也可以手动输入。由于代码内容和缩进必须保留，代码块不接受段落对齐。

<WingDemo path="/wing/block/code" />

```ts
const selected = wings().use('code').build()
```

## 连接代码高亮器

注册代码块后，编辑器内部会使用默认着色。若发布页面也要为代码着色，请连接 `nabi-note/viewer`。viewer 会找到 `pre > code`，并把父元素的 `data-nabi-lang` 值作为语言名称读取。如果没有该值，就检查 `code` 元素上的 `language-...` class。

```ts
import { attachViewer } from 'nabi-note/viewer'

const viewer = attachViewer(article, {
  locale: 'zh',
})

// 替换发布 HTML 后
viewer.refresh()

// 关闭画面时
viewer.unmount()
```

如果没有单独的高亮器，或该高亮器无法处理当前语言，就会改用无依赖的内置 tokenizer 着色。高亮器插入的 token span 只存在于画面上，不会写回保存的 JSON 或原始发布 HTML。`refresh()` 和 `unmount()` 会移除这些 span，并从当前原始代码重新连接。

### NABI 网站如何连接 Shiki

NABI 网站会动态加载高亮器，让 Shiki 不进入首屏或 SSR bundle。`nabi-web/docs/.vitepress/src/highlight.ts` 中的 `loadCodeHighlighting()` 会创建 Shiki core，并且只有在真正需要某种语言的代码时才加载该语言 grammar。下面的例子在发布页面中使用同样的连接方式。

```ts
import { attachViewer } from 'nabi-note/viewer'
import { loadCodeHighlighting } from '../src/highlight'

const highlighting = await loadCodeHighlighting()
const viewer = attachViewer(article, {
  locale: 'zh',
  highlight: highlighting?.highlight,
})

const stop = highlighting?.onGrammarLoaded(() => viewer.refresh())

// 关闭画面时
stop?.()
viewer.unmount()
```

某种语言第一次出现时，grammar 下载才会开始。在那之前，代码块会用内置 tokenizer 或纯文本显示。grammar 到达后，`onGrammarLoaded()` 会调用 `viewer.refresh()`，再次为代码块着色。这样只下载需要的语言，即使 grammar 晚到，也能在不重新进入页面的情况下应用。

编辑器侧也使用同一个 `highlight` 函数。NABI 网站 demo 只把默认 `codeWing` 的 `attach` 替换为 `makeCodeAttach({ highlight, version })`。每次 grammar 到达时 `version` 都会变化，并作为信号重新绘制已经显示的代码。独立服务可以先实现发布页面连接，只有在编辑中也需要 Shiki 着色时再加入这种方式。

## CSS 样式

用 `.nabi-content pre` 设置代码块样式，用 `.nabi-content pre > code` 设置代码样式。不要改变 `white-space`，因为它会影响代码换行和编辑。token 颜色可以通过 `[data-nabi-token]` 选择器修改。

```css
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
```
