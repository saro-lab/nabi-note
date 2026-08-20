---
title: SSR 支持
description: 在服务器上预先画好存好的值，编辑器、工具栏都能用 hydrate 接手。
---

# SSR 支持

## 只画存好的值

像评论列表这种**只给人看**的地方，不需要编辑器。画文档要用到的只有注册过的
翅膀清单（`registry`）这一样东西，为它单独开了一道门。

```ts
import { makeRegistry, defaultWings, renderStoredHtml, renderStoredEditorHtml } from 'nabi-note/ssr'

// 服务器起来时搭一次 —— 不管存了多少份，都分着用这一份
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['一条评论'] }]   // 从数据库读出来的 nabi-tree

renderStoredHtml(saved, registry)        // '<p>一条评论</p>'
renderStoredEditorHtml(saved, registry)  // '<p data-key="n0">一条评论</p>'
```

**`nabi-note/ssr` 是只装了画图所需东西的入口。** 编辑表面（`surface`）和界面
工具（`ui`）一个文件都不占（有网在源码上守着这条规矩），所以服务器打的包里
不会混进 DOM 代码。`nabi-note` 里也有同一道门，已经装着编辑器的页面照旧用那边
就行。

| | |
|---|---|
| `renderStoredHtml(json, registry, options?)` | 拿去保存、发布的 HTML —— 和 `getHtml()` 是同一个值 |
| `renderStoredEditorHtml(json, registry, options?)` | 编辑器的 HTML —— 和 `getEditorHtml()` 是同一个值（挂着 `data-key`）|

- **两个都不用 DOM**——在服务器上原样能跑。
- **不是 nabi-tree 就答 `null`**——拒绝的规矩和 `setJson()` 一样（整份文档得是
  数组）。不会抛出异常。
- **和编辑器给出的值一字不差。** 走的是同一趟步骤（规范化 → 组装），所以过滤
  XSS 的地方也一样——不会出现"只给看的这份洗得比较松"的情况。
- `options` 只有 `{ allowLocalUrls }` 一项——和 `createNabiWith` 里那个选项是
  同一个意思。

**同一份存好的值永远拿到同一个 `data-key`。** 所以服务器用 `renderStoredEditorHtml`
把编辑器预先画好送下去，浏览器再用 `hydrate` 接手的话，画面不会被重画。

```ts
mountSurface({ nabi, registry, root: surface, hydrate: true })
```

一旦对不上就在原地重画，所以只要服务器和客户端用的翅膀清单一致就行。

::: tip 这个站点自己的首页就是这个样板
首页演示的文档是**构建的时候用 `renderStoredEditorHtml` 预先画好**埋进页面里
的，编辑器就在这份画面上用 `hydrate` 醒过来。所以编辑器代码到达之前文字就已经
能读——不会有一段先空着、忽然被填满的过程。
:::

---

## 工具栏也能预先画好

按钮行**不看文档**。它看的只是注册的翅膀清单、文字和分组顺序，所以画出来的字
是**常量**——服务器起来时调一次，之后一直用这份字。不用每个请求都重新调。

```ts
import { makeRegistry, defaultWings, renderToolbarHtml } from 'nabi-note/ssr'

const registry = makeRegistry(defaultWings)

const toolbarHtml = renderToolbarHtml({ registry, locale: 'zh' })
// '<div class="nabi-group" data-group="font">…</div>'
```

把这段字原样塞进工具栏容器送下去，浏览器这边 `mountToolbar` 会用**同一个函数**
画。已经立着同样一行的话，就**不重画，只接线**。

```ts
mountToolbar({ nabi, registry, surface, root: toolbar })
```

::: warning 容器上要一并写上 `class="nabi-toolbar-row"`
送出预先画好的那一行时，**从第一次画面起**就要有这个类名。内核在 mount 的
时候，如果没有这个类会自己补上，但那样左右留白会在那一刻才贴上去，**按钮行
会跟着往旁边挪一下。** 宿主先写好的话内核就不会碰它（只会摘掉自己贴上的那些）。

```html
<div class="nabi-toolbar-row">预先画好的那一行</div>
```
:::

- **对不上也不会坏**——立着的那一行要是和现在的翅膀清单不一样，就在原地重画。
  丢掉的只是预先画好的那份，画面永远是对的。
- **预先画好的那一行处于"什么都没按下、什么都没藏起来"的状态。** 按下
  （`aria-pressed`）和隐藏是由光标决定的，服务器不知道。要是配置成按钮会随
  光标位置隐藏，mount 之后可能有几个会消失，行会跟着重新收拢。
- **只放在要搭编辑器的地方。** 只给看的页面没有工具栏，没有理由接收这段字。

**预览、全屏这两个按钮走的也是同一条路。** 它们不是翅膀而是遮罩的部件，不算
在上面的工具栏文字里——要单独画出来，放进 `mountViewTools` 要立起来的那个
容器。

```ts
import { renderViewToolsHtml } from 'nabi-note/ssr'

renderViewToolsHtml({ locale: 'zh' })
// '<span class="nabi-tools">…</span>'
```

::: tip 这个站点自己的首页就是这个样板
首页演示的工具栏是**构建时用 `renderToolbarHtml`·`renderViewToolsHtml` 预先
画好**埋进去的，`mountToolbar`·`mountViewTools` 认出这一行只接线。所以不会有
三十五个图标姗姗来迟才填满的过程。
:::

---

## 接下来的文档

- [{{ t('menu_intro_usage') }}](./usage) —— 用 npm 装进来的路子，装配、输入、输出全套
- [{{ t('menu_intro_cdn') }}](./cdn) —— 不用构建工具，一个 `<script>` 就够

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
