---
title: 折りたたみ
description: 要約と本文をまとめ、最初に開くかどうかを保存します。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 折りたたみ

短い要約と本文を 1 つのブロックにまとめます。ツールバーから作成すると、まず要約を入力し、その下に内容を書き続けられます。

三角形で指定した開閉状態は文書に保存され、公開画面の初期状態になります。編集中も三角形を押して開閉できます。

表のセルや別のブロック内でも、対象の折りたたみブロックだけが開閉します。閉じる本文内にカーソルや選択範囲がある場合は外へ移し、別の場所の選択は維持します。

<WingDemo path="/wing/block/details" />

```ts
const selected = wings().use('details').build()
```

## CSS スタイル

折りたたみブロックは `.nabi-content details`、タイトルは `.nabi-content details > summary` で装飾できます。

```css
.article-body details {
  padding: .75rem 1rem;
  border: 1px solid var(--nabi-line);
  border-radius: var(--nabi-radius);
  background: var(--nabi-soft);
}

.article-body details > summary { cursor: pointer; font-weight: 700; }
.article-body details[open] > summary { margin-block-end: .75rem; }
```

`open` 属性は作成者が保存した最初の開閉状態です。CSS でこの状態を装飾できますが、状態そのものを強制的に変えない方がよいです。
