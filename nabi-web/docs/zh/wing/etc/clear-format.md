---
title: 清除格式
---

# 清除格式

## 说明

`clearFormatWing` 是**做好的常量**。直接放进数组就行——没有选项要传。

`place: 'tool'`，所以不会在文档里立自己的节点。就一个命令（`clearFormat`）
和一个工具栏按钮。

- **要清除的清单钉死在核心里。** 十一个行内标记（`b`·`i`·`u`·`s`·`sub`·
  `sup`·`hl`·`tc`·`fs`·`tf`·`a`）和三个段落属性（`h` 标题·`a` 对齐·`dc`
  首字下沉）。宿主不用管理这份清单，自己写的翅膀的标记**不会被这里清掉。**
- **选中一段范围按下去**，会把这一段里的标记和碰到的段落们的属性一次性剥掉。
- **只有光标时一次剥一层**——从光标所在位置**最里层的标记**开始，剥掉那个
  标记延续的整段。没有标记可剥的时候才轮到剥段落属性。
- **附件链接不剥**——挂着 `file` 属性的链接（`a`）在任何地方都是不可侵犯的。
  剥掉外壳附件就会变成死的纯文本。
- **装着块状物件的段落的对齐会留下。** 装着图片、表格的包装段落上，唯独
  对齐（`a`）不会被剥掉——这挡住了清除格式却把图片顶到左边去的情况。
- 没有可剥的东西时命令答 `null`。不会堆出撤销点。

## 连按两下 <kbd>Esc</kbd>

除了工具栏按钮，还有**一条键盘路**——连着按两下 <kbd>Esc</kbd>。一个字母的
提示、`⌘` 加速键都装不下这个手势，所以它走的是连按声明（`doubleKeys`）。

- **和按按钮做的事一模一样。** 选中一段范围就剥那一段；**只有光标**的话就
  在那个位置剥一层——命令自己就知道该剥什么，键这边不用去分光标是什么状态。
- **发动的时机是恰好第二下。** 敲四下也还是只发动一次，两下之间隔了 350ms
  以上，计数就会重新开始。按住键不放触发的重复（`repeat`）和中文输入法组字
  过程中的敲击都不算。
- **优先级最低。** <kbd>Esc</kbd> 原来要做的其他事（撤销预约、标记转义）都
  轮过一遍才轮到它——在荧光笔正中间按 <kbd>Esc</kbd>，第一下预约的是标记
  转义，第二下照样会走到清除格式。
- **只有五个地方它不生效**——打开的面板、遮罩、全屏、提示徽标、上传锁定。
- 按钮的提示文字也这么写——**「清除格式 (Esc Esc)」**，和 Shift 徽标是同一种
  写法。

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, clearFormatWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翅膀清单把种类知识、命令、装配器一起搭起来 —— 这就是 `registry`
const { nabi, registry } = createNabiWith([clearFormatWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 演示

<WingDemo path="/wing/etc/clear-format" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
