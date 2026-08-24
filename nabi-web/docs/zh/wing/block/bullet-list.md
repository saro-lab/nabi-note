---
title: 项目符号列表
---

# 项目符号列表

## 说明

`bulletListWing`（标识符 `ul`，快捷键 `L`）处理无序列表（`<ul>`）。列表项（`<li>`）通过 `parts` 属性内嵌，因此不需要单独注册 `li`。

```ts
parts: { li: { holds: 'blocks' } }
```

点击工具栏按钮，光标所在的块（或选中的多个块）会转换为项目符号列表，再次点击则恢复为普通段落。按下其他列表按钮（编号列表、任务列表等）会立即切换为对应的列表类型。

在段落开头输入 `- `（连字符加空格）也会自动转换为列表。因为检测的是光标前的字符模式，所以在 `- 文字` 状态下敲空格同样会正常转换，已经输入的文字会保留为列表项的内容（不过只在段落的**第一行**才会生效）。

### 快捷键与编辑行为

- <kbd>Tab</kbd>：将当前项缩进一级，成为正上方项的子项。第一项没有上级可以缩进，所以不会有任何反应——在列表内 <kbd>Tab</kbd> 不会插入空格字符。
- <kbd>Shift</kbd>+<kbd>Tab</kbd>：将当前项退出一级。在最上层退出会离开列表，变成普通段落。选中多个项时，被选中的项会一起移动。
- **在空项上按 <kbd>Enter</kbd>**：执行退出一级。如果是最上层的空项，列表就在此结束，下方会生成一个新段落。
- **在项的最前面按 <kbd>Backspace</kbd>**：内容会并入前一项的末尾。如果没有可合并的前一项，则执行退出一级。相反，在项的末尾按 <kbd>Delete</kbd> 会把下一项拉到当前行。
- 项（`li`）内部是块容器，因此包含段落（`p`），加粗、斜体等所有行内格式都可以自由使用。
- 标签上的非标准属性会在规范化时被移除，列表内出现非 `li` 的元素时，会自动包装成 `li` 项进行修正。
- 任务清单与此共用 `<ul>` 标签，但通过是否带有 `data-nabi-list="task"` 属性来区分两个翅膀。

## 标记与嵌套结构

Nabi 树的嵌套结构会原样反映到 HTML 中。由于列表项（`li`）装的是块而非文字，项内的文字会用 `<p>` 段落包裹，嵌套的子列表则安全地放在包装段落（`<div data-nabi-p>`）内部。

```html
<li><p>上级项</p><div data-nabi-p><ul><li><p>下级项</p></li></ul></div></li>
```

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, bulletListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 根据已注册的翅膀列表生成 registry 和 nabi 实例。
const { nabi, registry } = createNabiWith([bulletListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

`li` 通过 `parts` 自动注册，不需要直接传入数组。

## 演示

<WingDemo path="/wing/block/bullet-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
