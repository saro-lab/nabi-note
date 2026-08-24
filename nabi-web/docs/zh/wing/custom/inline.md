---
title: 制作行内标记
description: place 'mark' —— 罩在文字上的格式。出去的路（toHtml）和进来的路（claim）要一起写。
---

# 制作行内标记

`place: 'mark'` 是**罩在文字上的格式**。不占位置，不打断文字的流动，还能互相
叠在一起——加粗、斜体、荧光笔全都是这一类。

---

## 一个配齐了的标记

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),
    button: {
      group: 'emphasis',
      label: { zh: '快捷键' },
      shortcut: 'K',
      action: { kind: 'mark' },        // 切换由核心来做——不用写命令
    },
    styles: `.nabi-content kbd {
      font-family: var(--nabi-font-mono, monospace);
      border: 1px solid var(--nabi-line); border-radius: .25em; padding: 0 .3em;
    }`,
  }),
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

`simpleMark` 帮你填好的是 `place: 'mark'` 和 `escapeKeys: ['Escape']` 两个。
其余原样传下去。

---

## 两个方向要分开写

| | 方向 | 没写会怎样 |
|---|---|---|
| `toHtml` | 文档 → HTML | **注册会失败。** 立节点的翅膀必须有画法 |
| `claim` | HTML → 文档 | 画得出来，但**读不回去。** 存了再读回来外壳就被剥掉 |

内置的六个基础标记（`b`·`i`·`u`·`s`·`sub`·`sup`）和四个值标记（`hl`·`tc`·
`fs`·`tf`）**核心已经认得标签了。** 所以 `boldWing` 既没有 `toHtml` 也没有
`claim`。自己起的名字核心不认识，两个都要写。

### `toHtml`

```ts
toHtml: (node, children, ctx) => ctx.element('kbd', children())
```

| 参数 | 是什么 |
|---|---|
| `node` | 此刻的节点。属性用 `node.a?.['键']` 取出来 |
| `children()` | 画好的内部文字。**调用的时候才画**，不调用内容就出不来 |
| `ctx` | 用来安全构建的工具 |

`ctx` 提供的东西：

| | |
|---|---|
| `ctx.element(tag, inner, attrs?)` | 造一个元素。值会自动转义 |
| `ctx.escape(text)` | 只转义文字 |
| `ctx.url(raw)` · `ctx.src(raw)` | 过滤地址。不可信的地址是 **`null`** |
| `ctx.keys` | 现在是不是**给编辑器用**的组装（`getEditorHtml()`） |

::: warning 不要直接拼接字符串
写成 `` `<kbd>${node.a?.['t']}</kbd>` `` 这样的话，文档里的文字会原样变成
标记语言。永远要经过 `ctx.element` 或 `ctx.escape`。
:::

### `claim`

```ts
claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null)
```

| | |
|---|---|
| `el` | `{ kind, tag, attrs, children }`——进来时原样的元素 |
| `inner(block)` | 读取里面的内容。是标记就传 `false`（文字位置），是块就传 `true` |
| 答案 | 节点数组，或者 **`null`**（不是我的 → 交给下一只翅膀） |

答 `null` 的情形有两处——标签不是我的，以及**标签是我的但值不在清单里**。
后一种情况答 `inner(false)` 就只剥壳、留住文字。

---

## 带值的标记

像颜色、大小这样**从固定清单里选一个**的标记，用 `valueMark`。

```ts
import { valueMark, type Wing } from 'nabi-note'

const LEVELS = ['low', 'mid', 'high'] as const

const riskWing: Wing = {
  ...valueMark({
    w: 'risk',
    key: 'v',                        // 值住的属性字段
    values: [...LEVELS],             // 清单外的值不接受
    toHtml: (node, children, ctx) =>
      ctx.element('span', children(), { 'data-risk': String(node.a?.['v'] ?? '') }),
  }),
  claim: (el, inner) => {
    if (el.tag !== 'span') return null
    const v = el.attrs['data-risk']
    if (v === undefined) return null
    if (!LEVELS.includes(v as typeof LEVELS[number])) return inner(false)   // 清单外——只留文字
    return [{ w: 'risk', a: { v }, ch: inner(false) }]
  },
}
```

`valueMark` 附带的两样东西：

- **`currentValue`**——此刻光标所在位置的值。工具栏和上下文工具栏靠这个答案
  给对应的格子上色。
- **`repair`**——在 JSON 入口重新检查这个值是否还在清单里，不在的话就
  **自动把节点归一化。** 手改过的存值混进来也会在这里被挡下。

---

## `escapeKeys` ——离开标记

光标停在标记末尾时，下一个字算在标记里面还是外面，只有人自己知道。
`escapeKeys` 就是那道门。

```ts
escapeKeys: ['Escape']    // simpleMark·valueMark 的默认值
```

**光标不会移动。** 按下这个键，就等于预约了"下一个敲的字要离开这个标记"。
敲一个字之后这个预约就用掉、消失了。

```
<kbd>Ctrl</kbd>(光标)  →  按 Escape  →  敲 "+"  →  <kbd>Ctrl</kbd>+
```

::: tip 连按两下 <kbd>Esc</kbd> 会再往前走一步
连按的计数**不管前面那一下有没有把这个键吃掉，照样往下数。** 所以就算第一下
<kbd>Esc</kbd> 已经撤掉了一个预约、或者预约了一次标记离开，第二下 <kbd>Esc</kbd>
还是会一路走到[清除格式](../etc/clear-format)——光标停在荧光笔正中间就是这个
例子。`escapeKeys` 和 `doubleKeys` 只是名字看着像，互相不挡道。
:::

---

## 标记拿不到键

就算写了 `onKey` 也**轮不到标记。** 键盘事件的归属权属于光标路径（`path`）
上层的块级容器（段落、引用、表格之类）——标记是嵌在文字里面的行内节点，
没办法单独拿到键盘的归属权。

---

## 接下来的文档

- [块与段落属性](../custom/block) —— 占位置的东西
- [键、自动转换、粘贴](../custom/input) —— `onKey` 和 `inputRules`
- [UI 与行为](../custom/ui) —— 工具栏按钮和上下文工具栏

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
