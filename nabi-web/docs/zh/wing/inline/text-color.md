---
title: 文字颜色
---

# 文字颜色

## 说明

`textColorWing`（名字 `tc`）是 `<span data-color="...">` 的归属者（claim）。
和荧光笔是同一路数，是带值的行内标记，所以不是开或关，而是挑一种颜色。

- **工具栏按钮（快捷键 `C`）挂上的是绿色**——会带着 `{ c: 'green' }` 调用
  `setTextColor`。不是不带参数运行的按钮。
- 所以这个按钮的切换是**针对绿色的切换**。选中的范围全是绿色时才会脱掉，
  挂着别的颜色的话就换成绿色。
- 光标停在文字颜色标记里面时，上下文工具栏上会亮出五个色样——按一下就
  当场只换颜色（标记不会一层层叠上去）。这只翅膀没有单独的"清除"格子——
  再按一次同样的颜色就会脱掉，其余归 `clearFormatWing` 管。
- **只放着光标去挑颜色时分两种情况。** 在标记里面的话那个标记盖住的全部
  文字就是作用对象；在标记外面的话就留成**预约**，下一个敲的字会带着这个
  颜色出来。
- 存下来的值里只留颜色名——`data-color="green"` 这样。不会有内联 `style`
  出去。颜色值由核心标记 `--nabi-tc-*` 拿着，样式表和荧光笔共用一份。
- 进来时（`claim`）只看既是 `<span>` 标签、又带 `data-color` 属性的那些——
  完全没有 `data-color` 的 `<span>` 这只翅膀不认领，外壳会被剥掉、落成纯
  文本，**属性在但值不在清单里的话，也是外壳被剥掉、只留下文字。**
- 手改过的存值里清单外的值，`repair` 也会连壳一起撤掉。
- 和荧光笔是两个不同的标记，所以能同时挂在同一段文字上——荧光笔的样式表
  不写 `color`，就是这个原因。

| 颜色名 | 存下来的值 |
|---|---|
| 绿色 | `green` |
| 珊瑚色 | `coral` |
| 紫色 | `violet` |
| 琥珀色 | `amber` |
| 蓝色 | `blue` |

这五个以 `TEXT_COLORS` 导出——不是颜色值，而是**名字的数组**
（`readonly string[]`）。

## 使用示例

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, textColorWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翅膀清单把种类知识、命令、装配器一起搭起来 —— 这就是 `registry`
const { nabi, registry } = createNabiWith([textColorWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## 演示

<WingDemo path="/wing/inline/text-color" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
