---
title: SSR 支持
description: 在服务器上预先渲染保存的文档，浏览器端通过 hydrate 接管编辑器和工具栏，立即激活。
---

# SSR（服务器端渲染）支持

## 渲染已保存的文档（只读页面）

像评论列表、文章查看页这类**只需要展示文档**的页面，不需要创建编辑器实例。渲染文档为 HTML 所需的只有注册过的翅膀清单（`registry`），因此提供了专用于服务器的渲染函数。

```ts
import { makeRegistry, defaultWings, renderStoredHtml, renderStoredEditorHtml } from 'nabi-note/ssr'

// 服务器启动时创建一次，之后在多个请求间复用。
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['一条评论'] }]   // 从数据库读取的 nabi-tree

renderStoredHtml(saved, registry)        // '<p>一条评论</p>'
renderStoredEditorHtml(saved, registry)  // '<p data-key="n0">一条评论</p>'
```

**`nabi-note/ssr` 是只包含核心渲染逻辑的轻量入口。** 它完全不引用编辑区域（`surface`）和界面工具（`ui`），并通过架构层单元测试严格保证服务器打包结果中不会混入 DOM 代码。如果所处环境已经加载了完整的编辑器包，也可以直接从 `nabi-note` 包中使用同样的函数。

| 函数 | 说明 |
|---|---|
| `renderStoredHtml(json, registry, options?)` | 用于保存、发布的 HTML —— 与编辑器 `getHtml()` 的值相同 |
| `renderStoredEditorHtml(json, registry, options?)` | 用于初始化编辑器的 HTML —— 与 `getEditorHtml()` 的值相同（带有 `data-key`）|

- **完全不使用 DOM API。** 可以直接在 Node.js 等服务器环境中运行。
- **不是有效的 nabi-tree 结构时返回 `null`。** 校验规则与 `setJson()` 相同；即便传入了错误的数据，也不会抛出异常，而是返回 `null` 并通过 `console.error` 记录原因。
- **与编辑器实例生成的结果完全一致。** 因为经过的是同一套规范化与组装流程，XSS 过滤也在同样的地方生效。
- `options` 参数支持 `{ allowLocalUrls?: boolean }`，作用与 `createNabiWith` 中的同名选项一致。

**同一份 nabi-tree 数据总会生成相同的 `data-key`。** 因此可以在服务器上用 `renderStoredEditorHtml` 预先渲染编辑器初始 HTML 并发送给客户端，浏览器端再以 `hydrate: true` 选项挂载，即可在没有重绘、没有闪烁的情况下立即激活编辑器。

```ts
mountSurface({ nabi, registry, root: surface, hydrate: true })
```

即便服务器端与客户端的渲染结果出现不一致，客户端也会自动正常重新渲染，因此只需保证服务器和客户端使用相同的翅膀清单（`registry`）即可安全运作。

::: tip 本站首页演示正是以 SSR hydration 方式运行
首页演示的文档在**构建阶段就通过 `renderStoredEditorHtml` 预先渲染**并嵌入 HTML 中，客户端脚本加载完成后再通过 `hydrate` 激活编辑器。因此在 JS 加载完成之前正文内容就已经可见，不会出现布局偏移（CLS）。
:::

---

## 预先渲染工具栏

工具栏的按钮结构**不依赖文档内容。** 它只根据已注册的翅膀清单、显示语言（locale）和分组顺序生成，因此结果是确定性的。可以在服务器启动时渲染一次并缓存，供多个请求复用。

```ts
import { makeRegistry, defaultWings, renderToolbarHtml } from 'nabi-note/ssr'

const registry = makeRegistry(defaultWings)

const toolbarHtml = renderToolbarHtml({ registry, locale: 'zh' })
// '<div class="nabi-group" data-group="font">…</div>'
```

将这段 HTML 字符串嵌入工具栏容器并发送给客户端，浏览器端的 `mountToolbar` 会识别出已有的标记，**只绑定事件监听，而不会重新渲染。**

```ts
mountToolbar({ nabi, registry, surface, root: toolbar })
```

::: warning 请在容器元素上一并写出 `class="nabi-toolbar-row"`
发送预先渲染好的工具栏时，工具栏行元素**从一开始**就必须带有 `class="nabi-toolbar-row"`。如果缺失，挂载时会自动补上这个类，而随之附加的内边距会在那一刻才生效，**导致按钮行出现瞬间的位移。**
:::

- **结构不一致也是安全的。** 如果传入的 HTML 与当前翅膀清单不同，客户端会立即在原地重新渲染，画面不会损坏。
- **预先渲染的工具栏处于默认状态**（未激活、未隐藏）。按钮的激活状态（`aria-pressed`）和上下文可见性由光标位置决定，客户端挂载后会自动根据光标位置同步状态。
- **仅在包含编辑器的页面中使用。** 单纯的只读页面不需要工具栏。

**预览与全屏按钮也可以用同样的方式预先渲染。** 这两个是视图工具组件而非翅膀，需要用 `renderViewToolsHtml` 单独渲染。

```ts
import { renderViewToolsHtml } from 'nabi-note/ssr'

renderViewToolsHtml({ locale: 'zh' })
// '<span class="nabi-tools">…</span>'
```

::: tip 首页演示的工具栏同样应用了预先渲染
首页演示的工具栏在**构建阶段就通过 `renderToolbarHtml` 和 `renderViewToolsHtml` 预先渲染**好并嵌入页面，`mountToolbar` 与 `mountViewTools` 只识别该行并绑定事件。因此不会出现数十个工具栏图标延迟逐一出现的现象。
:::

---

## 下一步

- [{{ t('menu_intro_usage') }}](./usage) —— 通过 npm 安装及编辑器详细使用方法
- [{{ t('menu_intro_cdn') }}](./cdn) —— 无需构建工具，仅用一个 `<script>` 标签即可使用

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
