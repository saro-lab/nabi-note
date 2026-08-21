---
title: 基本用法
description: 用 npm 装进来，搭起一个 nabi 对象，用四种输入、三种输出来传递文档。
---

# 基本用法

这是用 npm 装进来的路子。一行 `<script>` 就够的路子在
[{{ t('menu_intro_cdn') }}](./cdn) 里。

```sh
npm i nabi-note
```

---

## 把零件接起来

宿主搭好位置，把 mount 一个个接上去。下面是最小配置，每篇翅膀文档里出现的例子，
都是在这副骨架上多插一两只翅膀。

```html
<div id="app" class="nabi">
  <div id="chrome" class="nabi-toolbar">
    <div id="toolbar"></div>
    <div id="context"></div>
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

```ts
import {
  createNabiWith,
  mountSurface,
  mountToolbar,
  mountContextToolbar,
  mountHints,
  mountViewTools,
  mountSticky,
  watchSettle,
  parseNodes,
  boldWing,
  italicWing,
} from 'nabi-note'
import 'nabi-note/nabi.css'

const app = document.querySelector<HTMLElement>('#app')!
const surface = document.querySelector<HTMLElement>('#editor')!

// 翅膀清单把种类知识、命令、装配器一起搭起来 —— 这就是 `registry`
const { nabi, registry } = createNabiWith([boldWing, italicWing], {
  parseHtml: parseNodes,
})

mountSurface({ nabi, registry, root: surface })

const settle = watchSettle(document, { surface })
const shared = { nabi, registry, surface, settle, locale: 'zh' }

const toolbar = mountToolbar({ ...shared, root: document.querySelector<HTMLElement>('#toolbar')! })
const context = mountContextToolbar({ ...shared, root: document.querySelector<HTMLElement>('#context')! })

mountHints({ toolbar, context, root: document.querySelector<HTMLElement>('#chrome')!, surface })
mountViewTools({ nabi, surface, root: app, container: document.querySelector<HTMLElement>('#toolbar')!, locale: 'zh' })
mountSticky({ root: app, surface })

// 每次值变化时 —— 把你的代码挂在这里
// nabi.onChange(() => user_callback(nabi.getHtml()))
```

位置由宿主搭起来，**这个位置长什么样内核是知道的**——mount 自己会把
`.nabi-toolbar-row`·`.nabi-context`·`.nabi-editing` 挂到自己的容器上，工具箱也
是自己立起来的。也就是说宿主不用操心布局，所以上面的标记里只有三个类名。

- **`class="nabi"`**——颜色标记和样式表只在这里面起作用。它也是全屏时整个固定
  住的容器，所以工具栏和编辑区域**必须**在同一个里面。
- **`class="nabi-toolbar"`**——把工具栏行和上下文工具栏行捆成一块，让它们
  **一起贴住（sticky）**。要是两个分开贴，上下文工具栏一冒出来文字就会被顶
  得画面晃一下。
- **`class="nabi-content" contenteditable`**——编辑区域本身。

站点上有固定的头部的话，用 `--nabi-sticky-top` 把这段距离让出来；挂上
`mountSticky()` 的话，手机键盘顶起画面的那段距离，内核会量出来再退回去。

**样式表由宿主来挂。** 用打包工具的话一句 `import 'nabi-note/nabi.css'` 就够；
只想装已注册翅膀的那部分，就调用 `injectSheets(document, collectSheets(registry))`。
**在服务器上预先画好文档送下去的页面，要走文件这条路**——注入是等编辑器的
JavaScript 到达之后才会挂上，那段时间里文档会先光秃秃地画一遍。

**这个说法（locale）也决定了文字的方向。** 给 `ar`（阿拉伯语）·`ur`（乌尔都语）的话，
这个 mount 的根上会挂上 `dir="rtl"`，从右往左排——就算页面自己的 `<html dir>`
什么都没说也一样。**不给 `locale` 就完全不碰**：不会盖掉宿主自己攥着的方向。
哪种语言对应哪种方向，`localeDirection(code)` 会给出答案。

```ts
mountSurface({ nabi, registry, root: surface, locale: 'ar' })   // 编辑区域变成 RTL
mountToolbar({ nabi, registry, surface, root: toolbar, locale: 'ar' })   // 工具栏也跟着镜像
```

显示用的语言由每个 mount 各自的 `locale` 决定——文档的正文不变，只有工具栏、
上下文工具栏的名字会变。**宿主只需要声明一次语言**——像上面例子那样把它放进
一份共用配置（shared）里传给各个 mount，工具栏立起来的时候会把自己的 `locale`
也挂到内核上（`nabi.$bindLocale`），这样内核说的话（toast 等）也会用同一种
语言。不用工具栏的地方，用 `createNabiWith` 选项里的 `locale` 来给。要画一个
语言选择器，用包导出的 `LOCALES`（代码清单）。

### 空编辑器里的占位提示

什么都没有的编辑器会在第一行浅浅地立起一句占位提示。一个字打进来的瞬间它就消失，
删空了又会重新出现。**什么都不用做它就会自己出现**——这句话来自内核自带的词典，
跟着那个 mount 的语言走。位置由**文字的方向**决定（LTR 靠左，RTL 靠右）——就算这一
行本身是居中或靠右对齐，占位提示也不会跟着挪。

```ts
mountSurface({ nabi, registry, root: surface, placeholder: '在这里记点什么' })
mountSurface({ nabi, registry, root: surface, placeholder: '第一行\n第二行' })   // 多行
mountSurface({ nabi, registry, root: surface, placeholder: '' })   // 不要占位提示
```

换行（`\n`）会照样变成一行。不过占位提示立在**排版流之外**（为了不推动光标），所以
编辑区域只有一行高的话，多行的占位提示会往下溢出——要用多行就给编辑区域留够那么多
的最小高度。

这句话进的是编辑区域根节点上的 `--nabi-placeholder`，画出来的是样式表。要换颜色或
质感，改这条规则就行。

```css
.nabi-content.nabi-editing > :is(p, h1, h2, h3, h4, h5, h6):only-child:has(> br:only-child)::before {
  color: #999;
}
```

| 装配件 | 是否必须 | 做什么 |
|---|---|---|
| `createNabiWith(wings, options?)` | 是 | 返回 `{ nabi, registry }`。不需要 DOM。翅膀数组、挑选构建器（`wings()`，参见 [{{ t('menu_intro_cdn') }}](./cdn#挑翅膀)）都照单全收 |
| `mountSurface({ nabi, registry, root })` | 是 | 把光标、输入法、输入重新对齐到 nabi-tree 上。也一并挂上已注册翅膀的 `attach` |
| `mountToolbar({ nabi, registry, root, surface?, locale? })` | 否 | 主工具栏。没有它也能用 `applyCommand()` 直接编辑 |
| `mountContextToolbar({ nabi, registry, root, surface? })` | 否 | 按光标位置显示的上下文工具栏（表格行列、代码语言、链接地址和名字等） |
| `mountHints({ toolbar, context?, root, surface? })` | 否 | 连按两下 Shift 弹出的快捷键提示 |
| `mountViewTools({ nabi, surface, root, container, onBody? })` | 否 | 预览、全屏两个按钮。`root` 是全屏时要固定的那个 `.nabi` 容器，`onBody` 是给预览正文挂阅读侧运行时的钩子（见下）|
| `mountSticky({ root, surface })` | 否 | 把手机键盘顶起画面挤走的那段贴住的工具栏退回去 |
| `mountPickedMark({ nabi, surface })` | 否 | 选中图片、视频时的标记（浏览器不会自己画） |
| `mountFile({ nabi, store, name? })` | 用 save·open 时 | 存成、打开 `.nabi` 文件 |
| `mountLocalHistory({ nabi, storage })` | 用 localHistory 时 | 按固定间隔往浏览器里记录。就算 `storage` 是 `null`（像 `file://` 这种被挡住的地方）也照样搭起来——这样按钮才能用 toast 说清楚自己为什么不能用 |
| `mountUpload({ … })` + `mountUploadView({ … })` | 用 upload 时 | 拖放、粘贴、选文件的上传进度和它的显示 |

**图片、勾选框、表格拖拽调格、代码上色不需要单独 mount**——全都由翅膀自己拿着
`attach`，`mountSurface` 会一并挂上。只有代码上色需要接一个上色的人进来
（`makeCodeAttach`，参见 [{{ t('menu_wing_code') }}](../wing/block/code)）。

### 给预览接上阅读侧运行时

预览是把 `getHtml()` 直接插进去的静态 HTML，像表格排序、代码上色这类**只在
阅读侧靠 JavaScript 才能做的事**不会自动挂上去。`nabi-note/viewer` 的
`attachViewer` 把这些全部用一道门挂上，预览这边就挂在 `onBody` 钩子上——把
上面最小配置里的 `mountViewTools` 那行换成这样。

```ts
import { attachViewer } from 'nabi-note/viewer'

mountViewTools({
  nabi,
  surface,
  root: app,
  container: document.querySelector<HTMLElement>('#toolbar')!,
  locale: 'zh',
  onBody: (body) => attachViewer(body, { locale: 'zh' }),
})
```

`onBody` 在预览正文立起来时被调用，回答给的那个卸载函数会在遮罩收起时被调用。
发布出去的页面上也挂**同一行**（`attachViewer`）——预览要和发布出去的那份一样，
让两边挂同一道门正是这个钩子的意义。详情在
[{{ t('menu_intro_cdn') }} ▸ 只给看的一侧](./cdn#只给看的一侧) 里。

代码上色默认由内置的轻量分词器来答（零依赖）。要用 Shiki 这类高亮器的宿主，把
`attachViewer(body, { locale, highlight })` 传同一个钩子——和传给
`makeCodeAttach({ highlight })` 的是同一份，编辑画面和阅读画面的颜色就不会
岔开。

要换翅膀就把这整套都撤掉（`unmount()`）再重新搭——被拿掉的翅膀握着的标记会
在原地落成纯文本。这个站点的演示实际上就是这么做的——把翅膀开关关了又开，
整套装配会重新搭一遍。

颜色、外观这些 CSS 变量在 [{{ t('menu_style_custom') }}](../style/custom) 里。

---

## 拿文档出来的三种

```ts
nabi.getHtml()        // 拿去保存、发布的 HTML
nabi.getJson()        // nabi-tree（JSON）
nabi.getEditorHtml()  // 此刻编辑器画面的 HTML（挂着 data-key）
```

**要保存的值是前两个里的一个。** `getEditorHtml()` 挂着只给画面用的标记
（`data-key`），不是拿去导出的值——是给服务器渲染（SSR）预先画好编辑器时用的
位置。

导出的 JSON 长这样。**文档是块的数组**，没有包着它们的根节点。

```json
[
  {"w":"p","a":{"h":2},"ch":["标题"]},
  {"w":"p","ch":["文字 ",{"w":"b","ch":["加粗"]}," 和 ",
    {"w":"a","a":{"href":"https://nabi.saro.me/"},"ch":["链接"]}]},
  {"w":"p","a":{"a":"c"},"ch":["居中"]},
  {"w":"p","ch":[{"w":"ul","ch":[
    {"w":"li","ch":[{"w":"p","ch":["一"]}]},
    {"w":"li","ch":[{"w":"p","ch":["二"]}]}]}]}
]
```

读它的规则只有四条。

- **`w` 是画这个节点的翅膀的 id。** 保留字只有 `p`（段落）和 `br`（换行）两个，
  其余全是注册过的翅膀的 id——像 `b`·`ul`·`li` 这样。标题不是单独的翅膀，
  而是**段落的属性**（`{"w":"p","a":{"h":2}}`）。
- **是字符串就是文字，是对象就是翅膀。** 没有单独一格用来写种类。
- **`a` 是那只翅膀装的值**——链接地址、荧光笔颜色、标题级别这类东西。没有的话
  这一格也不会出现。对齐值也是 `a`，不过它在这一格**里面**，不会搞混
  （`{"w":"p","a":{"a":"c"}}`——居中对齐的段落）。
- **表格、列表、图片这类占段落位置的东西外面会包一层段落**（看上面的 `ul`）。
  对齐落在这层段落上，光标能立在这块东西前后的位置也是它给的。导出成 HTML
  时是 `<div data-nabi-p>`——因为语法上 `<p>` 装不下表格、列表。

内部跑着的树里，每个节点还多一个 `_id`——**光标指着某个节点用的内部地址**，
大多数编辑都会重新编号，导出时被剥掉（以上面的例子算，470 → 323 字节）。导出的
值可以原样再放进 `setJson()`。

---

## 把文档放进去的四种

```ts
createNabiWith(wings, { doc })   // 用已经做好的 nabi-tree 起步
nabi.setJson(json)               // 整个换成这棵 nabi-tree
nabi.setHtml(html)               // 整个换成这段 HTML 字符串
nabi.applyCommand('setHeading', { value: 2 })  // 编辑命令（翅膀走的就是这道门）
```

四个都**用 `boolean` 回答成败。** 不会抛出异常，失败时就不碰文档。

有点偏差的值不会被拒绝，而是**边读边纠正**——空的表格单元格、不是行的表格
子节点、超出范围的合并都是这样，危险的地址被过滤掉也是同一步做的。拒绝是
完全读不懂的形状才有的待遇。而且哪个值在读的过程中抛出异常，编辑器也不会
停下来——会变成拒绝（`false`），并用 `console.error` 说清楚被拒绝的是什么。

| 答 `false` 的情形 | |
|---|---|
| `setJson` | 不是 nabi-tree 的形状（不算空值——见下） |
| `setHtml` | 没插 `parseHtml` 适配器（见下）或编辑被锁着（不算空值） |
| `applyCommand` | 没有这个命令，或者**什么都没改变** |

**空文档只有一种形状——`[{"w":"p","ch":[]}]`。** 像全选后删除那样把文字整个
删掉的地方，不会留下第一个块的标题、对齐这些属性。只清空多行里的某一行则
不一样——因为是想接着在那一行写下去，那个段落的属性会照样留着。

**空值不算格式错误，是空文档。** 给 `null`·`undefined`·空字符串（只有空格
的也算）·空数组的话，不会被拒绝，而是**落成空画面并答 `true`**——`setJson`·
`setHtml` 都是这样，所以"清空"永远会成功。空值没有什么可读的，所以这时候
`setHtml` 也不需要适配器（见下）。形状错误的值照样会被拒绝——空的和错的是
两回事。

最后一行是一条规矩——**没有变化就保持安静。** 对已经是二级标题的段落再挂一次
`setHeading`，会答 `false`，既不留撤销点也不留信号。

`applyCommand` 的第三个参数是**下命令的那只手**——`applyCommand(name, args?, by?)`
的 `by` 是 `'keyboard' | 'pointer'`（类型 `CommandHand`），不说明的话就是键盘。
分岔的地方只有一处：光标折叠着的位置上的标记命令，键盘会挂个预约（从下一个字
开始生效），指针则不挂预约，直接答 `false` 并用 toast 说"没有可以应用的对象"。
要是自己搭 UI 来调命令，点击的把手要说明 `'pointer'`。

### `setHtml` 需要一个适配器

读 HTML 这件事是浏览器的 `DOMParser` 做的。内核不认识 DOM，所以要在声明的时候
把这个适配器插进去。

```ts
import { createNabiWith, parseNodes } from 'nabi-note'

const { nabi } = createNabiWith(wings, { parseHtml: parseNodes })
```

`setJson` 不需要适配器——存好的 JSON 可以**原样放进服务器（Node.js）**里用。
组装（`getHtml`）也不用 DOM，所以在服务器上读 JSON 拼出 HTML 再送出去的路
是通的。

---

## 提醒走 toast 这一条路

上传出错、本地记录的提示、"没有可以应用的对象"这类一句话，全都从 **toast 这
一条路**出来。默认的容器由内核自己拿着，什么都不用插——工具栏立起来之后，会
显示在工具栏下方一个固定的位置（上下文工具栏冒出来又消失，这个位置也不会跟着
动）。

- **等级只有三档**——`'info' | 'warn' | 'error'`。不是成功失败的结果，而是
  **读的人该有多紧张**这个刻度。
- 默认 1 秒后收起（剩 0.5 秒开始变淡），点一下也能关掉。同时最多站 3 条——
  超出的话，剩余时间最短的先收起。
- 消息可以带 `\n`，浅色、深色两边都画得出来。

`createNabiWith` 里有两个调节手感的选项，和一个把显示整个换掉的选项。

```ts
const { nabi } = createNabiWith(wings, {
  toastMs: 2000,   // 存活时间 —— 默认 1000ms。调用的一方也能按次追加
  toastMax: 5,     // 同时站着的上限 —— 默认 3
  // 有自己一套提示系统的页面只换显示 —— 内核自带的默认容器一次都不会画出来
  // toast: (level, message, ms) => user_callback(level, message),
})
```

翅膀说话走的也是这一道门——`nabi.$toast(level, message, ms?)`。时间跟着这句
话一起带过来，不用为了一次长提示把整体的默认值调大。

---

## 编辑器向人发问的路

打开文件的时候需要问一句"还有没保存的内容，真的要打开吗？"这样的话。这个弹窗
在**声明的时候插一次**。

```ts
const { nabi } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

| | 形状 |
|---|---|
| `message` | `(text: string) => void`——说一句话，不接收回答 |
| `confirm` | `(text: string) => boolean \| Promise<boolean>`——同步、异步都接受 |

**内核不会自动用浏览器自带的那套。** 有自己对话框的页面不该被弹出灰色系统框
打断，而且插件环境（IntelliJ、VS Code）里根本没有 `window.confirm`。上面这三行
由宿主自己搭。

**只插上的那一格才生效**——可以只插 `message`，也可以只插 `confirm`。没插的
`message` 会走上面说的内核 toast（info）；没插的 `confirm` 的答案是"不"。

::: warning 不给 confirm 的话答案就是"不"
没人回答的问题不算"是"——和取消、按 Escape、关掉窗口的意思一样。这个答案落在
"要不要丢掉正在写的内容打开新文件"这个地方，没人能回答不代表就该往丢弃那边走。
在服务器（Node）上也会用这个值悄悄跳过去。
:::

**这是每个编辑器实例自己的东西**——不是全局的，所以同一页面上的两个编辑器可以
问出不一样的话。翅膀拿到的是同一份（`nabi.$ask`）——
[{{ t('menu_wing_custom') }} ▸ UI 与行为](../wing/custom/ui) 里有这部分的说明。

---

## 这个编辑器的名字和"变了没有"

```ts
nabi.sessionId   // '1755245678901-1x9k3af' —— <unix 时间戳>-<随机数>，每个实例一个
nabi.isChanged() // 从上一个基准线之后文档有没有动过
```

`sessionId` 只在创建时生成一次，之后不变。时间戳说的是这个编辑器什么时候立起来
的，本身就能排序；随机数用来区分同一毫秒立起来的两个编辑器。是给草稿、日志、
自动保存的键用的名字标签。

`isChanged()` 的**基准线只有三处会重新画**——整个放入文档的动作
（`createNabiWith({ doc })`·`setJson()`·`setHtml()`），以及告诉它"已经保存了"
这件事。

```ts
nabi.$markSaved(savedDoc)   // 保存成功之后 —— 把当时保存的那棵树传进去
```

**要传的是保存那一刻的树**（不是现在的树）。因为保存花时间的这段里敲的字，
仍然要算作"变了"。保存翅膀（`save`）是在文件真正写完之后才调用这个的，所以存成
`.nabi` 之后 `isChanged()` 就会变成 `false`。

**撤销回到最初的位置就又是 `false`**——因为 nabi-tree 是不可变的，每次编辑都是
整个换掉，判断是不是同一份文档不用扫描或者哈希，当场就知道。

```ts
window.addEventListener('beforeunload', (e) => {
  if (nabi.isChanged()) e.preventDefault()
})
```

---

## 接下来的文档

- [{{ t('menu_intro_ssr') }}](./ssr) —— 在服务器上预先画好存好的值，再用 `hydrate` 接手
- [{{ t('menu_intro_cdn') }}](./cdn) —— 不用构建工具，一个 `<script>` 就够
- [{{ t('menu_wing_custom') }}](../wing/custom) —— 亲手做出没有的格式

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
