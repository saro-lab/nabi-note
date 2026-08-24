---
title: 清除格式
---

# 清除格式

## 说明

`clearFormatWing` 是清除已应用的格式、把文字还原成纯文本的工具（`place: 'tool'`）翅膀。

- **清除对象**：11 种行内标记（`b`、`i`、`u`、`s`、`sub`、`sup`、`hl`、`tc`、`fs`、`tf`、`a`）和 3 种段落属性（`h` 标题、`a` 对齐、`dc` 首字下沉）。
- **选中一段文字后执行**：选区内的所有行内标记和段落属性会一次性清除。
- **只有光标时执行**：从光标所在的最内层标记开始依次解除，没有可解除的标记时才会重置段落属性。
- **附件链接（`data-nabi-file`）会被保护**：和普通网页链接不同，文件附件链接不在清除范围内，文件信息得以保留。
- **块状物件（图片、表格等）包装段落的对齐会保留。**

## 连按两下 <kbd>Esc</kbd>

除了工具栏按钮，**350ms 内连按两下 <kbd>Esc</kbd>** 也会立即执行清除格式命令。

- 无论是有文字选区还是只有光标，都会和按工具栏按钮时完全一样，分阶段解除格式。
- <kbd>Esc</kbd> 的优先级被处理为最低——即使第一次按下已经触发了标记转义的预约，第二次按下时清除格式依然会正常发动。

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, clearFormatWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([clearFormatWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 演示

<WingDemo path="/wing/etc/clear-format" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
