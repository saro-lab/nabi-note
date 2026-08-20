---
title: 删除线
---

# 删除线

## 说明

`strikeWing` 是 `<s>` 的归属者（claim）。用在已经作废、却还想留在眼前的
值上。

- 进来时 `<s>`、`<strike>`、`<del>` 三个都认，出去时永远是 `<s>`。属性一个都不留
  —— `<del datetime="…">` 里的时刻也不会留下。
- 提示模式的快捷键是 `S`。**没有加速键**——和同一个 `emphasis` 分组里的
  加粗、斜体、下划线不同，没有挂上 `Ctrl`/`⌘` 组合键。
- 选中文字后按下去是切换。
- 不注册的话 `<s>` 会被剥掉外壳、落成纯文本。

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, strikeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翅膀清单把种类知识、命令、装配器一起搭起来 —— 这就是 `registry`
const { nabi, registry } = createNabiWith([strikeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 演示

<WingDemo path="/wing/inline/strikethrough" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
