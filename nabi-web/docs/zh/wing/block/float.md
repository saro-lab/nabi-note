---
title: 浮动区域
description: 将文字、图片和表格放在正文旁，让后续段落沿着它们排布。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 浮动区域

将简短说明、图片或小表格放在左侧或右侧，让正文环绕在旁边。区域内的内容也可以直接在同一编辑器中修改。虚线边框仅在编辑时显示，预览和发布页面只保留内容与布局。

将光标放在下面示例的区域内，通过属性工具更改左右位置和最大宽度。在预览中，可以查看没有虚线边框时正文的环绕效果。

<WingDemo path="/wing/block/float" />

```ts
const selected = wings().allBasic().build()
```

浮动区域包含在基础翼中。如果只组装需要的翼，可使用 `wings().use('float')`，或直接注册 `floatWing`。区域内要使用的图片、表格、列表等翼也需要一起注册。

## 创建与布局

将光标放在正文中，点击 **浮动区域** 按钮即可创建空区域。默认位于右侧，最大宽度为 40%。选中多个段落后再点击，会将选区触及的完整段落包裹到同一个区域中。不能再次包裹已有的浮动区域，也不能在区域内创建另一个浮动区域。

```ts
nabi.applyCommand('insertFloat', { side: 'right', w: 40 })
```

光标位于区域内时，可以在属性工具中更改左右位置和最大宽度。最大宽度可选 20%、30%、40%、50%。该比例以正文宽度为基准，而非整个屏幕；内容较短时，区域实际宽度可能更小。

```ts
nabi.applyCommand('setFloatSide', { side: 'left' })
nabi.applyCommand('setFloatWidth', { w: 30 })
```

粘贴文字、图片、表格，以及转换块和上传，都保持在区域内部。删除内部表格时，仅删除该表格。选区同时覆盖区域内部和外部时，无法对内部块执行插入或转换。

宽度值旁边的 **解除浮动区域** 按钮会将区域内容放回正文，不会删除内容。创建、调整布局和解除均支持撤销与重做。

```ts
nabi.applyCommand('unwrapFloat')
```

## 正文环绕方式

后续段落会沿区域旁边排布，在区域结束后恢复为正文全宽。下一个标题、表格、代码、分隔线或新浮动区域会从前一区域的下方开始。

正文宽度小于 `36rem` 时，区域与正文会排列为单列。打印时也使用单列，同时保留已保存的方向和最大宽度。文档比较页面会保留各区域的左右位置和最大宽度，但将后续块单独放在下方，便于阅读变更。

## 保存与加载

JSON 会保存 `float` 节点的 `a.side`、`a.w` 及内部块。HTML 则在普通对象段落内的 `div` 上使用 `data-nabi-float` 和 `data-nabi-float-width` 属性。

```html
<div data-nabi-p>
  <div data-nabi-float="right" data-nabi-float-width="40">
    <p>这是一段放在正文旁的说明。</p>
  </div>
</div>
<p>本段沿着区域旁边继续排布。</p>
```

导出为 Markdown 时，以 HTML 保留浮动区域。该功能不会导入任意 CSS `float` 样式，因此保存和恢复时请使用 NABI NOTE 生成的 JSON 或 HTML。编辑器、SSR、预览和发布页面需要连接相同的翼和 CSS，才能保持方向与宽度。

## CSS 样式

可以使用 `[data-nabi-float]` 选择器设置区域内的颜色和间距。外层段落负责布局和最大宽度，因此请勿直接覆盖 `float`、`display` 或宽度。

```css
.brand-note .nabi-content [data-nabi-float] {
  background: var(--nabi-soft);
  border-radius: var(--nabi-radius);
  padding: .75rem;
}
```
