---
title: 表
description: 行と列を作り、セル編集と列ソートをサポートします。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 表

ツールバーで行と列を選んで表を作ります。セル内では複数の段落ではなく改行で内容を続けて書き、Tab と Shift+Tab で次または前のセルへ移動します。

行や列の追加・削除、セル結合、見出しセルへの切り替えは、選択したセルを基準に動作します。表をソート可能として保存し、公開画面で列ソートを使うには `nabi-note/viewer` の `attachViewer()` を接続してください。結合セルがある表は列ソートの対象になりません。

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

## CSS スタイル

表は `.nabi-content table`、セルは `.nabi-content :is(th, td)` で装飾します。セルの構造や viewer が挿入するソートボタンは変更しないでください。

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { background: var(--nabi-soft); font-weight: 700; }
.article-body tr:nth-child(even) td { background: color-mix(in srgb, var(--nabi-soft) 45%, transparent); }
```

viewer を接続している場合は `.nabi-sort` ボタンを残してください。セルの `position` や右 padding を強制的に上書きすると、ソートボタンと重なることがあります。
