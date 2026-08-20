---
title: 用 CDN 接入
description: CDN 示例
---

# 用 CDN 接入

<CdnDemo />

---

## 刚才做了什么

不看这一节，上面那个文件也照样能跑。只有想改的时候才需要看。

### 两个标签就是安装

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">
<script src="https://cdn.jsdelivr.net/npm/nabi-note@latest"></script>
```

这个包导出的**所有东西**都挂在一个全局的 `NabiNote` 上。**样式表要手动挂上**——
mount 不会注入 CSS，漏掉 `<link>` 编辑器就是光秃秃的样子。

### 骨架

```html
<div id="app" class="nabi">                    <!-- 颜色、圆角、字体都住在这个根上 -->
  <div id="chrome" class="nabi-toolbar">        <!-- 工具栏和上下文工具栏粘成一块 -->
    <div class="nabi-toolbar-row">
      <span id="tools"></span>                 <!-- 预览、全屏（最右边） -->
      <div id="toolbar"></div>
    </div>
    <div id="context"></div>                   <!-- 跟着光标碰到的东西自己填 -->
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

`id` 随便取什么名字都行——递给 mount 的是**元素**，不是名字。四个类名
（`nabi`·`nabi-toolbar`·`nabi-toolbar-row`·`nabi-content`）是样式表抓手用的，
原样留着。不用预览、全屏的话，把 `<span id="tools">` 和 `mountViewTools` 那行
一起删掉就行。容器随便传哪个都行——`mountViewTools` 会自己立起浮在最右边的
那个盒子，所以就算把工具栏原样传给它，按钮行也不会被挤乱。

### 挑翅膀

挑翅膀是一行构建器。上面这份文件从内置的二十九只翅膀里去掉了上传，又把字体
收窄成两种。

```js
var wings = N.wings().all().drop('upload').use('tf', { values: ['sans', 'serif'] })
```

- `all()` 从全部官方翅膀起步。**不调用就是空手**——只有 `use()` 拿进来的才会
  装上。
- `use('名字', 选项?)` 是加一个。对已经在里面的翅膀调用，就只是加选项——上面
  的 `use('tf', { values: [...] })` 就是这样。要是需要依赖的翅膀（比如上传得
  靠图片或链接其中一个撑着才能活），会悄悄一并带上。
- `drop('名字')` 是从里面去掉一个。要去掉的翅膀被别的翅膀踩在脚下的话，会
  当场抛出来，并说清楚要一起去掉的是哪些。
- 名字是存进值里的那个短键——像 `b`（加粗）·`tf`（字体）·`upload` 这样。完整
  清单用 `console.log(N.wingNames())` 看。
- **叫错了就在那一行抛出来。** 名字打错、选项键不认识、值不在列表里，全都会
  抛，抛出来的话里带着改法——`use('bod')` 会答"是不是想说 'b'（加粗）？"。
  没有会被悄悄忽略的地方。

`createNabiWith` 直接收构建器，不用调 `build()`——只有需要数组的地方，
`build()` 才会给出数组。只挑几个的时候，数组仍然是答案。

```js
var wings = [N.boldWing, N.italicWing, N.headingWing, N.bulletListWing]
```

自己做的翅膀用对象放进去——像 `N.wings().all().use(customWing)` 这样。这只
翅膀的 `w` 要以 `ex` 开头（`exNote`）——以后官方名字要是和存好的值撞了，已经
存下的文档会被读成别的意思。做法在 [{{ t('menu_wing_custom') }}](../wing/custom)
里。

每只翅膀单独看，去 [{{ t('menu_wing') }}](../wing/inline/bold)。

### 发问和通知的路

上面这份文件用 `ask` 接上了浏览器的 `alert`·`confirm`——"还有没保存的内容，
真的要打开吗？"这类问题会走这个弹窗。不接的话问题的答案就是"不"；不需要回答
的一句话，内核自带的 toast 容器会显示在工具栏下方——上传出错这类提醒不用
另外接线。详情在 [{{ t('menu_intro_usage') }}](./usage) 里。

### 取值

| | |
|---|---|
| `nabi.getHtml()` | 拿去保存、发布的 HTML |
| `nabi.getJson()` | nabi-tree（JSON） |
| `nabi.setHtml(html)` · `nabi.setJson(json)` | 再放回去 |
| `nabi.onChange(fn)` | 每次值变化时 |
| `N.renderStoredHtml(json, registry)` | 不搭编辑器，把存好的值直接画成 HTML（见下 [只给看的一侧](#只给看的一侧)） |

---

## 地址

要锁定版本就在地址里写上版本号。unpkg 给的是同一份文件。

**不要用没写版本号的地址（`/npm/nabi-note`）**——jsDelivr 会把那个位置缓存很久，
可能让打包文件和样式表混进不同版本。

| | 地址 |
|---|---|
| **打包文件（最新）** | `https://cdn.jsdelivr.net/npm/nabi-note@latest` |
| **打包文件（锁定版本）** | <code>{{ CDN_BUNDLE }}</code> |
| **样式表（最新）** | `https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css` |
| **样式表（锁定版本）** | <code>{{ CDN_SHEET }}</code> |
| **打包文件**（unpkg） | `https://unpkg.com/nabi-note` |

打包文件是跟着 npm 发布物一起带出去的，**CDN 并不是单独发布的。**

---

## 只给看的一侧

只**展示**保存下来的 HTML 的页面，不需要立起编辑器。挂上同一份样式表，把值放进
`.nabi-content` 里面，看到的就和编辑器里一模一样。

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">

<div class="nabi-content">
  <!-- 用 getHtml() 存下来的值 -->
</div>
```

要是存的不是 HTML，而是 **nabi-tree（JSON）**，不用立起编辑器，当场就能画
出来。要的是存好的值和注册过的翅膀清单两样东西。

```html
<script>
  var registry = N.makeRegistry(N.wings().all().build())

  var saved = [{ w: 'p', ch: ['一条评论'] }]   // 从服务器拿到的 nabi-tree
  document.querySelector('.nabi-content').innerHTML = N.renderStoredHtml(saved, registry)
</script>
```

不是 nabi-tree 就答 `null`，过关的值和编辑器给出的 `getHtml()` 一字不差——
过滤 XSS 的地方也一样。这道门不用 DOM，所以在服务器（Node.js）上也能原样跑，
**在服务器上预先做好 HTML 再送下去**这条路走的是同一道门（参见
[{{ t('menu_intro_ssr') }}](./ssr#只画存好的值)）。

用 npm 装进服务器的话，不用全局打包文件，而是用 **`nabi-note/ssr`**——只装了
画图所需东西的入口，不会带上编辑表面和界面工具。

一份样式表文件里**装着所有翅膀的 CSS**——文件没法知道你注册了哪些翅膀，所以
全都装进去了。

看到的样子全靠样式表撑起来，但**表格排序和代码上色是阅读侧要靠 JavaScript
才能做的事**——点表头重排行、把代码拆开上色，CSS 做不到。想要的话，用一道门
把阅读侧运行时接上。

```html
<script type="module">
  import { attachViewer } from 'https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/viewer/index.js'

  attachViewer(document.querySelector('.nabi-content'), { locale: 'zh' })
</script>
```

- 不接这道门文档也照样看得清楚——只是开了排序的表格转不动、代码只有一种
  颜色。
- 表格排序只对编辑器里打开过排序的表格起作用（留有 `data-nabi-sortable`
  标记）。
- 代码上色默认由内置分词器来答，不需要依赖。要用 Shiki 这类高亮器，就用
  `{ locale: 'zh', highlight }` 这样的钩子接进来——这份重量算在接它的那个
  页面头上。
- 全局的 `NabiNote` 打包文件里没有这道门——为了不让阅读页面背上整个编辑器，
  `nabi-note/viewer` 单独存在。用 npm 装进来的宿主，也像
  [{{ t('menu_intro_usage') }}](./usage#给预览接上阅读侧运行时) 那样给预览
  接上同一道门。

---

## 接下来的文档

- [{{ t('menu_intro_usage') }}](./usage) —— 用 npm 接入的路子，组装、输入、输出的全部
- [{{ t('menu_wing_custom') }}](../wing/custom) —— 亲手做出没有的格式

<script setup lang="ts">
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
import { useTranslate } from '../../.vitepress/src/langs.ts'
// 版本号不是手写的 —— 直接读 nabi-npm 的 package.json
import { CDN_BUNDLE, CDN_SHEET } from '../../.vitepress/src/version.ts'

const { t } = useTranslate()
</script>
