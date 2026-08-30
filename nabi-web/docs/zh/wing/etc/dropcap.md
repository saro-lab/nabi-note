---
title: 首字下沉
description: 用放大的首字开始正文段落。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 首字下沉

把段落的第一个字放大，让后续文字环绕在旁边。这是段落级格式，因此不会只应用到选中单词的一部分。

发布页面和编辑页面会保持相同的形状。编辑时，第一个字会被包在真实元素中，避免光标和删除位置漂移；这个元素不会包含在保存的文档内容中。

<WingDemo path="/wing/etc/dropcap" />

```ts
const selected = wings().use('dc').build()
```

## CSS 样式

发布页面和编辑页面使用不同的选择器表示首字。发布页面使用 `[data-nabi-dropcap="1"]::first-letter`，编辑页面使用真实元素 `[data-nabi-dropcap-letter]`。改变颜色、字体、大小等可见值时，请同时写两个选择器，让编辑输出和发布输出看起来一致。

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  color: var(--nabi-accent);
  font-family: var(--nabi-font-serif);
}
```

如果改变大小和行高，也要把相同的值应用到两个选择器。

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  font-size: 5.5em;
  line-height: .85;
}
```

首字下沉会计算首字周围的行流，所以只改一侧，或把值设得过大，都会破坏 WYSIWYG 的形状。仍然不要给编辑器新增 `::first-letter` 规则。在编辑器中，只设置已有的 `[data-nabi-dropcap-letter]`。
