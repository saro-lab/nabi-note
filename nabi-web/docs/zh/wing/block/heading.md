---
title: 标题
---

# 标题

## 说明

`headingWing`（id `h`）**只有一个**，六个级别全靠它一个拿着。标题不是独立的节点，
而是**段落的属性**——存值是 `{"w":"p","a":{"h":2}}`，出去的时候变成 `<h2>`。

段落自身就变成标题，所以对齐、首字下沉这类别的段落属性会跟着一起挂上
（`<h2 data-nabi-align="c">`）。

## 工具栏只有一个，级别在上下文工具栏里选

**工具栏按钮只有 `H` 一个。** 在段落上按它就变成标题 1；光标在标题里面时，
上下文工具栏上会出现`标题`·`H1`~`H6` 几个格子——当前是第几级看上去就是按下去的
那一格，按别的格子就换到那一级。按`标题`格子就退回段落。

在空行里按级数敲相应个数的 `#`（二级就是 `##`）再按空格，就自动变成那一级的
标题——敲下的 `#` 和空格本身会被抹掉。

## 使用示例

级别选择器由 `mountContextToolbar` 画出来。

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, headingWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翅膀清单把种类知识、命令、装配器一起搭起来——这就是 `registry`
const { nabi, registry } = createNabiWith([headingWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

也可以直接用命令来挂。

```ts
nabi.applyCommand('setHeading', { value: 2 })  // 变成二级标题
nabi.applyCommand('setHeading', { value: 2 })  // 再按同一级——退回段落
```

选中好几个段落再挂，就会挂到**选区碰到的每一个段落**上。表格、列表这类占着段落
位置的东西会被跳过——因为标题是文字段落的属性。

## 演示

<WingDemo path="/wing/block/heading" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
