---
title: 斜体
---

# 斜体

## 说明

`italicWing` 是 `<i>` 的归属者（claim）。用在生僻词或引文这类需要换一种质地的
文字上。

- 进来时 `<i>` 和 `<em>` 都认，出去时统一收成一个 `<i>`。属性一个都不留。
- 提示模式（连按两次 Shift）的快捷键是 `I` —— 按物理键（`KeyI`）捕捉，所以在
  韩文键盘布局下也照样管用。
- 选中文字后按下去是切换。
- 不注册的话，`<i>` 的外壳会被剥掉，落成纯文本。

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
