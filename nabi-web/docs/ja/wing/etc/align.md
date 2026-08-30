---
title: 配置
description: 段落とオブジェクトブロックの横方向の配置を変更します。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 配置

現在の段落、または選択範囲に含まれる段落を左、中央、右に配置します。画像、動画、表のように段落内に入るオブジェクトも、そのオブジェクトを包む段落を基準に配置されます。

配置は文字書式ではなく段落属性として保存されます。コードブロックはインデントそのものに意味があるため、配置の対象から除外されます。

<WingDemo path="/wing/etc/align" />

```ts
const selected = wings().use('align').build()
```
