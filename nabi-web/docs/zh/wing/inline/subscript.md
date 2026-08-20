---
title: 下标
---

# 下标

## 说明

`subscriptWing` 是 `<sub>` 的归属者（claim）。用在化学式，或者要往下写的编号上。

- 认的标签只有 `<sub>` 一个。属性不留。
- 提示模式没有快捷键。
- 选中文字后按下去是切换。
- 长相由这只翅膀用 `Wing.styles` 带的样式表给出。

```css
.nabi-content sub, .nabi-content sup { font-size: .72em; line-height: 0; position: relative; }
.nabi-content sub { vertical-align: sub; }
```

**这份样式表和上标共用一份。** 两只翅膀带着同样的内容，两个都注册也只会在
文档里**挂上一次**（`collectSheets` 会把同样内容的样式表去重）。存值
（HTML）里只留 `<sub>` 标签，样式本身不会跟着走。

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, subscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翅膀清单把种类知识、命令、装配器一起搭起来 —— 这就是 `registry`
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
