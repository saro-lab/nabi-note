---
title: 下划线
---

# 下划线

## 说明

`underlineWing` 是处理下划线格式(`<u>`)的行内标记翅膀。

- 进来时认得 `<u>` 标签，出去时也总是转换为标准 `<u>` 标签。
- 支持提示模式(连按两次 Shift 再按 `U`)和加速键(`Ctrl`/`⌘`+`U`)。
- 选中文字后执行时以切换方式工作。
- 下划线和链接(`<a>`)在画面上看起来可能相似,但它们是各自独立的翅膀,同一段文字可以同时挂着下划线和链接。

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, underlineWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([underlineWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 演示

<WingDemo path="/wing/inline/underline" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
