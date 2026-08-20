---
title: 加粗
---

# 加粗

## 说明

`boldWing` 是 `<b>` 的归属者（claim）。选中文字后按下工具栏的 **B**，或者用提示
模式（连按两次 Shift 后按 `B`）施加，那一段就会变粗。

- 进来时 `<b>` 和 `<strong>` 都认，出去时永远只出一个 `<b>`。属性一个都不留 ——
  `class`、`style`、`data-*` 全部脱落，只剩标签。
- 提示模式的快捷键是 `B`，加速键是 `Ctrl`/`⌘`+`B`（`mod+b`）。
- 选中文字后按下去是切换（`toggleMark`）—— 已经整段都粗就取消，否则就施加。
  这只翅膀没有自己的命令——按钮是 `action: { kind: 'mark' }`，直接走核心的
  `toggleMark`。
- 不注册的话，`<b>` 的外壳会被剥掉，落成纯文本（没注册的标签全都是这个下场 ——
  这是整个 nabi 的规矩）。

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, boldWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翅膀清单把种类知识、命令、装配器一起搭起来 —— 这就是 `registry`
const { nabi, registry } = createNabiWith([boldWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 演示

<WingDemo path="/wing/inline/bold" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
