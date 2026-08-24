---
title: 链接
---

# 链接

## 说明

`linkWing`（id `a`）是处理超链接（`<a href>`）的行内标记翅膀。

点击工具栏按钮会弹出链接地址输入框。只能输入以 `http:`、`https:` 开头的安全地址，像 `javascript:` 这样的恶意脚本地址会被 XSS 安全策略自动过滤掉。

链接输入框里可以同时填写**链接地址**和**显示文字**。文字框留空的话，地址本身就会被当成显示文字。

## 在上下文工具栏里修改链接

光标停在已有链接内部时，动态上下文工具栏会亮出可以直接修改的文字输入框：

| 输入框 | 说明 |
|---|---|
| 链接地址（`href`） | 只改链接指向的地址（显示文字保持不变） |
| 显示名称 | 只改正文里显示的文字（地址保持不变） |

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, linkWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

const { nabi, registry } = createNabiWith([linkWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 演示

<WingDemo path="/wing/inline/link" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
