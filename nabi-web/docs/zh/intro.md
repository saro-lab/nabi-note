---
title: 介绍
description: NABI NOTE 是一款在浏览器里运行的开源 WYSIWYG 编辑器。
---

# 什么是 NABI NOTE？

NABI NOTE 是一款在浏览器里运行的**开源 WYSIWYG 编辑器**。


## nabi-tree

直接操作 HTML 的话，在没有 DOM 的服务器端（Node.js 等）会很难处理文档。因此 NABI NOTE
把文档当作一种叫**nabi-tree** 的纯 JavaScript 树对象来管理，支持和 JSON、HTML 之间的
双向序列化。另外，在 nabi-tree 和 HTML 互转的过程中，会自动去除可能引发 XSS 的恶意元素。

> nabi-note 官方支持的所有默认翅膀都支持防 XSS，但在编写或引入 `自定义翅膀（外部插件）`
> 时，需要向该翅膀的开发者确认是否也做了防 XSS 处理。

<FlowHub :sources="hubSources" :core="hubCore" :targets="hubTargets" caption="" />

## 不用 DOM 的 SSR（服务器端渲染）支持

存在数据库等处的 nabi-tree 可以**在服务器（Node.js 等）上原样读出来**，拼装出要发给
客户端的 HTML。需要 DOM API 的操作只有从外部 HTML 字符串**输入**（`setHtml()`）和把
编辑器渲染到画面上的 `mount*` 函数。

只需只读展示文档的画面，连编辑器都不用搭建，调用单一渲染函数（`renderStoredHtml`）就
够了。它接收保存好的 nabi-tree 数据和 `registry`（已注册的翅膀清单）作为参数，返回
一段安全的 HTML 字符串。

**在服务器环境中，使用 `nabi-note/ssr` 入口**——这是只包含渲染所需核心逻辑的轻量入口，
所以编辑区域（`surface`）和界面工具（`ui`）的代码完全不会打进服务器包里。

```ts
import { makeRegistry, defaultWings, renderStoredHtml } from 'nabi-note/ssr'

// 翅膀清单只在服务器启动时创建一次，之后所有请求复用这一份。
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['一条评论'] }]   // 从数据库读出来的 nabi-tree
renderStoredHtml(saved, registry)
// '<p>一条评论</p>'
```

**只要不是合法的 nabi-tree 格式，就会返回 `null`**——验证规则与 `setJson()` 相同。
通过验证后返回的值，与在编辑器实例上调用 `getHtml()` 得到的结果**完全一致**，因为它们
走的是同一套规范化再组装的流程，所以 XSS 过滤发生的位置也完全相同。

要在服务器上预先渲染（SSR）编辑器自身的编辑画面，使用 `renderStoredEditorHtml` 函数。
它会生成给每个节点都加上 `data-key` 属性的 HTML。

```ts
import { renderStoredEditorHtml } from 'nabi-note/ssr'

renderStoredEditorHtml(saved, registry)
// '<p data-key="n0">一条评论</p>'
```

同一份保存数据总是会得到同一个 `data-key`。因此可以把服务器渲染好的 HTML 原样发下去，
浏览器再用 `mountSurface({ nabi, registry, root, hydrate: true })` 接手（Hydrate），
就不会重新绘制画面。**这个站点自己的首页演示实际上正是这样运作的**——第一屏的文档是
由服务器预先渲染好的，编辑器就在那份 DOM 上直接激活。

### 三个入口包

| 入口 | 包含内容 | 使用场合 |
|---|---|---|
| `nabi-note` | 编辑器全部功能（文档模型、编辑区域、工具栏及界面工具） | **编写/编辑**文档的画面 |
| `nabi-note/ssr` | 仅用于把 nabi-tree 渲染成 HTML 的轻量 SSR 专用模块 | 服务器环境，或只读页面 |
| `nabi-note/viewer` | 只读侧行为（表格列排序、代码高亮等） | **查看**已发布 HTML 的画面 |

`nabi-note/ssr` **完全不引用**编辑区域（`surface`）或界面工具（`ui`）——通过架构级
单元测试严格验证这一点，所以服务器打包结果不会混入依赖 DOM 的代码。

## 所有格式都是翅膀

其他编辑器里称为"插件"的单位，在 NABI NOTE 里叫做**翅膀（wing）**。编辑器内核直接
处理的只有基础段落（`p`）、换行（`br`）和纯文本，标题、列表、表格、加粗等所有格式和
扩展功能，全都以独立翅膀的形式提供。

```ts
import { createNabiWith, parseNodes, boldWing } from 'nabi-note'

const bare = createNabiWith([], { parseHtml: parseNodes }).nabi
bare.setHtml('<p><b>加粗</b> <i>斜体</i></p>')
bare.getHtml()
// '<p>加粗 斜体</p>'                    —— 没有注册任何翅膀，标签被去除并转换为纯文本。

const bold = createNabiWith([boldWing], { parseHtml: parseNodes }).nabi
bold.setHtml('<p><b>加粗</b> <i>斜体</i></p>')
bold.getHtml()
// '<p><b>加粗</b> 斜体</p>'              —— 只注册了 boldWing，所以只保留加粗，其余转换为纯文本。
```

没有注册为翅膀的标记会**自动转换为纯文本。** 因此任何未声明的 HTML 元素都会被安全排除，
nabi-note 官方支持的所有翅膀都会彻底过滤掉恶意脚本。


## 接口

文档只能通过 `applyCommand()` 安全地改动。

```ts
nabi.applyCommand('toggleMark', { w: 'b' })     // 切换加粗
nabi.applyCommand('setHeading', { value: 2 })   // 设置二级标题
nabi.undo()
nabi.redo()
```
命令**以 `boolean` 返回是否成功。** 如果没有任何改动，就返回 `false`，既不留下历史
记录，也不做任何多余的操作。


## 代码的分层

下面这套结构不是数据执行的顺序，而是 `src/` 目录下组织的**十四个层（Layer）**。核心
原则是**下层永远不引用上层**。因此下层（`schema`、`doc`、`html` 等）完全不依赖 DOM，
在服务器环境（Node.js）中也能原样运行。

```
src/
├── style/     核心样式表——编辑画面和查看器共用的 CSS
├── locale/    多语言词典
├── code/      编辑画面和查看器共用的纯粹分词器
├── schema/    nabi-tree 的结构以及 cocoon（规范化）定义
├── doc/       节点插入·删除·拆分·范围运算——不涉及 DOM
├── caret/     光标位置·选区·边界处理
├── html/      nabi-tree ↔ HTML 双向序列化
├── io/        输入输出处理——粘贴候选·保存·打开·markdown
├── editor/    命令接口与编辑器实例
├── wing/      翅膀有效性检查与注册管理
├── wings/     官方翅膀合集（bold · italic … table · upload）
├── surface/   把光标·输入法·输入事件同步到树上
├── ui/        UI 层——工具栏·上下文栏·弹窗
├── viewer/    只读查看器行为
├── index.ts   核心入口——`nabi-note`
└── ssr.ts     SSR 专用入口——`nabi-note/ssr`（不引用 surface·ui）
```

**行的顺序就是层的顺序**——不是按字母排序，而是**按下层到上层**排列的。`style` 是
最底层，`viewer` 是最顶层。

这条层依赖规则不只是一项建议，而是**通过单元测试机械式验证的。** 一旦出现违反层级
规则的 `import`，就会在构建和测试阶段立即失败。


## 术语

| 词语 | 说明 |
|---|---|
| **标记（mark）** | 行内文字格式，例如 `<b>`、`<i>`、`<a>` |
| **块（block）** | 块级元素，例如段落、标题、列表、表格、图片 |
| **段落属性（paragraph attribute）** | 应用于整个段落的属性，例如文字对齐、首字下沉 |
| **包装段落** | 包裹表格、图片等单独块对象的容器段落 |
| **归属（claim）** | 判定一段输入的 HTML 标记归属于哪个翅膀的规则 |
| **部件（parts）** | 构成翅膀内部的子元素，例如表格的行/列、折叠块的摘要行 |
| **IO 过滤器（io filter）** | 处理剪贴板粘贴（输入）以及保存/打开（输出）的扩展点。它运行在翅膀契约之外，因此不会在 nabi-tree 中生成属于自己的节点 |

### 编辑画面相关术语

| 词语 | 说明 |
|---|---|
| **光标（caret）** | 编辑器内部的文字光标及选区 |
| **上下文工具栏（context row）** | 根据当前光标所在的块/格式状态动态显示的辅助工具栏，例如表格的行/列操作、代码语言选择、链接地址输入、标题级别选择 |

### 内核相关术语

| 词语 | 说明 |
|---|---|
| **cocoon** | nabi-tree 的规范化步骤。**在每条命令执行完毕后立即运行**，确保不会生成违反 schema 规则的异常树 |
| **附着（attach）** | 翅膀需要直接控制 DOM 时声明的钩子，例如表格单元格拖拽选择、代码语法高亮、复选框切换。`mountSurface` 执行时，会把已注册翅膀的钩子一并接上 |
| **输入规则（input rule）** | 输入文字时自动转换格式的快捷规则，例如输入 `- ` 会转换为列表，输入 `# ` 会转换为标题 |


## 接下来的文档

- [{{ t('menu_intro_usage') }}](./intro/usage) —— 编辑器组装、输入、输出的完整指南
- [{{ t('menu_intro_cdn') }}](./intro/cdn) —— 不用构建工具，仅用一个 `<script>` 标签使用
- [{{ t('menu_wing_custom') }}](./wing/custom) —— 亲手打造全新的自定义格式翅膀

<script setup lang="ts">
import FlowHub from '../.vitepress/ui/FlowHub.vue'
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

</script>
