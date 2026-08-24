---
title: 制作自定义翅膀
description: 编写 NABI NOTE 的 Wing 接口规范，学习如何制作全新的自定义格式与功能。
---

# 制作自定义翅膀

翅膀（Wing）是**一个纯 JavaScript 对象**。不需要继承复杂的类，也不需要走什么框架注册流程——
只要把对象放进传给 `createNabiWith` 的数组里，就立刻完成注册。

加粗、表格、文件上传等所有官方内置翅膀，都是按照同一份 `Wing` 接口规范写成的。自己写的自定义
翅膀，也会在与内置翅膀**完全相同的环境和条件**下运行。

---

## 最简单的翅膀示例

一个支持 `<kbd>` 键盘标签的行内标记翅膀示例。

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',                                                   // 这只翅膀的专属标识符（存入 nabi 树的键）
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),   // HTML 输出函数
  }),
  // 检测传入 HTML 中的 <kbd> 标签，将其转换为 nabi 树节点
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

现在，编辑器会保留 `<kbd>` 标签——无论是剪贴板粘贴、`setHtml()`，还是保存后再打开，标记都会
保持不变。

```
已注册：  <p>快捷键：<kbd>Ctrl</kbd>+<kbd>S</kbd></p>   →   保留 <kbd> 标签
未注册：  <p>快捷键：<kbd>Ctrl</kbd></p>              →   <p>快捷键：Ctrl</p>（转换为纯文本）
```

`toHtml` 是把 nabi 树节点导出为 HTML 的序列化函数，`claim` 则是把外部 HTML 读回 nabi 树节点
的反序列化规则。不写 `claim` 也能正常输出 HTML，只是保存后再打开时，标签会被转换成纯文本。

用 `simpleMark()` 做不带属性的标记，`valueMark()` 做带值的标记，`boxObject()` 做独立的块状
物件，`listFamily()` 做列表结构——这些辅助函数都能省掉不少样板代码。

---

## 翅膀模块与工厂函数

**大多数内置翅膀都是预先定义好的不可变常量对象**（`boldWing`、`headingWing` 等）。只有需要
额外配置项的少数翅膀，才会以工厂函数的形式提供。

```ts
makeImageWing({ allowLocalUrls: true })
makeUploadWing({ allowLocalUrls: true })
```

如果只想改动某个内置翅膀的部分行为（比如语法高亮器），可以用展开运算符扩展现有翅膀对象，
只重新定义需要的那部分属性。

```ts
const wing = { ...codeWing, attach: makeCodeAttach({ highlight: myHighlighter }) }
```

---

## 注册顺序与有效性验证

```ts
const { nabi, registry } = createNabiWith([boldWing, italicWing, kbdWing])
```

**数组中翅膀的顺序，就是 HTML 扫描的优先级顺序。** 解析外部 HTML 时（`claim`），会按注册
顺序依次检查，最先声明所有权的翅膀会处理该标签。没有任何翅膀认领的标签会被剥去标签，只保留
内部文本。

工具栏按钮的排列**优先看按钮分组（`button.group`）的顺序**，只有在同一分组内才按翅膀的
注册顺序排列。

### 有效性检查与异常处理（严格校验）

`createNabiWith` 不会把违反规范的翅膀留到运行时才报错——它会在**初始化阶段立即抛出
异常（Error）**。

| 校验项 | 违规示例 |
|---|---|
| 使用保留字作标识符 | `w: 'p'`、`w: 'br'` |
| 重复注册同一标识符（w） | 重复传入同一个 `boldWing` |
| 缺少渲染函数 | `place: 'mark'` 却没有定义 `toHtml` |
| 违反命令命名规则 | 不是动词+名词的驼峰式（例：`insertTable`） |
| 缺少必需的依赖翅膀 | 上传翅膀缺少 `requiresAnyOf` 指定的图片/链接翅膀 |

---

## 命令（Command）——纯函数

所有改动文档的操作，都要通过命令函数执行。命令是**不依赖 DOM API 或屏幕渲染的纯函数**。

```ts
import { boxObject, insertLump, type Command, type Wing } from 'nabi-note'

const insertStamp: Command = (doc, sel, args, env) => {
  // 校验外部传入参数的类型
  if (typeof args['text'] !== 'string') return null
  const stamp = { w: 'stamp', a: { t: args['text'] }, ch: [] }
  const r = insertLump(doc, sel.focus, stamp, env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

export const stampWing: Wing = {
  ...boxObject({
    w: 'stamp',
    attrs: { t: (v) => (typeof v === 'string' ? v : null) },
    toHtml: (node, _children, ctx) =>
      ctx.element('span', ctx.escape(String(node.a?.['t'] ?? '')), { 'data-nabi-stamp': '' }),
  }),
  commands: { insertStamp },
  button: {
    group: 'insert',
    label: { zh: '图章' },
    action: { kind: 'command', command: 'insertStamp', args: { text: '确认' } },
  },
}
```

| 参数 | 说明 |
|---|---|
| `doc` | 当前的 nabi 树文档数组（视为不可变对象，不直接修改，而是返回一份新文档） |
| `sel` | 当前光标及选区状态（`{ anchor, focus }`） |
| `args` | 工具栏按钮或 UI 传入的参数对象 |
| `env` | 模式（schema）知识与环境上下文 |

命令要返回变更后的 `{ doc, selection }` 对象，或者 **`null`**。**文档没有变化时必须返回
`null`。** 返回 `null` 时，`applyCommand` 会返回 `false`，也不会产生多余的撤销历史记录。
返回的文档会经过 `cocoon`（归一化）引擎处理，因此模式完整性有保证。

主机侧按命令名称调用。

```ts
nabi.applyCommand('insertStamp', { text: '确认' })   // 返回 boolean
```

---

## Wing 接口详细规范

`Wing` 接口总共由 31 个属性组成，其中**必需属性有 2 个**（`w`、`place`）。

### 1. 基本标识与结构

| 属性 | 说明 |
|---|---|
| `w` | 翅膀的专属标识符（必需，不能使用保留字 `p`、`br`） |
| `place` | 翅膀的类型（必需：`'mark'` 行内格式、`'void'` 无内容的块状物件、`'container'` 容器块、`'attr'` 段落属性、`'tool'` 不存入文档的工具） |
| `basic` | 是否无需额外后端/主机联动即可直接工作（`boolean`，默认 `false`）。调用 `wings().allBasic()` 时以此为筛选依据 |
| `holds` | 容器内部允许的子内容类型（`'blocks'` 或 `'inline'`） |
| `singleParagraph` | 内部是否固定为单一段落（例如表格单元格） |
| `boolAttrs` | 只用 `1` 表示的布尔属性名称列表 |
| `allows` | 容器内部允许的子翅膀名称列表（未指定时全部允许） |
| `noAlign` | 是否阻止包装段落应用文本对齐（`boolean`，仅限块状物件）。用于防止像代码块这类 `pre` 标签的对齐错位 |
| `requiresAnyOf` | 必须一起注册的依赖翅膀列表（其中至少一个必须注册） |
| `parts` | 翅膀内部从属子组件的定义（表格的行/列，折叠块的摘要行等） |

### 2. 属性与状态管理

| 属性 | 说明 |
|---|---|
| `attrKey` · `attrValues` | 段落属性翅膀使用的属性键，以及允许的取值列表 |
| `currentValue` | 返回当前光标位置属性值的函数（用于显示工具栏按钮的激活状态） |

### 3. 序列化与输入输出

| 属性 | 说明 |
|---|---|
| `toHtml` · `partHtml` | 把 nabi 树节点转换为 HTML 的序列化函数 |
| `toMd` | 把 nabi 树节点转换为 Markdown 的序列化函数（可选，未定义时回退使用 `toHtml`） |
| `partMd` | 子组件（`parts`）的 Markdown 序列化函数 |
| `ioFilter` | 翅膀自身支持的文件输入输出与剪贴板过滤器 |
| `claim` | 判定传入 HTML 标记的归属，并将其转换为 nabi 树节点的函数 |
| `repair` · `partRepair` | 在 JSON 加载时校验并修正节点有效性的函数（返回 `null` 时移除该节点） |

### 4. 输入与事件控制

| 属性 | 说明 |
|---|---|
| `commands` | 翅膀提供的命令函数映射 |
| `onKey` | 光标位于该翅膀节点内部时，优先拦截键盘输入的处理函数 |
| `escapeKeys` | 触发下一次输入的字符离开该标记格式的键列表 |
| `doubleKeys` | 350ms 内连续按两次某键时执行的命令映射（`{ 键名: 命令名 }`，例如 Esc Esc → 清除格式） |
| `inputRules` | 根据输入模式自动执行的格式转换规则 |
| `attach` | 直接在 DOM 元素上绑定或控制事件监听器的钩子（表格拖拽、代码高亮等） |

### 5. UI 与样式

| 属性 | 说明 |
|---|---|
| `button` · `buttons` | 渲染在顶部工具栏上的按钮定义 |
| `context` | 根据光标位置出现的上下文工具栏定义 |
| `styles` | 该翅膀内置的 CSS 样式表字符串 |

---

## 扩展 IO 过滤器

**IoFilter 是一个不直接创建文档节点，而是处理剪贴板粘贴与文件保存/打开格式的扩展点。**

| 字段 | 说明 |
|---|---|
| `id` · `label` | 过滤器的专属标识符，以及在 UI 中显示的标签（标识符重复会抛出异常） |
| `paste` | 分析剪贴板数据（`PasteData`）并返回粘贴候选项的函数 |
| `save` | 保存配置对象（`{ extension, write, lossy?, mime? }`） |
| `read` | 接收文件名与文本，将其解析为 nabi 树的函数（不匹配时返回 `null`） |

IO 过滤器的三个方法均为可选。可以通过挂载选项（`mountSurface`、`mountFile`）、
`createNabiWith({ ioFilters })`，或翅膀自身的 `ioFilter` 属性来注册，**先注册的过滤器
拥有优先权。**

---

## 标识符（`w`）命名规则

`w` 是**在 nabi 树中每个节点上重复存储的标识符字符串**。为了尽量减小序列化体积，建议使用
简短的字符串（例如官方翅膀的 `b`、`hl`、`tf` 等）。
为避免与官方翅膀冲突，建议自定义翅膀使用 `ex` 前缀（例如 `exNote`、`exStamp`）。

::: warning 更改标识符时的注意事项
由于保存数据中的 `w` 字段直接对应标识符，更改标识符可能导致已保存的文档数据在加载时无法
被识别。如果确实需要迁移，请在 `claim` 函数中同时处理旧版本的标识符。
:::

---

## 接下来的文档

- [制作行内标记](./custom/inline) — `claim` · `toHtml` · `escapeKeys`
- [制作块与段落属性](./custom/block) — `place` · `holds` · `allows` · `parts` · `attrKey`
- [键、自动转换、粘贴](./custom/input) — `onKey` · `inputRules` · `attach`
- [UI 与交互](./custom/ui) — `button` · `context` · `styles`，以及用户对话框的接入

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
