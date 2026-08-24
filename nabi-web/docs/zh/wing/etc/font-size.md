---
title: 文字大小
---

# 文字大小

## 说明

`fontSizeWing`(名字 `fs`)是调整文字大小的**基于值的行内标记翅膀**(画出来是 `<span data-nabi-size="lg">`)。

支持的大小档一共四个:`xs`、`sm`、`lg`、`xl`,默认大小不是第五个值,而是**根本没有这个属性**。

- 点击主工具栏按钮,默认挂上的是 **`lg`(大)**。
- 光标停在字号标记里面时,动态上下文工具栏会出现一根滑块(`range`),可以在"默认"、"特别小"、"小"、"大"、"特别大"之间选。把滑块移到"默认"就会把标记摘掉。
- 没有选中文字、只有光标的状态下选大小,会对整个段落生效。

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, fontSizeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([fontSizeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 演示

<WingDemo path="/wing/etc/font-size" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
