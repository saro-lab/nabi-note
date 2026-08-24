---
title: UI 与交互
description: 工具栏按钮（button）、上下文工具栏（context）、翅膀专属样式表（styles）的对接方法说明。
---

# UI 与交互

翅膀能提供用户界面（UI）的地方有三处：**主工具栏**（`button`/`buttons`）、**上下文工具栏**（`context`）、**翅膀专属 CSS**（`styles`）。

---

## 工具栏按钮（`button` / `buttons`）

```ts
button: {
  group: 'emphasis',                   // 所属分组（必需）
  svg: '<path d="…"/>',                // 16×16 viewBox 内的 SVG path 字符串
  label: { zh: '加粗' },
  shortcut: 'B',                       // 提示模式（Shift 连按两次）下显示的快捷字符
  accelerator: 'mod+b',                // 键盘快捷键（Ctrl/⌘ 组合）
  action: { kind: 'mark' },            // 切换行内标记的动作
}
```

一只翅膀要提供多个按钮时，用 `buttons` 数组来定义（比如文本对齐翅膀提供左/中/右三个按钮）。每个按钮用 `name` 区分，`value` 写这个按钮代表的值。

### 按钮分组（`group`）顺序

工具栏按钮分组的渲染顺序是固定的：

```
font · heading · emphasis · script · color · link ·
align · list · structure · media · container · clear · file
```

不管把翅膀写在数组的哪个位置，按钮都会自动排到所属分组的位置上，只有同一分组内部才按翅膀的注册顺序排列。指定清单之外的新分组名，就会在工具栏最末尾添加一个新分组。

某个分组下的按钮在当前状态下全部隐藏时，该分组连同分隔线也会自动隐藏。

### 按钮动作（`action`）类型

| `kind` | 动作说明 | 附加属性 |
|---|---|---|
| `'mark'` | 切换行内标记（走核心默认逻辑） | — |
| `'command'` | 执行指定命令 | `command`、`args?` |
| `'menu'` | 显示下拉值选择菜单 | `command`、`argKey`、`values` |
| `'grid'` | 显示插入表格用的行×列格子选择器 | `command`、`rowsKey`、`colsKey`、`max?` |
| `'prompt'` | 弹出输入框，把输入值传给命令 | `command`、`fields` |
| `'file'` | 打开文件选择对话框 | `accept?`、`multiple?` |
| `'host'` | 交给宿主回调处理（`mountToolbar` 的 `onHost`） | — |

没有定义 `action` 的按钮，点击后不会有任何动作。

### 快捷键（`shortcut` 与 `accelerator`）

| 项目 | 形式 | 规则 |
|---|---|---|
| `shortcut` | `'B'` | 拉丁**大写字母或数字，一个字符** |
| `accelerator` | `'mod+b'` | `mod+` 前缀后跟**一个小写字母** |

不同翅膀重复声明同一快捷键时，初始化阶段会立即抛出异常。

指定 `accelerated` 选项，可以让快捷键触发时执行不同的动作（比如点击按钮弹出选项面板，而用快捷键时直接套用默认值）。

::: warning 快捷键只在指定的编辑区域内生效
快捷键事件只会捕捉传给 `mountToolbar({ surface })` 的编辑区域内部发生的按键。一个页面上存在多个编辑器时，必须指定 `surface` 选项才能防止快捷键事件互相干扰。
:::

---

## 按钮"激活（Pressed）"状态的显示规则

工具栏按钮被判定为"当前处于激活状态（Pressed）"的依据，由翅膀类型（`place`）决定：

| `place` | 激活判定依据 |
|---|---|
| `'mark'` | 当前光标位置是否应用了该行内标记 |
| `'attr'` | 当前段落节点的 `currentValue` 返回值是否与按钮的 `value` 一致 |
| `'container'` · `'void'` | 当前光标是否位于该块状物件内部或上方 |
| `'tool'` | 始终保持未激活状态 |

拥有多个值的翅膀（标题、对齐等），只有 `value` 与 `currentValue` 函数返回的字符串一致的按钮才会被涂成激活状态。

```ts
currentValue: (node) => {
  const h = node.a?.['h']
  return typeof h === 'number' && h >= 1 && h <= 6 ? String(h) : undefined
}
```

---

## 按钮自动隐藏规则

编辑器核心会在无法应用格式的情况下，自动禁用或隐藏相关工具栏按钮：

- 在**代码块内部等格式受限的区域**，行内标记及其他新建区块的按钮会自动隐藏。
- 在块状物件（图片、表格等）的包装段落上，标题等段落属性会被隐藏（但**文本对齐（`a`）作为对齐物件本身的例外会保留**）。
- 不在上级容器 `allows` 允许清单中的翅膀按钮会自动隐藏。

---

## 动态上下文工具栏（`context`）

针对当前光标所在元素提供专属设置工具的辅助工具栏（比如点击图片时出现的尺寸调整滑块、点击链接时出现的 URL 输入框、光标位于表格内部时出现的增加行/列按钮）。

```ts
context: {
  title: { zh: '便签' },
  controls: [
    {
      kind: 'select',
      name: 'tone',
      label: { zh: '语气' },
      command: 'setNoteTone',
      argKey: 'value',
      attr: 't',                                    // 读取当前值的节点属性字段
      values: [
        { value: 'info', label: { zh: '提示' } },
        { value: 'warn', label: { zh: '警告' } },
      ],
    },
  ],
}
```

### 上下文工具栏控件类型（`ContextControl`）

| `kind` | 控件形态 | 主要属性 |
|---|---|---|
| `'button'` | 简单点击按钮 | `command`、`args?` |
| `'toggle'` | 开/关切换开关 | `command`、`token` |
| `'select'` | 下拉选择菜单 | `command`、`argKey`、`values`、`attr?` |
| `'range'` | 滑动条（调整宽度等） | `command`、`argKey`、`values`、`rest?`、`readout?` |
| `'text'` | 文本输入框（链接地址等） | `command`、`argKey`、`initial?`、`placeholder?`、`validate?` |
| `'prompt'` | 复合表单输入弹窗 | `command`、`fields` |
| `'lightbox'` | 图片放大弹窗 | `src`、`alt?` |

所有控件都共同支持 `name`（必需）、`label?`、`svg?`、`tip?`、`visible?` 属性。通过 `visible(node)` 函数，可以根据特定条件（比如仅在单元格已合并时才显示"取消合并"按钮）动态控制控件的显示与否。

---

## 翅膀专属样式（`styles`）

翅膀可以自带所需的 CSS 样式。

```ts
styles: `
  .nabi-content aside[data-nabi-note] {
    border-left: 3px solid var(--nabi-accent);
    padding: 0.5rem 1rem;
    margin: 1rem 0;
  }
`
```

通过 `collectSheets(registry)` 与 `injectSheets(document, sheets)`，可以只把已注册翅膀的样式动态注入文档，相同的样式字符串不会被重复注入。

---

## 对接用户对话框（`ask`）

```ts
const { nabi, registry } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

- `message`：显示简单提示（`(text: string) => void`）
- `confirm`：确认/取消选择窗（`(text: string) => boolean | Promise<boolean>`）
- `choose`：多选项选择窗（`(question: string, options: ChooseOption[]) => number | Promise<number>`）

`ChooseOption` 的结构是 `{ label: string, icon?: string }`，返回值是所选选项的从 0 开始的下标（取消时为 `-1`）。

::: warning 未指定 ask 处理函数时的默认行为
不传入 `ask` 处理函数时，`confirm` 出于安全考虑默认返回 `false`（取消）。`choose` 在没有处理函数时默认选中第一个候选项（下标 `0`）——像粘贴格式选择这类 UI，会在 `mountToolbar` 挂载时自动绑定核心内置的专属界面，因此一般环境下无需自己实现 `choose`。
:::

---

## 接下来的文档

- [创建行内标记](../custom/inline) · [创建块与段落属性](../custom/block) · [键位、自动转换、粘贴](../custom/input)
- [样式自定义](../../style/custom) — CSS 变量与主题指南

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
