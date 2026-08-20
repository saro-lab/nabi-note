---
title: 链接
---

# 链接

## 说明

`linkWing`（id `a`）拥有 `<a href>`。按下按钮，光标附近会打开一层地址
输入面板，只有以 `http`/`https` 开头的地址才会让确认键亮起来 —— 这道白名单检查
本身就是 XSS 防线（像 `javascript:` 这样的协议根本过不去）。没通过校验的 `href`
不会被保存，那种情况下就不带 `<a>` 标签、以纯文本的样子出去。

面板里有两个框 —— 链接地址和要显示的文字。把文字框留空，地址本身就成了文字；
只有光标而没有选中文字时，光标所在的整个链接标记就是作用对象（和荧光笔、文字
颜色是同一条规矩）。

## 已经存在的链接在上下文工具栏里改

光标停在链接里面时，上下文工具栏上会亮出**两个文字框** —— 它们不是打开面板的
按钮，而是直接站在那一行里的输入框（`kind: 'text'`）。它们带着当前的值出现，
按 Enter 或者点到别处就生效。值没变就什么也不做。

| 输入框 | 作用 |
|---|---|
| 链接地址 | 只改地址。显示的文字原样留着。 |
| 显示文字 | 只改显示的文字。地址和附件标记原样留着。 |

**附件（文件链接）不会亮出地址框** —— 那个地址是上传定下来的，不是拿手去改的值。
名称框则不管是普通链接还是附件都照常出现。空名称不接受 —— 做一个没有名字的链接
不叫改名，那叫删掉。

## 附件在画面上是一个整体

附件是整个被当作一体来处理的。点击它光标不会落进里面，而是**整个链接被选中**，
紧挨着按退格或 delete，**整个链接就会消失。** 修改它的事归上下文工具栏管，不归
光标管。

这件事翅膀用 `attach` 拿着，`mountSurface` 会一并挂上——**不需要另外 mount。**

## 附件标记

由上传进来的链接会挂上 `data-nabi-file` 标记（值是扩展名）—— 让样式表画出回形针
方框而不是下划线的，正是这个标记。不管是改名字还是改地址，这个标记都跟着走。
清除格式也唯独不剥附件 —— 剥掉外壳，附件就成了死的纯文本。

`linkWing` 是**常量**——不带括号调用，也没有选项要传。

::: warning `allowLocalUrls` 对链接不起作用
打开 `blob:`·`data:` 地址的开关**只对图片有效**。出去的那道门永远是严格的，
`getHtml()` 过滤地址用的那道门（`ctx.url`）不管宿主开了什么，看到的都还是那份
白名单。

所以带着 `blob:` 地址的附件链接**一导出就会落成纯文本。** 这正是上传不能让
临时地址留在那里的原因——上传完拿到真正的地址之后要换上去，才留得进文档。
:::

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, linkWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翅膀清单把种类知识、命令、装配器一起搭起来 —— 这就是 `registry`
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
