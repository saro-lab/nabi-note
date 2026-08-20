---
title: 制作块与段落属性
description: void·container·attr —— 做出占段落位置的东西。块状物件永远住在包装段落里面。
---

# 制作块与段落属性

占段落位置的东西分三种。

| `place` | 是什么 | 例子 |
|---|---|---|
| `'void'` | **没有内容的块状物件**。光标进不去里面 | 分割线·图片·YouTube |
| `'container'` | **里面有文字的块状物件** | 引用·折叠块·表格·列表·代码 |
| `'attr'` | 挂在段落本身上的值。不立节点 | 标题·对齐·首字下沉 |

---

## 块状物件住在包装段落里面

文档是**块的数组**，能站在最上层的只有段落（`p`）。块状物件不会直接站在最上层，
而是穿着**只装着它自己的一个段落**站着。

```json
[{ "w": "p", "ch": [{ "w": "hr", "ch": [] }] }]
```

这层段落就是**包装段落**，画面上会画成 `<div data-nabi-p>`。

这么做有两个原因。块状物件前后总是有光标能站的位置（因为总有一个段落在那儿），
而且**对齐这类段落属性块状物件能原样接住**——"居中对齐的图片"其实就是"居中
对齐的段落里的图片"。

---

## 做一个没有内容的块状物件

```ts
import { boxObject, createNabiWith, insertLump, type Command, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const insertStar: Command = (doc, sel, _args, env) => {
  const r = insertLump(doc, sel.focus, { w: 'star', ch: [] }, env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

const starWing: Wing = {
  ...boxObject({
    w: 'star',
    toHtml: (_node, _children, ctx) => ctx.element('hr', '', { 'data-nabi-star': '' }),
  }),
  commands: { insertStar },
  button: {
    group: 'insert',
    label: { zh: '星标' },
    action: { kind: 'command', command: 'insertStar' },
  },
}
```

`insertLump` 会自动给它穿上包装段落。

```
<div data-nabi-p><hr data-nabi-star/></div>
```

在空段落上调用会**换掉那个段落**——不会每插入一次就多留一行空行。而且那个
段落原本带着的对齐会原样保留下来。

`boxObject` 帮你填好的是 `place: 'void'` 和**属性检查器**。

```ts
boxObject({
  w: 'stamp',
  attrs: { c: (v) => (v === 'red' || v === 'blue' ? v : null) },   // 清单外的值会被丢掉
  requires: ['c'],                                                 // 没有的话这个块状物件立不起来
  toHtml: /* … */,
})
```

`attrs` 里没写的属性**是不认识的字段，整个被丢掉。** 契约之外的值没有地方能
悄悄挤进存值里。

---

## 做一个有内容的块状物件

`place: 'container'` 一定要连着写 `holds`——不写注册就会失败。

```ts
import { createNabiWith, toggleWrap, type Command, type Wing } from 'nabi-note'

const toggleNote: Command = (doc, sel, _args, env) => {
  const r = toggleWrap(doc, sel, 'note', env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

const noteWing: Wing = {
  w: 'note',
  place: 'container',
  holds: 'blocks',                  // 里面住的是段落（'inline' 的话就只有文字）
  allows: ['p'],                    // 允许进到这里面的东西
  toHtml: (_node, children, ctx) => ctx.element('aside', children(), { 'data-nabi-note': '' }),
  claim: (el, inner) => (el.tag === 'aside' ? [{ w: 'note', ch: inner(true) }] : null),
  commands: { toggleNote },
  inputRules: [{ trigger: 'space', pattern: /^!$/, run: () => ({ name: 'toggleNote' }) }],
  button: {
    group: 'container',
    label: { zh: '便签' },
    action: { kind: 'command', command: 'toggleNote' },
  },
}
```

`toggleWrap` 是一个**切换开关**。把选区碰到的最上层块用这个容器包起来，如果
已经全部包好了，就把里面的内容原地展开。

```
包之前     [p"第一行", p"第二行"]
包之后     [p[ note[ p"第一行", p"第二行" ] ]]
再按一次   [p"第一行", p"第二行"]
```

### `holds`

| | 里面住的是 | 例子 |
|---|---|---|
| `'blocks'` | 段落和其他块状物件 | 引用·折叠块·表格的格子 |
| `'inline'` | 只有文字和标记 | 折叠块的摘要行·代码 |

### `allows`

写了的话**清单外的东西就进不来。** 核心会自动挂一个整理器，不管是粘贴还是
存值，清单之外的东西都会被剥掉外壳，只把里面的文字落成段落。

不写就是全部允许。`allows` 里写了不认识的名字，**会在注册的那一刻就失败。**

---

## `parts` ——没有按钮的内部结构

像表格的行、格，折叠块的摘要行这类**自己立不起来、也没有工具栏按钮**的结构，
用部件来声明。

```ts
const detailsWing: Wing = {
  w: 'details',
  place: 'container',
  holds: 'blocks',
  boolAttrs: ['o'],                                   // 值只有 1 的属性 —— 是否展开
  parts: { summary: { holds: 'inline' } },            // 摘要行
  toHtml: /* … */,
  partHtml: { summary: /* … */ },                     // 每个部件都要有自己的组装方法
  repair: repairDetails,
}
```

四条规则。

- 部件**只有容器才能有**。写在别的 `place` 上注册就会失败。
- 每个部件都要有 `partHtml`。没有的话注册会失败。
- 部件名字不能和翅膀名字、其他部件名字撞。
- 需要收拾部件时，用部件名字写进 `partRepair`。

`StructureDecl` 接受三个——`holds`·`singleParagraph`·`boolAttrs`。

### `singleParagraph`

里面**固定只能是一个段落**。表格的格子就是这样——在格子里按 <kbd>Enter</kbd>
段落不会一分为二，跨两个格子的选区删掉也不会把两格合并。守住格子结构的就是
这一个字段。

### `boolAttrs`

值只有 `1` 的属性——折叠块的 `o`（展开）、待办列表的 `ck`（勾选）、段落的 `dc`
（首字下沉）。关闭的状态不是 `0`，而是**这一格根本不存在**。

---

## `repair` ——存值入口的最后一道门

`repair` 会在 **JSON 变成文档之前**把这个节点收拾一遍。

```ts
repair: (node) => {
  if (!isValid(node)) return null    // null —— 这个节点连壳一起被撤掉
  return tidiedNode                   // 原样不动也行（答回同一个对象就是不改）
}
```

手改过的存值、别的版本传来的文档、别人做的 JSON 全都要经过这道门。只有通过
这里的才会成为文档，所以**这是翅膀唯一能自己保证自家节点形状的地方。**

`allows` 和 `repair` 一起写的话，`allows` 的整理会**先**跑，结果再交给
`repair`。

---

## `requiresAnyOf` ——要有搭档才能立起来的翅膀

```ts
requiresAnyOf: ['img', 'a']
```

这里面一个都没有一起注册的话，**会在注册的那一刻就失败。** 上传翅膀用的就是
这个——上传的东西得立成图片或链接，两个都没有的话上传上去也没法呈现。

---

## 段落属性（`place: 'attr'`）

段落属性不立节点。只是往段落的 `a` 上加一个值。

```json
{ "w": "p", "a": { "h": 2, "a": "c" }, "ch": ["居中对齐的标题 2"] }
```

::: warning 字段被钉死成三个
`attrKey` 必须是 **`h`（标题）·`a`（对齐）·`dc`（首字下沉）**三个里的一个，
写别的名字注册就会失败。现在这个版本**做不出新的段落属性**——段落的属性字段
被核心认识的这三个封死了。

出于同样的原因，这三个已经被 `headingWing`·`alignWing`·`dropCapWing` 占用了，
实际上已经没有位置留给新的 `place: 'attr'` 翅膀。想给每个段落挂值，现在只能
选用容器包起来的办法。
:::

处理值的字段有两个。

| | |
|---|---|
| `attrValues` | 能接受的值清单（标题就是 `[1,2,3,4,5,6]`） |
| `currentValue` | 这个段落现在带的值。工具栏、上下文工具栏靠这个答案给按下的格子上色 |

---

## 公开的文档辅助函数

这个版本对外提供的编辑辅助函数有四个。

| | 做什么 |
|---|---|
| `insertLump(doc, caret, lump, env, wrap?)` | 把一个块状物件连同包装段落一起立起来 |
| `removeLump(doc, topIndex, env)` | 整个撤掉一个最上层的包装段落 |
| `toggleWrap(doc, sel, containerW, env)` | 把碰到的块用容器包起来或展开 |
| `topNodeAt(doc, path)` | 这条路径所属的最上层节点 |

四个都答 `{ doc, caret }`，所以要转成命令该答的形状一次。

```ts
return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
```

::: tip 需要比这更细的编辑
按字符切开、拼接的内部辅助函数（挂标记、写段落属性这类）现在还不是公开 API。
在那之前，也可以直接自己拼出新的 `doc` 数组来回答——答出来的文档还会被
`cocoon` 再收拾一遍，破坏规则的文档不会就这么留下来。
:::

---

## 接下来的文档

- [键、自动转换、粘贴](../custom/input) —— `onKey` · `inputRules` · `attach`
- [UI 与行为](../custom/ui) —— 工具栏按钮和上下文工具栏

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
