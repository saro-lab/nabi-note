---
title: 键、自动转换、粘贴
description: 用 onKey 拦截按键，用 inputRules 单靠敲字做出格式，用 attach 碰画面。
---

# 键、自动转换、粘贴

翅膀接住人的动作的门有三个——**键**（`onKey`）、**文字**（`inputRules`）、
**画面**（`attach`）。

---

## 按键经过的路

按下一次 <kbd>Enter</kbd>，会按这个顺序去问。前面有谁处理了，后面就不会
再问。

```
① 工具栏快捷键         在任何地方都听（比如 Ctrl+B）
② 自动转换             inputRules —— 只有 Enter·Space
③ 翅膀的 onKey         交给光标所在位置的主人
④ 瞄准块状物件         段落最前面按退格 → 整个选中前面的块状物件
⑤ 核心规则             拆分段落、删除、光标移动
⑥ 浏览器               到这里还没人接手的时候才轮到
```

---

## `onKey` ——拦截按键

```ts
import type { OnKey } from 'nabi-note'

const noteKeys: OnKey = (intent, doc, sel, env, owner) => {
  if (intent.key !== 'backspace') return null      // 不是我的事——交给核心
  if (sel.focus.offset !== 0) return null
  const first = [...owner.path, 0]
  if (first.length !== sel.focus.path.length) return null
  if (!first.every((v, i) => v === sel.focus.path[i])) return null
  return toggleNote(doc, sel, {}, env)             // 第一格最前面按退格——展开笔记
}

const noteWing: Wing = {
  w: 'note',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
  commands: { toggleNote },
  onKey: noteKeys,
}
```

| 参数 | 是什么 |
|---|---|
| `intent` | `{ key, dir? }`——是哪个键 |
| `doc` · `sel` · `env` | 和命令接收的一样 |
| `owner` | `{ path, node }`——**我被选为主人的那个节点** |

答案和命令一样是 `{ doc, selection }` 或者 **`null`**。`null` 代表"不接手"，
核心会接着处理——条件不满足时一定要答 `null`。

### 会传来的键

| `intent.key` | 什么时候 |
|---|---|
| `'enter'` | <kbd>Enter</kbd> **和** <kbd>Shift</kbd>+<kbd>Enter</kbd> 两个都算 |
| `'tab'` · `'shiftTab'` | <kbd>Tab</kbd> · <kbd>Shift</kbd>+<kbd>Tab</kbd> |
| `'backspace'` · `'delete'` | 两种删除 |
| `'arrow'` | 方向键。方向是 `intent.dir`（`'left'`·`'right'`·`'up'`·`'down'`） |

普通字符键不会传来。字符是浏览器敲出来、核心接住记下的。

### 主人只有一个

沿着光标的路径**往上走遇到的第一个不是段落的节点**，拥有那个节点的翅膀就是
主人。

```
路径 [1, 0, 0] 上的光标                候选主人
  [1, 0, 0]  →  p        是段落，跳过
  [1, 0]     →  note     ← 是主人
  [1]        →  p(包装段落)  走不到这里
```

所以**最里面的容器赢**——表格里的列表中按 <kbd>Tab</kbd>，是列表接住它。
部件（`parts`）也能当主人，这时 `owner.node` 是部件节点，但被调用的 `onKey`
是声明它的那只翅膀的。所以惯例是先用 `owner.node.w` 分辨出被选中的是什么。

标记不能当主人——[原因见行内标记文档](./inline#标记拿不到键)。

---

## `inputRules` ——单靠敲字做出格式

敲 `# ` 变成标题、敲 `> ` 变成引用，靠的就是这个。

```ts
inputRules: [
  { trigger: 'space', pattern: /^>$/, run: () => ({ name: 'toggleQuote' }) },
]
```

| 字段 | |
|---|---|
| `trigger` | `'space'` 或 `'enter'`——在敲下这个键的**那一刻**检查 |
| `pattern` | 正则表达式。`run` 会拿到这次匹配 |
| `run` | `{ name, args? }`——要跑的命令 |
| `scope` | `'block'`（默认）或 `'word'` |

### `'block'` ——替换整个行首

看光标前面的**这一行行首**。匹配的话就删掉那段行首（连同触发的那个字符）
再跑命令。

```
敲 "> "   →   ">" 被删掉，toggleQuote 跑起来
```

只在段落的**第一行**生效。用 <kbd>Shift</kbd>+<kbd>Enter</kbd> 换行之后的
那一行不会触发——这挡住了在已经写好的文字正中间冒出格式的情况。

### `'word'` ——罩住一个词

看光标前面的**这一个词**。匹配的话就选中那个词跑命令，再把光标放回原处。
文字不会被删掉——给词加标记走的是这条路。

那个词**如果已经带着这只翅膀的标记就会跳过。** 同一个地方不会被触发两次。

### 共同规则

- 只在光标**处于折叠状态时**生效。选中一段范围再敲空格不会触发。
- 只在普通段落里生效——装着块状物件的包装段落不会触发。
- 按翅膀数组顺序依次检查，**第一条成功的规则**胜出。
- 命令答 `null`（=没什么可做）时**会撤销、换下一条规则试**。自动转换失败的
  痕迹不会留在文档里。

---

## `attach` ——碰画面

有时候要接住的不是改文档，而是**画面上发生的事**——用拖拽选中表格的格子、
给代码上色、按折叠块的小三角。

```ts
import type { Attach } from 'nabi-note'

const attachNote: Attach = (host) => {
  const onClick = (ev: MouseEvent): void => { /* … */ }
  host.root.addEventListener('click', onClick)
  return () => host.root.removeEventListener('click', onClick)   // 答出解绑函数
}
```

`host` 提供三样东西。

| | |
|---|---|
| `host.root` | 编辑表面的元素 |
| `host.nabi` | 编辑器实例。要改文档得**用命令**做 |
| `host.pathOfKey(id)` | 把画面上的 `data-key` 转成文档里的路径 |

`mountSurface` 会把所有已注册翅膀的 `attach` 一并挂上，卸载时调用答出的
解绑函数。**这是唯一允许住着认识 DOM 的代码的地方**——在命令、`toHtml`、
`repair` 里面不该碰 `document`。

::: tip 用 `data-key` 找到文档里的位置
给编辑器用的组装（`getEditorHtml()`）会给每个节点挂上 `data-key`。找到被点
的元素最近的 `[data-key]`，传给 `host.pathOfKey()` 就能拿到文档里的位置。
:::

---

## 粘贴与初始 HTML

粘贴、`setHtml()`、加载存值**全都经过同一道门。** 翅膀在这里要做的只有
`claim` 一件事——写在[行内标记文档的 `claim`](./inline#claim) 里。

```
粘贴     ─┐
setHtml  ─┼→ 解析 → 翅膀的 claim → 核心的默认标签对应 → repair → cocoon → 文档
初始 HTML ─┘
```

没有 `claim` 的话，**那个标签的外壳会被剥掉，只留下里面的文字。** 从别的
编辑器复制来的陌生标记不会原样嵌进文档，靠的就是这条规则。

从 JSON 进来的路（`setJson()`）拿到的不是标签而是节点，所以守门的不是
`claim` 而是 `repair`。

---

## 接下来的文档

- [UI 与行为](../custom/ui) —— 工具栏按钮和上下文工具栏
- [行内标记](../custom/inline) · [块与段落属性](../custom/block)

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
