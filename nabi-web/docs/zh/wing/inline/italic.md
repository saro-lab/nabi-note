---
title: 斜体
---

# 斜体

## 说明

`italicWing` 是处理斜体样式(`<i>`)的行内标记翅膀，用来在语气上把文字分出一层——强调、
外来词之类。

- 进来的 `<i>` 和 `<em>` 都认，出去统一变成标准的 `<i>` 标签。
- 支持提示模式(连按两次 Shift 再按 `I`)和快捷键 `Ctrl`/`⌘`+`I`。
- 选中文字后执行就是切换。

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, italicWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翅膀清单把种类知识、命令、装配器一起搭起来 —— 这就是 `registry`
const { nabi, registry } = createNabiWith([italicWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 演示

<WingDemo path="/wing/inline/italic" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
