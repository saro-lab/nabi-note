---
title: 荧光笔
---

# 荧光笔

## 说明

`highlightWing`（名字 `hl`）是 `<mark data-color="...">` 的归属者（claim）。是
带值的行内标记，所以不是开关式的切换，而是挑一种颜色的分支——和文字颜色是
同一路数。

- **工具栏按钮（快捷键 `H`）挂上的是黄色**——会带着 `{ c: 'yellow' }` 调用
  `setHighlight`。不是不带参数运行的按钮。
- 所以这个按钮的切换是**针对黄色的切换**。只有选中的范围**全部是黄色**时才
  会脱掉——在全是绿色的范围上按下去，不会脱掉而是换成黄色，得再按一次才会
  脱掉。
- 光标停在荧光笔标记里面时，上下文工具栏上会亮出六个色样——按一下就当场
  只换颜色。这只翅膀没有单独的"清除"格子。再按一次同样的颜色就会脱掉，
  清除格式是 `clearFormatWing` 的活儿（要另外注册）。
- **只放着光标去挑颜色时分两种情况。** 光标已经在荧光笔标记里面的话，那个
  标记盖住的全部文字就是作用对象（不用重新选一遍范围）。在标记外面的话没有
  字可以挂,就留成**预约**,下一个敲的字会带着这个颜色出来。
- 存下来的值里只留颜色名——`data-color="yellow"` 这样。不会有内联 `style`
  出去。实际的背景色由这只翅膀用 `styles` 带的样式表画出来（和文字色共用
  一份），颜色值本身在核心标记 `--nabi-hl-*` 里——宿主覆盖那些标记就能换色。
- **清单之外的值哪儿都站不住。** 命令根本不会运行,进来的 HTML 里带着清单外
  `data-color` 的 `<mark>` 会被剥掉外壳、**只留下文字。** 完全没有
  `data-color` 的 `<mark>` 也是一样——颜色就是值,没有值的荧光笔没有地方能
  站。
- 手改过的存值也一样——`repair` 碰到清单外的值就把那个节点连壳一起撤掉。

| 颜色名 | 存下来的值 |
|---|---|
| 黄色 | `yellow` |
| 绿色 | `green` |
| 天蓝 | `cyan` |
| 粉色 | `pink` |
| 紫色 | `purple` |
| 橙色 | `orange` |

这六个以 `HIGHLIGHT_COLORS` 导出——不是颜色值,而是**名字的数组**
（`readonly string[]`）。颜色值由样式表拿着。

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, highlightWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翅膀清单把种类知识、命令、装配器一起搭起来 —— 这就是 `registry`
const { nabi, registry } = createNabiWith([highlightWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 演示

<WingDemo path="/wing/inline/highlight" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
