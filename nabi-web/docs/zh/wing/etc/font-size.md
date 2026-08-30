---
title: 文字大小
description: 在允许的档位内改变文字大小。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 文字大小

把选中的文字改成某个大小档位。如果选中了范围，该档位应用到该范围；如果只有光标，则改变当前段落的文字大小。保存的数据只保留允许的档位，不保留 `px` 这样的任意值。

<WingDemo path="/wing/etc/font-size" />

```ts
const selected = wings().use('fs', {
  values: ['sm', 'lg', 'xl'],
}).build()
```

如果省略 `values`，会使用 `xs`、`sm`、`lg`、`xl` 档位。若缩小列表，旧文档中已有的其他档位会在加载时被移除。

## CSS 样式

可以通过 `.nabi-content [data-nabi-size="xs"]` 这样的保存档位选择器改变大小。不要编造文档中不存在的任意档位；只在注册的 `values` 范围内调整 CSS。

```css
.article-body [data-nabi-size="xs"] { font-size: .78em; }
.article-body [data-nabi-size="sm"] { font-size: .9em; }
.article-body [data-nabi-size="lg"] { font-size: 1.3em; }
.article-body [data-nabi-size="xl"] { font-size: 1.65em; }
```

保持各档位之间的大小差距一致，可以在发布文档时保留作者在编辑器中选择的意义。
