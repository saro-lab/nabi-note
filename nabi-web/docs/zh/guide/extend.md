---
title: 自定义 wing
description: 添加可保存的新文档功能时需要遵守的契约和实现顺序。
---

# 自定义 wing

自定义 wing 不只是一个工具栏按钮。它是一个声明式扩展，会把保存的文档结构、命令、HTML 和 Markdown 转换、导入规则以及 view 行为放在一起。registry 会在编辑器创建前验证它，防止无效结构进入文档。

## 先寻找最小的 factory

大多数格式不需要完整声明。没有值的行内 mark 用 `simpleMark()`，带有限定值集合的 mark 用 `valueMark()`，无子节点块用 `boxObject()`，列表用 `listFamily()`。

```ts
import { createNabiWith, simpleMark, wings } from 'nabi-note'

const exStrong = simpleMark({
  w: 'exStrong',
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
})

const { nabi, registry } = createNabiWith(wings().allBasic().use(exStrong))
```

## 直接实现几种 wing

下面每个例子都有不同的保存结构。先注册一个，检查 `getJson()` 和 `getHtml()`，确认结构能工作后再添加命令和按钮。

### 1. 无值行内格式：强调

功能只是包住文字时使用 `simpleMark()`。它会保存 `exStrong`，并渲染为 `<strong>`。

```ts
import { simpleMark } from 'nabi-note'

export const exStrong = simpleMark({
  w: 'exStrong',
  clearable: true,
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
  styles: '.nabi-content strong { font-weight: 700; }',
})
```

设置 `clearable: true` 后，清除格式也会移除这个 mark。添加按钮前，可以用 `nabi.applyCommand()` 或其他自定义命令先应用它。同一个 `.nabi-content strong` 选择器会同时设置编辑器和发布内容。

### 2. 有值行内格式：状态语气

颜色、大小或状态需要从允许集合中选择时，使用 `valueMark()`。值保存在 `a.v` 中，列表外的值会在 `repair()` 时被移除。

```ts
import { valueMark } from 'nabi-note'

export const exTone = valueMark({
  w: 'exTone',
  key: 'v',
  values: ['quiet', 'loud'],
  clearable: true,
  toHtml: (node, children, ctx) =>
    ctx.element('span', children(), { 'data-ex-tone': String(node.a?.v ?? '') }),
  styles: `
    .nabi-content [data-ex-tone="quiet"] { opacity: .65; }
    .nabi-content [data-ex-tone="loud"] { color: var(--nabi-accent); font-weight: 700; }
  `,
})
```

它的保存形态是 `{ "w": "exTone", "a": { "v": "loud" }, "ch": ["Important"] }`。CSS 会以保存的值为目标，因此发布内容也会一起改变。不要随意从已有列表中移除值：以前保存的文档在读取时可能会丢失这些值。

### 3. 无子节点块：提示分隔线

图片、视频、分隔线这类没有子节点的独立对象使用 `boxObject()`。

```ts
import { boxObject } from 'nabi-note'

export const exDivider = boxObject({
  w: 'exDivider',
  toHtml: (_node, _children, ctx) => ctx.element('hr', ''),
  styles: '.nabi-content hr { border-color: var(--nabi-line); }',
})
```

如果对象有 URL 或宽度这样的值，请在 `attrs` 中声明验证，并把必需值放入 `requires`。无法验证的值应返回 `null` 拒绝，而不是悄悄替换成默认值。

### 4. 包含多个段落的块：提示框

保存文档内容的块需要声明为 `container`。`holds: 'blocks'` 允许段落、列表和对象块作为子节点。

```ts
import type { Wing } from 'nabi-note'

export const exCallout: Wing = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      padding: 1rem;
    }
  `,
}
```

只有这份声明还不会创建“包住选中段落”的方法。在编辑器 UI 暴露该功能前，请先在 `commands` 中添加纯命令，再添加调用它的 `button`。

### 5. 同时出现的列表和列表项

列表和列表项必须总是一起出现时，使用 `listFamily()`。

```ts
import { listFamily } from 'nabi-note'

export const exList = listFamily({
  w: 'exList',
  item: 'exListItem',
  toHtml: (_node, children, ctx) => ctx.element('ul', children(), { class: 'ex-list' }),
  itemHtml: (_node, children, ctx) => ctx.element('li', children()),
  styles: '.nabi-content .ex-list { border-inline-start: 2px solid var(--nabi-line); }',
})
```

`listFamily()` 会通过把列表内的块包进 item 来修复结构。像勾选状态这样的 item 级值，请添加 `itemDecl` 和 `repairItem`。

### 按一个顺序注册

服务器和浏览器中使用同一组声明，并保持同一顺序。

```ts
const selected = wings()
  .allBasic()
  .use(exStrong)
  .use(exTone)
  .use(exDivider)
  .use(exCallout)
  .use(exList)

const { nabi, registry } = createNabiWith(selected, { locale: 'zh' })
```

## 定义名称和文档结构

写入文档的名称必须匹配 `ex[A-Z0-9]...`。像 `exCallout` 这样用 `ex` 开头，可以防止未来新增的官方 wing 改变已保存内容的含义。

`place` 决定保存结构：`mark` 包住行内内容，`void` 是无子节点块，`container` 持有子节点，`attr` 改变段落属性，`tool` 不创建文档节点。`container` 需要 `holds: 'blocks' | 'inline'` 和 `toHtml()`。

```ts
const exNote = {
  w: 'exNote',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
} as const
```

`attrs`、`boolAttrs`、`allows`、`requiresAnyOf`、`parts` 用来声明保存结构的约束。声明了 `parts` 时，也必须为每个 part 声明对应的 `partHtml`。值选择型 wing 用 `attrKey` 和 `attrValues` 缩小允许范围。

## 所有声明选项

只声明 wing 需要的内容。factory 已经会为你补上一些 field。

| 范围 | 选项 | 用途 |
| --- | --- | --- |
| 基础 | `w`, `place`, `basic`, `styles` | 名称、结构类型、basic catalog 成员、默认 CSS |
| 结构 | `holds`, `singleParagraph`, `attrs`, `boolAttrs` | 子节点类型、Enter 行为、允许的属性、布尔属性 |
| 结构 | `parts`, `allows`, `noAlign`, `requiresAnyOf` | 内部 part、允许的子节点、排除对齐、wing 依赖 |
| 值 | `attrKey`, `attrValues`, `currentValue` | 保存值的 key 和列表、当前值检测 |
| 命令和输入 | `commands`, `onKey`, `escapeKeys`, `doubleKeys`, `inputRules` | 命令、按键处理、Escape/双击按键行为、自动格式规则 |
| surface 行为 | `attach` | surface 的 DOM 行为和清理 |
| 转换 | `toHtml`, `partHtml`, `toMd`, `partMd` | HTML 和 Markdown 输出 |
| 导入和修复 | `claim`, `ioFilter`, `repair`, `partRepair` | HTML 导入、文件处理、JSON 验证和修复 |
| UI | `button`, `buttons`, `context` | 工具栏和上下文 UI 声明 |
| 清除格式 | `clearable` | 清除格式是否移除它 |

`w` 和 `place` 总是必需的。会产生节点的 `mark`、`void`、`container` wing 也需要 `toHtml()`。container 需要 `holds`；每个声明的 part 都需要匹配的 `partHtml`。

## 同时维护 HTML、Markdown 和 JSON

`toHtml()` 把保存的节点渲染为 HTML，`toMd()` 导出 Markdown。如果没有 Markdown builder，会保留生成的 HTML，避免信息丢失。导入时请用 `claim()` 只识别自己的 HTML 元素和验证过的属性。

`repair()` 会在加载 JSON 时运行，也会在命令执行后再次运行。无效属性应返回修正后的节点，无法保留的节点返回 `null`。构建 HTML 时使用 `ctx.element()`、`ctx.escape()`、`ctx.url()`；不要绕过这些检查去拼接标签、属性或 URL。

## 分离命令和画面行为

命令是只接收文档和选择范围并返回下一个文档及其内部选择范围的纯函数。它不会读取或修改 DOM；无法产生有效变更时返回 `null`。命令名称使用以动词开头的小驼峰，例如 `insertNote`。

表格拖拽选择这样的 DOM 专用行为放在 `attach(host)` 中。每个 listener 或被改动的属性都要立即用 `host.onDispose()` 注册清理，即使设置中途失败也能清理。不要修改正在组合输入的文字 DOM，也不要修改 surface 的选择映射。

用 `button`、`buttons`、`context` 声明工具栏和上下文控件；在应用 UI 中重复实现它们的命令规则，可能会让 UI 和文档模型分叉。

## CSS 样式

把 wing 必需的基础 CSS 放进 `styles`。内置 wing 的样式已经包含在 `nabi-note/nabi.css` 中。浏览器中组装选中 registry 样式时可以使用 `collectSheets()` 和 `injectSheets()`；SSR 应链接 CSS 文件。

编辑和发布内容使用相同的 class 和 data 属性，但不要改变编辑中的 `[data-key]` 结构、`display` 或 `white-space`。CSS 只能改变外观，不能改变光标映射。

```ts
const exCallout = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      padding: 1rem;
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      border-radius: var(--nabi-radius);
    }
  `,
} as const
```

只针对 `toHtml()` 创建的 class 或 data 属性。服务专用的修改要更窄，例如 `.article-body .ex-callout`。

## 检查整套契约

确认保存的 JSON 文档重新加载后仍得到相同结构和 HTML。测试 registry 是否会拒绝无效名称、重复命令、缺少 builder 和未满足的依赖。覆盖无效 HTML 导入、`repair()` 输入、命令选择处理、SSR 输出，以及设置过样式的发布页面。

完整类型和 factory 参数，请查看已安装的声明，以及[英文 API reference](https://nabi.saro.me/llms/api-reference.md)。
