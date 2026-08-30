---
title: 引用
description: 将引用文字或独立语境跨多个段落组合起来。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 引用

将引用文字或独立语境跨多个段落组合起来。在空段落中输入 `>` 后按 Space，或从工具栏把选中的段落切换为引用。

引用可以包含普通段落，也可以包含列表、图片等块。对同一范围再次切换会解除引用，恢复为外部段落。

<WingDemo path="/wing/block/quote" />

```ts
const selected = wings().use('quote').build()
```

## CSS 样式

通过 `.nabi-content blockquote` 修改边框和间距来设置引用样式。

```css
.article-body blockquote {
  margin-inline: 0;
  padding: .25rem 1rem;
  border-inline-start: 4px solid var(--nabi-accent);
  color: var(--nabi-muted);
  background: color-mix(in srgb, var(--nabi-soft) 72%, transparent);
}
```

保留 `blockquote` 内部的段落结构，只改变外部间距、边框、颜色等表现。
