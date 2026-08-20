---
title: UI 与行为
description: 工具栏按钮（button）·上下文工具栏（context）·样式表（styles）—— 翅膀站到人面前的三个地方。
---

# UI 与行为

翅膀站到人面前的地方有三处。

| 字段 | 在哪里 |
|---|---|
| `button` · `buttons` | 上面的**工具栏**——一直看得见的地方 |
| `context` | **上下文工具栏**——只在光标碰到的东西上才出现的地方 |
| `styles` | 这只翅膀携带的 **CSS** |

---

## 工具栏按钮

```ts
button: {
  group: 'emphasis',                   // 站在哪个分组——必需
  svg: '<path d="…"/>',                // 16×16 坐标系里的内容。没有的话用文字顶替
  label: { zh: '加粗' },
  shortcut: 'B',                       // 提示模式下显示的字母
  accelerator: 'mod+b',                // Ctrl/⌘ 组合键
  action: { kind: 'mark' },
}
```

按钮有好几个的话写进 `buttons` 数组——像对齐翅膀立起左、中、右三个按钮那样。
这时候用 `name` 互相区分，用 `value` 写各自代表的值。

### `group`——顺序由分组决定

```
font · heading · emphasis · script · color · link ·
align · list · structure · media · container · clear · file
```

**这个顺序是钉死的。** 不管翅膀放进数组的哪个位置，按钮都会站到自己分组的
位置上。只有同一分组内部才按注册顺序排列。用了清单外的名字，就会在最后面
立一个新分组。

一个分组整个是空的时候（里面的按钮全都藏起来了），那个分组会从画面上消失
——不会留下空的分隔线。

### `action`——按下去会发生什么

| `kind` | 做什么 | 要一起写的 |
|---|---|---|
| `'mark'` | 走核心的标记切换。**不用写命令** | — |
| `'command'` | 跑一个命令 | `command` · `args?` |
| `'menu'` | 把值列表展开成面板 | `command` · `argKey` · `values` |
| `'grid'` | 展开行×列格子（插入表格） | `command` · `rowsKey` · `colsKey` · `max?` |
| `'prompt'` | 弹出输入框，把值传给命令 | `command` · `fields` |
| `'file'` | 打开选文件窗口 | `accept?` · `multiple?` |
| `'host'` | 交给宿主处理（`mountToolbar` 的 `onHost`） | — |

不写 `action` 的话，这个按钮按下去什么都不会发生。

### `shortcut` 和 `accelerator`

| | 形式 | 规则 |
|---|---|---|
| `shortcut` | `'B'` | 拉丁**大写字母或数字，一个字符** |
| `accelerator` | `'mod+b'` | `mod+` 后面跟**一个小写字母** |

两个都是**翅膀之间撞了就会在注册的那一刻失败。** 不会晚点悄悄哪个不生效。

单独写 `accelerated` 的话，用加速键按下时会走另一个动作——比如按按钮会打开
面板，但用 <kbd>Ctrl</kbd>+键直接套用默认值。

---

## 怎么显示成"按下状态"

按钮被涂成"现在开着"的依据只有一个。

| `place` | 看的是什么 |
|---|---|
| `'mark'` | 光标所在位置有没有这个标记 |
| `'attr'` | 光标所在段落的 `currentValue` |
| `'container'`·`'void'` | 光标是不是在那个块状物件里面或上面 |
| `'tool'` | **永远是关闭状态** |

有多个值的翅膀（对齐、标题）每个按钮各写一个 `value`，只有翅膀的
`currentValue` 答出的值和它一样的按钮才会被涂色。

```ts
currentValue: (node) => {
  const h = node.a?.['h']
  return typeof h === 'number' && h >= 1 && h <= 6 ? String(h) : undefined
}
```

**`currentValue` 答的是字符串**——就算是数字值也要用 `String()` 转成字符串
再答。`undefined` 代表"这个节点上没有我的值"。

---

## 站不住的地方按钮会自己藏起来

| `place` | 什么时候藏起来 |
|---|---|
| `'mark'` | 在只能有纯文字的地方（比如代码块里面），而且那个地方的主人是我时 |
| `'attr'` | 光标在装着块状物件的包装段落上时。**只有对齐（`a`）例外** |
| `'void'`·`'container'` | 在只能有纯文字的地方，或者现在这个容器的 `allows` 不接受我时 |
| `'tool'` | 不会藏 |

对齐之所以例外，原因和前面看到的一样——块状物件的对齐不是它自己的属性，
而是包着它的包装段落的属性。在图片上面也得能按"居中"。

写了 `allows` 的话，**工具栏会自动跟着走。** 代码块里面表格按钮会消失，
不是另外写的规则，就是从 `allows` 这一个字段推出来的。

---

## 上下文工具栏

只在光标碰到的东西上才出现的一行。按图片时出现的调整大小、光标停在链接上时
出现的地址框，都是这里。

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
      attr: 't',                                    // 读取当前值的属性字段
      values: [
        { value: 'info', label: { zh: '提示' } },
        { value: 'warn', label: { zh: '警告' } },
      ],
    },
  ],
}
```

### 什么时候出现

光标所在位置**碰到的一切**都会各自展开自己那一行。

- 光标路径上的所有容器（内层在前，外层在后）
- 被瞄准的块状物件（比如在包装段落上被选中的图片）
- 光标所在位置挂着的**标记们**——和工具栏按钮不同，标记也有自己的上下文行
- 光标所在段落带值的**段落属性**翅膀

在表格里的链接上放光标，链接那一行和表格那一行会一起出现。

### `ContextControl` 的七种

| `kind` | 是什么 | 要一起写的 |
|---|---|---|
| `'button'` | 按一下跑一个命令 | `command` · `args?` |
| `'toggle'` | 开/关两种状态 | `command` · `token` |
| `'select'` | 从列表选一个 | `command` · `argKey` · `values` · `attr?` |
| `'range'` | 拖动刻度（调整大小） | `command` · `argKey` · `values` · `rest?` · `readout?` |
| `'text'` | 一个文字输入框（链接地址） | `command` · `argKey` · `initial?` · `placeholder?` · `validate?` |
| `'prompt'` | 好几个输入框合成一个面板 | `command` · `fields` |
| `'lightbox'` | 放大看 | `src` · `alt?` |

七种共同都有 `name`（必需）· `label?` · `svg?` · `tip?` · `visible?`。

`visible: (node) => boolean` 是**在同一只翅膀内部挑格子藏起来**的门——比如
只在已经合并的格子上显示"取消合并"。

写了 `attr` 就会直接从那个属性字段读当前值来上色。`'toggle'` 用 `token` 和
`currentValue` 答出的字符串做比较。

---

## `styles` ——翅膀携带的 CSS

```ts
styles: `
.nabi-content aside[data-nabi-note] {
  border-inline-start: 3px solid var(--nabi-accent);
  padding: .6rem .9rem;
  background: color-mix(in srgb, var(--nabi-accent) 8%, transparent);
}
`
```

四条规则。

- **限定在 `.nabi-content` 下面。** 不能扩散到宿主页面的其他文字上。
- **字号用 `rem` 或 `em`。**
- **深色分支只用 `.dark` 类名来分。** 用媒体查询来分的话，宿主开着浅色画面
  时编辑器会单独变暗。
- **宽窄用容器查询来量。** 基准是编辑器所在容器的宽度，不是屏幕宽度。

只想装注册过的部分，就自己收集、挂上去。

```ts
import { collectSheets, injectSheets } from 'nabi-note'

const detach = injectSheets(document, collectSheets(registry))
```

同一段文字的样式表**只会加载一次**——好几只翅膀分着带同一段 CSS，文档里
也只会挂上一份。答案是撤销函数，**只撤掉这次调用新挂上的部分。**

---

## 向人发问

```ts
const { nabi, registry } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

`confirm` 既接受 `boolean` 也接受 `Promise<boolean>`——可以直接插浏览器自带的
`confirm`，也可以弹出自己做的面板，晚点再给答案。

::: warning 不给的话答案永远是"不"
不插 `ask` 就会用一套安安静静的默认值。`message` 哪儿都不去，`confirm` 答
`false`。这么定的理由是**该问却悄悄没问成**，总比**悄悄就那么做成了**要好。
本地历史记录里"真的要删除吗"走的就是这道门。
:::

::: tip 命令没法发问
命令是纯函数，不认识画面也不认识时间。需要发问的事要在命令外面问，**拿到
答案之后**再调用命令。翅膀内部能做这件事的地方是 `attach`，在那里用
`host.nabi.$ask` 就能问到。
:::

---

## 接下来的文档

- [行内标记](../custom/inline) · [块与段落属性](../custom/block) ·
  [键、自动转换、粘贴](../custom/input)
- [主题与 CSS 变量](../../style/custom) —— 样式表依赖的变量名

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
