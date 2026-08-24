---
title: 分割线
---

# 分割线

## 说明

`dividerWing`（标识符 `hr`）处理横向分割线（`<hr>`）。它是 `place: 'void'` 物件，内部不放
文字——在分割线紧前或紧后按 Backspace 或 Delete，整个分割线块就会被删除。

点击按钮插入分割线时，会**用专属的包装段落（`<div data-nabi-p>`）包起来**。光标落在
分割线紧后面。

插入位置由光标当前所在段落的状态决定：

| 光标当前所在位置 | 插入结果 |
|---|---|
| 有文字的段落 | 在该段落**后面**插入新的分割线 |
| 空段落 | 该空段落被**替换为**分割线（避免多余空行） |

替换空段落时，该段落原本的文字对齐属性会保留。

在空行输入三个以上连字符后按 Enter（`---` + Enter），会自动转换为分割线。

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, dividerWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翅膀清单把种类知识、命令、装配器一起搭起来 —— 这就是 `registry`
const { nabi, registry } = createNabiWith([dividerWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 演示

<WingDemo path="/wing/block/divider" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
