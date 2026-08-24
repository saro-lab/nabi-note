---
title: 对齐
---

# 对齐

## 说明

`alignWing`（id `align`）是负责处理段落和块元素文字对齐（左、中、右）的**段落属性**翅膀。

- 给块节点挂上 `data-nabi-align` 属性（`<p data-nabi-align="center">`）。
- **不只挂段落，标题（`h1`~`h6`）也一样能挂**（`<h2 data-nabi-align="c">`）。
- 对齐值一次只能有一个。再点一次已经按下的对齐按钮，属性就整个掉下来，恢复默认对齐。
- 在段落中间按 Enter 拆开段落，拆出来的两个段落都保留同样的对齐属性。
- **图片、表格、YouTube 等块状物件的对齐也由这只翅膀负责。** 块状物件位于包着它的包装段落（`<div data-nabi-p>`）内部，所以通过工具栏的对齐按钮来控制块状物件的左/右/居中位置。

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, alignWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([alignWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 演示

<WingDemo path="/wing/etc/align" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
