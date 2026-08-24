---
title: 下标
---

# 下标

## 说明

`subscriptWing` 是处理下标格式(`<sub>`)的行内标记翅膀。用在化学式、注释编号之类的地方。

- 输入 HTML 时认得 `<sub>` 标签,输出时也照样渲染成 `<sub>`。
- 在工具栏的 `script` 分组里,和上标按钮并排。
- 选中文字后按下去是切换式的。

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, subscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([subscriptWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 演示

<WingDemo path="/wing/inline/subscript" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
