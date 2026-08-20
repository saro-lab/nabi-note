---
title: 制作自定义翅膀
description: 没有的格式就做成翅膀 —— 填好一份契约，剩下的交给核心。
---

# 制作自定义翅膀

翅膀（wing）是**一个对象**。不用继承类，也没有单独的注册流程——放进递给
`createNabiWith` 的数组里，这个动作本身就是注册。

加粗、表格、上传也都是靠填这里列的这些字段做出来的。自己写的翅膀和内置翅膀
运行在**完全相同的条件**下——没有专门留给核心的近路。

---

## 最短的翅膀

一个认得 `<kbd>` 的行内标记。

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',                                                   // 这只翅膀的名字 —— 存值里的 `w` 就是它
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),   // 出去的画法
  }),
  // 举手认领进来的 HTML 里的 `<kbd>`
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

现在 `<kbd>` 会留在文档里。粘贴、`setHtml()`、保存、再读回来都不会丢。

```
注册了      <p>按：<kbd>Ctrl</kbd>+<kbd>S</kbd></p>   →   原样保留
没注册      <p>按：<kbd>Ctrl</kbd></p>              →   <p>按：Ctrl</p>
```

**这两个字段看的是相反的方向。** `toHtml` 是出去的路，`claim` 是进来的路。不写
`claim` 照样画得出来，但**读不回去**——存了再读回来的那一刻外壳就被剥掉。

`simpleMark` 是给不带属性的标记用的快捷方式。带值的标记有 `valueMark`，
块状物件有 `boxObject`，列表家族有 `listFamily`，除此之外就手写 `Wing` 对象。

---

## 翅膀是常量

**大多数翅膀已经是做好的常量**——`boldWing`、`headingWing` 这样直接放进数组
就行。只有需要选项的两个才另有工厂函数。

```ts
makeImageWing({ allowLocalUrls: true })
makeUploadWing({ allowLocalUrls: true })
```

只想换掉"贴上去的那部分"，把常量展开来写——这是改一个字段，而不是重新造一只
翅膀，所以更简单。

```ts
const wing = { ...codeWing, attach: makeCodeAttach({ highlight: myHighlighter }) }
```

---

## 注册与顺序

```ts
const { nabi, registry } = createNabiWith([boldWing, italicWing, kbdWing])
```

**数组顺序就是扫描顺序。** 判定一段标记归谁（`claim`）时，核心按这个顺序去问，
第一个答应的翅膀就拿走它。谁都不领走的话，外壳就被剥掉。

工具栏上是**分组（`button.group`）优先**。分组的顺序是钉死的，这个数组顺序只
决定同一分组**内部**的先后。

### 就死在注册的那一刻

`createNabiWith` 对违反契约的翅膀**立刻抛出异常。** 不会晚点才炸。

| 会被抓住的 | 例子 |
|---|---|
| 用保留字当名字 | `w: 'p'` · `w: 'br'` |
| 同一个名字注册了两次 | 两次 `boldWing` |
| 立节点的翅膀没有 `toHtml` | `place: 'mark'` 却没有画法 |
| 命令名违反规则 | 必须是动词+宾语的驼峰式（`insertTable`） |
| 缺少必需的搭档 | 上传需要 `img` 或 `a` 一起在场（`requiresAnyOf`） |

---

## 命令——是纯函数

改动文档的每一条路都要经过一个命令。命令**不认识 DOM，也不认识画面。**

```ts
import { boxObject, insertLump, type Command, type Wing } from 'nabi-note'

const insertStamp: Command = (doc, sel, args, env) => {
  // 这是从外面来的值，所以要检查 —— 不合适就什么都不做
  if (typeof args['text'] !== 'string') return null
  const stamp = { w: 'stamp', a: { t: args['text'] }, ch: [] }
  const r = insertLump(doc, sel.focus, stamp, env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

export const stampWing: Wing = {
  ...boxObject({
    w: 'stamp',
    attrs: { t: (v) => (typeof v === 'string' ? v : null) },
    toHtml: (node, _children, ctx) =>
      ctx.element('span', ctx.escape(String(node.a?.['t'] ?? '')), { 'data-nabi-stamp': '' }),
  }),
  commands: { insertStamp },
  button: {
    group: 'insert',
    label: { zh: '图章' },
    action: { kind: 'command', command: 'insertStamp', args: { text: '确认' } },
  },
}
```

| 参数 | 是什么 |
|---|---|
| `doc` | 此刻的文档（块的数组）。**不要改它——用新的一份来回答** |
| `sel` | 此刻的选区 |
| `args` | 按钮或上下文工具栏传进来的值。**是从外面来的，必须检查** |
| `env` | 种类知识——什么能装什么，什么是块状物件 |

答案是 `{ doc, selection }` 或者 **`null`**。**什么都没变就答 `null`**——这样
`applyCommand` 会答 `false`，也不会堆出撤销点。答出来的文档还会被 `cocoon`
再收拾一遍，所以没有哪个命令能留下破坏规则的文档。

调用的一方永远按名字走。

```ts
nabi.applyCommand('insertStamp', { text: '确认' })   // boolean
```

---

## 能填的全部字段

`Wing` 有二十五个字段，**必需的只有两个**（`w`·`place`）。

### 是什么

| 字段 | 意思 |
|---|---|
| `w` | 这只翅膀的名字。会成为存值里的 `w`。不能用保留字（`p`·`br`） |
| `place` | `'mark'` 罩在文字上 · `'void'` 没有内容的块状物件 · `'container'` 里面有文字的块状物件 · `'attr'` 段落属性 · `'tool'` 不在文档里留痕迹的工具 |
| `holds` | 怎么装里面的东西——`'blocks'` 或 `'inline'` |
| `singleParagraph` | 里面固定只能是**一个**段落（表格的格子） |
| `boolAttrs` | 值只有 `1` 的布尔属性名 |
| `allows` | 允许进到里面的翅膀名字。不写就是全部 |
| `requiresAnyOf` | 这里面至少要有一个一起注册 |
| `parts` | 一起带过来的没有按钮的结构——表格的行和格，折叠块的摘要行 |

### 值

| 字段 | 意思 |
|---|---|
| `attrKey` · `attrValues` | 段落属性写到哪个字段名，以及能接受的值清单 |
| `currentValue` | 现在是不是按下状态——工具栏、上下文工具栏靠这个答案给格子上色 |

### 进出的路

| 字段 | 意思 |
|---|---|
| `toHtml` · `partHtml` | 出去的画法 |
| `claim` | 判定进来的 HTML 里这个标签归谁 |
| `repair` · `partRepair` | 在 JSON 入口处收拾这个节点。答 `null` 就连壳一起被撤掉 |

### 手和键

| 字段 | 意思 |
|---|---|
| `commands` | 这只翅膀挂上的命令们 |
| `onKey` | 光标在这只翅膀的节点里面时优先拦截按键 |
| `escapeKeys` | 按下后下一个敲的字会离开这个标记的键 |
| `inputRules` | 单靠敲字就发生的自动转换 |
| `attach` | 需要碰画面的时候用——表格的格子拖拽、代码上色都是这个 |

### 长相

| 字段 | 意思 |
|---|---|
| `button` · `buttons` | 一个或多个工具栏按钮 |
| `context` | 上下文工具栏的声明 |
| `styles` | 这只翅膀带的 CSS |

---

## `w` ——取名字

`w` 是**存值里每个节点上都会重复出现的字符串**。越短越好——内置翅膀之所以短
到 `b`、`hl`、`tf` 这种程度就是这个原因。不过撞了别人的名字注册就会失败，所以
自己写的翅膀就算长一点，也要取一个不会撞名的名字。

不需要和 HTML 标签名一样——出去的标签由 `toHtml` 决定。

::: warning 之后再改名字
存值里的 `w` 就是那个名字，改名意味着**已经存下来的文档读不回来了。** 一定要
改的话，留一段过渡期，用 `claim` 把旧名字也一起接住。
:::

---

## 接下来的文档

- [行内标记](./custom/inline) —— `claim` · `toHtml` · `escapeKeys`
- [块与段落属性](./custom/block) —— `place` · `holds` · `allows` · `parts` · `attrKey`
- [键、自动转换、粘贴](./custom/input) —— `onKey` · `inputRules` · `attach`
- [UI 与行为](./custom/ui) —— `button` · `context` · `styles`，以及向人发问

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
