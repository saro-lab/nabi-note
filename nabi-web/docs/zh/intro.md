---
title: 介绍
description: NABI NOTE 是一款在浏览器里运行的开源 WYSIWYG 编辑器。
---

# 什么是 NABI NOTE？

NABI NOTE 是一款在浏览器里运行的**开源 WYSIWYG 编辑器**。


## nabi-tree

直接拿 HTML 处理的话，在没有 DOM 的服务器端会没法处理，所以改用一种叫
**nabi-tree** 的 JavaScript 对象来处理，双向序列化成 JSON、HTML。另外，
nabi-tree 和 HTML 互转的过程中会把 XSS 相关的东西滤掉。

> nabi-note 支持的所有翅膀都挡得住 XSS，但 `自定义翅膀（外部插件）` 挡不挡得住，
> 得去问写那只翅膀的开发者。

<FlowHub :sources="hubSources" :core="hubCore" :targets="hubTargets" caption="" />

## 不用 DOM 的 SSR（服务器端）支持

存好的 nabi-tree 可以**在服务器（Node.js）上原样读出来**，拼出要送出去的 HTML。
需要 DOM 的只有**输入**（`setHtml()`）和贴到画面上的那些 `mount*`。

只展示的地方，连编辑器都不用搭，一道门就够。接收的是存好的值和 `registry`
（注册过的翅膀清单）两样东西，答案是一段 HTML 字符串。

**服务器上接的是 `nabi-note/ssr`**——只装了画图所需东西的入口，编辑表面和界面
工具完全不会带进去。

```ts
import { makeRegistry, defaultWings, renderStoredHtml } from 'nabi-note/ssr'

// 翅膀清单只在服务器起来时搭一次——不管存了多少份，都分着用这一份
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['一条评论'] }]   // 从数据库读出来的 nabi-tree
renderStoredHtml(saved, registry)
// '<p>一条评论</p>'
```

**不是 nabi-tree 就答 `null`**——拒绝的规矩和 `setJson()` 一样。过关的值和编辑器
给出的 `getHtml()` **一字不差**。因为走的是同一趟步骤（规范化 → 组装），所以
过滤 XSS 的地方也一样。

要在服务器上预先把编辑器画好，用配套的那道门——多贴的只有 `data-key`。

```ts
import { renderStoredEditorHtml } from 'nabi-note/ssr'

renderStoredEditorHtml(saved, registry)
// '<p data-key="n0">一条评论</p>'
```

同一份存好的值永远拿到同一个 `data-key`，所以把这段 HTML 原样送下去，浏览器
再用 `mountSurface({ nabi, registry, root, hydrate: true })` 接手的话，画面不会
被重画。**这个站点自己的首页演示实际上就是这么跑的**——第一眼看到的文档是服务器
画好送来的，编辑器就在这份画面上醒过来。

### 三个入口

| 接的是 | 装的是什么 | 什么时候用 |
|---|---|---|
| `nabi-note` | 编辑器全套——组装、编辑表面、界面工具 | **写**东西的地方 |
| `nabi-note/ssr` | 只有把存好的值画成 HTML 这一件事 | 服务器，或者只给看的页面 |
| `nabi-note/viewer` | 阅读侧的行为（表格排序、代码上色） | **展示**发布出去的 HTML 的地方 |

`nabi-note/ssr` **一个文件都不占**编辑表面（`surface`）和界面工具（`ui`）——有网
扫过源码来守住这条规矩。所以服务器打的包里不会混进 DOM 代码。

## 格式全是翅膀

别的编辑器里叫"插件"的那个单位，这里叫**翅膀（wing）**。内核直接认得的只有段落
（`p`）、换行（`br`）和纯文本，标题、列表、表格、加粗全都是翅膀。

```ts
import { createNabiWith, parseNodes, boldWing } from 'nabi-note'

const bare = createNabiWith([], { parseHtml: parseNodes }).nabi
bare.setHtml('<p><b>加粗</b> <i>斜体</i></p>')
bare.getHtml()
// '<p>加粗 斜体</p>'                    —— 没有声明翅膀，落成了纯文本。

const bold = createNabiWith([boldWing], { parseHtml: parseNodes }).nabi
bold.setHtml('<p><b>加粗</b> <i>斜体</i></p>')
bold.getHtml()
// '<p><b>加粗</b> 斜体</p>'              —— 只声明了 boldWing，所以只有它活了下来，其余落成纯文本。
```

没有注册成翅膀的标记会**转换成纯文本。** 所以没声明的 html 会被排除掉，nabi
官方支持的所有翅膀都会滤掉恶意脚本。


## 接口

文档只能通过 `applyCommand()` 来改动。

```ts
nabi.applyCommand('toggleMark', { w: 'b' })     // 加粗
nabi.applyCommand('setHeading', { value: 2 })   // 二级标题
nabi.undo()
nabi.redo()
```
命令**用 `boolean` 来回答成不成功。** 什么都没改变的话就答 `false`，不留撤销点也不做修改。


## 代码的分层

**不是说值按这个顺序流动。** 这是从下往上垒起来的**依赖方向**，规矩只有一条
——**下层不认识上层。** 所以下面的几层（`schema`·`doc`·`html`）不碰 DOM，这也是
它们能在服务器上原样跑起来的原因。值进出的路径是上面那张 nabi-tree 图。

<LayerStack
  :layers="layers"
  caption=""
/>

这个方向不是写在文档里的约定，而是**有网用机器守着**——只要出现一处逆着层走的
import，检查当场就不通过。


## 术语

| 词 | 意思 |
|---|-------------------------------------------------|
| **标记（mark）** | 文字格式，例如 `<b>`·`<i>`·`<a>` |
| **块（block）** | 例如段落、标题、列表、表格、图片 |
| **段落属性（paragraph attribute）** | 段落的属性，例如对齐、首字下沉 |
| **包装段落** | 把表格、列表、图片这类单一段落对象包起来的段落 |
| **归属（claim）** | 判定一段标记归哪只翅膀所有的裁决 |
| **部件（parts）** | 翅膀内部的功能，例如表格的行和格、折叠块的摘要行 |

### 编辑画面

| 词 | 意思 |
|---|---|
| **光标（caret）** | 编辑器里的选择光标 |
| **上下文工具栏（context row）** | 按光标当前选中的状态来控制的工具栏，例如表格的行列命令、代码的语言框、链接的地址和名字框、标题的 H1~H6 |

### 内核

| 词 | 意思 |
|---|---|
| **cocoon** | nabi-tree 的规范化步骤。**每条命令跑完之后都会执行一遍**，没有哪条命令能留下破坏规则的文档 |
| **附着（attach）** | 翅膀需要碰画面时声明的钩子。例如表格的拖拽调格、代码上色、勾选切换都是这个。`mountSurface` 会把注册过的翅膀的这部分一并挂上 |
| **自动转换（input rule）** | 单靠敲字就会发生的转换。例如连字符加空格变成列表，`#` 加空格变成标题 |


## 接下来的文档

- [{{ t('menu_intro_usage') }}](./intro/usage) —— 组装、输入、输出的全部
- [{{ t('menu_intro_cdn') }}](./intro/cdn) —— 不用构建工具，一个 `<script>` 就够
- [{{ t('menu_wing_custom') }}](./wing/custom) —— 亲手做出没有的格式

<script setup lang="ts">
import FlowHub from '../.vitepress/ui/FlowHub.vue'
import LayerStack from '../.vitepress/ui/LayerStack.vue'
import { useTranslate } from '../.vitepress/src/langs.ts'

const { t } = useTranslate()

const hubSources = [
  { label: 'HTML · JSON', note: '直接输入 · 粘贴 · 载入', kind: 'in' },
  { label: 'setHtml() · setJson()', note: '函数输入', kind: 'gate' },
];

const hubCore = { label: 'nabi-tree', note: 'Tree Object', kind: 'core' }

const hubTargets = [
  { label: 'getHtml()', note: 'Output HTML', kind: 'out' },
  { label: 'getJson()', note: 'Output JSON', kind: 'out' },
  { label: 'getEditorHtml()', note: '编辑器用的 HTML', kind: 'out' },
];

const layers = [
  { name: 'locale', what: '语言' },
  { name: 'code', what: '编辑画面和阅读侧共用的纯粹分词器' },
  { name: 'schema', what: 'nabi-tree 的形状与 Cocoon 定义' },
  { name: 'doc', what: '插入·删除·拆分·范围，Dom-less' },
  { name: 'caret', what: '光标的位置、选择、边界' },
  { name: 'html', what: 'nabi-tree ↔ HTML' },
  { name: 'editor', what: '带命令接口的实例' },
  { name: 'wing', what: '注册时刻的 Wings 检查' },
  { name: 'wings', what: '官方翅膀们（bold、italic……table、upload……）' },
  { name: 'surface', what: '把光标、输入法、输入对齐到树上' },
  { name: 'ui', what: 'UI 层' },
  { name: 'viewer', what: '只读' },
]
</script>
