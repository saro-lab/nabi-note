---
title: "脚注"
description: "通过正文中的编号和文末列表关联补充说明。"
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 脚注

通过正文中的编号和文末列表关联补充说明。

使用工具栏的脚注按钮输入内容，即可在光标处插入脚注。如果选中了文字，脚注会插入选区末尾，并保留所选文字。编号不会存储，而是按文档顺序自动生成。

点击正文编号可在属性栏编辑内容。使用删除工具，或在脚注旁按两次 Backspace 或 Delete，先选中再删除。下方列表为只读，没有脚注时会消失。

在预览和已连接 viewer 的发布页面中，将鼠标悬停在编号上，或点击、轻触编号即可查看内容。内容仅接受单行纯文本，以正文基础字号的 0.875 倍无衬线字体显示。HTML 按原样显示为文字。

<WingDemo path="/wing/inline/footnote" />

```ts
const selected = wings().use('fn').build()
```
