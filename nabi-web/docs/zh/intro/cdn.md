---
title: 通过 CDN 使用
description: 介绍如何不使用任何构建工具、仅通过 HTML 标签使用 NABI NOTE。
---

# 通过 CDN 使用

<CdnDemo />

---

## 基本结构与运行原理

上面的演示示例无需任何打包器或构建工具，仅用一个 HTML 文件即可运行。

### 两行 HTML 标签完成接入

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">
<script src="https://cdn.jsdelivr.net/npm/nabi-note@latest"></script>
```

这个包导出的所有模块都挂在全局对象 `NabiNote`（简写 `N`）上。**样式表必须自己手动引入。** mount 函数不会自动注入 CSS，如果漏掉 `<link>` 标签，页面就会显示成没有样式的原始效果。

### HTML 结构

```html
<div id="app" class="nabi">                    <!-- 颜色主题、圆角、字体的根节点 -->
  <div id="chrome" class="nabi-toolbar">        <!-- 包裹工具栏和上下文栏的固定头部 -->
    <div class="nabi-toolbar-row">
      <span id="tools"></span>                 <!-- 预览、全屏按钮（右对齐） -->
      <div id="toolbar"></div>
    </div>
    <div id="context"></div>                   <!-- 根据光标位置动态出现的上下文栏 -->
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

每个元素的 `id` 可以自由指定。传给 mount 函数的是实际的 DOM 元素对象，而不是 id 字符串。四个类名（`nabi`、`nabi-toolbar`、`nabi-toolbar-row`、`nabi-content`）是样式表依赖的必要类，请保持不变。如果不需要预览和全屏功能，可以把 `<span id="tools">` 元素和 `mountViewTools` 调用一起省略。`mountViewTools` 会在传入的容器内部自动构建专属的按钮区域。

### 挑选翅膀（Wing）

翅膀的组合可以用构建器链式调用轻松完成。上面的示例从无需宿主集成即可运行的 26 个基础翅膀开始，添加了保存、打开功能，并将字体选项设置为 2 种。

```js
var wings = N.wings().allBasic().use('save').use('open').use('tf', { values: ['sans', 'serif'] })
```

- `all()` 会启用全部官方翅膀。不调用的话默认翅膀不会被包含，只会注册通过 `use()` 明确声明的翅膀。
- `allBasic()` 会从官方翅膀中选出**无需宿主应用额外集成即可运行的 26 个翅膀**。上传、保存、打开这三个因为需要宿主提供服务器接口或文件存储之类的配置，所以被排除在基础集合之外——这也是上面示例中要用 `use()` 额外声明保存、打开的原因。
- `use('名称', 选项?)` 用来添加某个翅膀。如果对已注册的翅膀调用，则只会更新选项（例如 `use('tf', { values: [...] })`）。如果某个翅膀依赖其他翅膀（例如上传翅膀需要图片或链接翅膀），会自动一并注册。
- `drop('名称')` 用来从已注册列表中移除某个翅膀。如果尝试移除的翅膀被其他翅膀依赖，会抛出异常并提示需要一起移除的相关翅膀。
- 翅膀名称是保存在 nabi-tree 中的简短唯一键（`w`）（例如 `b`（加粗）、`tf`（字体）、`upload` 等）。完整列表可以通过 `console.log(N.wingNames())` 查看。
- **传入错误的名称或选项会立即报错。** 如果传入拼写错误、不支持的选项键、超出有效范围的值等，错误信息会指出正确的修正方式。

`createNabiWith` 可以直接接收构建器实例作为参数，因此不需要另外调用 `build()`。也可以直接以数组形式传入翅膀。

```js
var wings = [N.boldWing, N.italicWing, N.headingWing, N.bulletListWing]
```

自己开发的自定义翅膀以对象形式传入（`N.wings().all().use(customWing)`）。为避免与官方翅膀标识符冲突，建议自定义翅膀的 `w` 标识符以 `ex` 前缀开头（如 `exNote`）。详细编写方法请参考 [{{ t('menu_wing_custom') }}](../wing/custom) 文档。

每个翅膀的详细规格可以在 [{{ t('menu_wing') }}](../wing/inline/bold) 菜单中查看。

### 对话框与通知集成

上面的示例通过 `ask` 选项接入了浏览器自带的 `alert` 和 `confirm`。例如可以用浏览器弹窗显示"有正在编辑的内容，是否继续？"这类确认消息。

如果不传入 `ask`，确认框的默认回应会被当作取消（`false`），普通提示信息则会通过内核自带的 toast 组件自动显示在工具栏下方。详情请参考 [{{ t('menu_intro_usage') }}](./usage) 文档。

`ask` 中还包含用于从多个选项中选择的 `choose` 处理函数。不过，**粘贴时的格式选择弹窗无需任何额外设置即可正常工作**——`mountToolbar` 挂载时会自动为其接入内核自带的专属弹窗界面，因此使用工具栏的页面无需额外实现即可显示该选择弹窗。只有想用自定义模态框替换它时才需要传入 `ask.choose`。

### 输入输出方法

| 方法 | 说明 |
|---|---|
| `nabi.getHtml()` | 返回用于保存和发布的 HTML |
| `nabi.getJson()` | 返回 nabi-tree（JSON）数据 |
| `nabi.setHtml(html)` · `nabi.setJson(json)` | 替换为新的文档数据 |
| `nabi.onChange(fn)` | 注册文档变化事件监听器 |
| `N.renderStoredHtml(json, registry)` | 不使用编辑器，直接将 nabi-tree 转换为 HTML（参见下方[只读查看器](#只读查看器-viewer)） |

---

## CDN 发布地址

如果需要锁定特定版本，请在 CDN URL 中指定版本号。jsDelivr 和 unpkg 均支持。

未指定版本的 URL（`/npm/nabi-note`）可能因为 CDN 缓存问题导致脚本和 CSS 版本不一致，因此建议指定具体版本号或使用 `@latest` 标签。

| 类型 | 地址 |
|---|---|
| **打包脚本（最新）** | `https://cdn.jsdelivr.net/npm/nabi-note@latest` |
| **打包脚本（锁定版本）** | <code>{{ CDN_BUNDLE }}</code> |
| **样式表（最新）** | `https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css` |
| **样式表（锁定版本）** | <code>{{ CDN_SHEET }}</code> |
| **打包脚本（unpkg）** | `https://unpkg.com/nabi-note` |

CDN 打包文件与 npm 发布包中的 `dist/` 构建产物完全一致。

---

## 只读查看器（Viewer）

对于**仅需展示**已保存 HTML 文档的页面，无需创建编辑器实例。引入同一份样式表，并将 HTML 渲染到 `.nabi-content` 容器内部，即可完全还原编辑器中的显示效果。

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">

<div class="nabi-content">
  <!-- 通过 nabi.getHtml() 保存的 HTML 字符串 -->
</div>
```

如果文档是**以 nabi-tree（JSON）形式保存的**，可以调用渲染函数，使用纯 JavaScript 将其渲染为 HTML。需要传入保存的 JSON 数据和已注册的翅膀列表（`registry`）作为参数。

```html
<script>
  var registry = N.makeRegistry(N.wings().all().build())

  var saved = [{ w: 'p', ch: ['一条评论'] }]   // 从服务器读取的 nabi-tree
  document.querySelector('.nabi-content').innerHTML = N.renderStoredHtml(saved, registry)
</script>
```

如果不是 nabi-tree 格式，会返回 `null`；渲染结果与编辑器实例的 `getHtml()` 结果完全一致，采用相同的 XSS 过滤规则，且不依赖 DOM，因此在服务器（Node.js 等）环境中也能同样运行（参见 [{{ t('menu_intro_ssr') }}](./ssr)）。

在使用 npm 包的服务器环境中，建议使用轻量模块 **`nabi-note/ssr`** 而非全局打包文件。该模块只包含渲染所需的逻辑，因此编辑区域和 UI 相关代码不会被打包进服务器构建产物中。

CSS 样式表中**包含了所有翅膀的样式。**

基础格式仅通过 CSS 即可呈现，但**表格排序和代码语法高亮需要依赖客户端 JavaScript。** 如果需要点击列标题排序、代码分词与着色功能，可以接入轻量级查看器运行时。

```html
<script type="module">
  import { attachViewer } from 'https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/viewer/index.js'

  attachViewer(document.querySelector('.nabi-content'), { locale: 'zh' })
</script>
```

- 即使不接入查看器，文档也能正常显示（只是表格排序功能和代码高亮不可用，不影响正文阅读）。
- 表格排序功能仅对在编辑器中启用了排序功能的表格（带有 `data-nabi-sortable` 属性）生效。
- 代码语法高亮默认内置分词器，无需任何外部依赖。如需使用 Shiki 等外部高亮库，可以通过 `{ locale: 'zh', highlight }` 选项传入。
- 全局 `NabiNote` 打包文件中不包含查看器入口，为了优化只读页面的打包体积，该功能作为独立模块 `nabi-note/viewer` 提供。

---

## 下一篇文档

- [{{ t('menu_intro_usage') }}](./usage) — npm 包安装及编辑器详细使用方法
- [{{ t('menu_wing_custom') }}](../wing/custom) — 亲手制作全新的自定义格式翅膀

<script setup lang="ts">
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
import { useTranslate } from '../../.vitepress/src/langs.ts'
// 版本号动态引用包版本
import { CDN_BUNDLE, CDN_SHEET } from '../../.vitepress/src/version.ts'

const { t } = useTranslate()
</script>
