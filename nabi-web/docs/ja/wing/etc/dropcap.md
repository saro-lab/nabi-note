---
title: ドロップキャップ
description: 段落の最初の文字を大きく配置して本文を始めます。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# ドロップキャップ

段落の最初の文字を大きく置き、残りの行がその横に流れるようにします。段落単位の書式なので、文字の一部だけを選択して適用するものではありません。

公開画面と編集画面は同じ形を保ちます。編集中は最初の文字を実際の要素で包み、キャレットや削除位置がずれないように処理します。この要素は保存される文書内容には含まれません。

<WingDemo path="/wing/etc/dropcap" />

```ts
const selected = wings().use('dc').build()
```

## CSS スタイル

公開画面と編集画面では、最初の文字を指すセレクターだけが異なります。公開画面は `[data-nabi-dropcap="1"]::first-letter`、編集画面は実際の要素である `[data-nabi-dropcap-letter]` を使います。色、フォント、サイズのような見た目の値を変えるときは、編集時と公開時の見た目が同じになるよう、必ず両方のセレクターを一緒に書きます。

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  color: var(--nabi-accent);
  font-family: var(--nabi-font-serif);
}
```

サイズと行の高さも変える場合は、両方のセレクターに同じ値を適用します。

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  font-size: 5.5em;
  line-height: .85;
}
```

ドロップキャップは最初の文字の周囲に流れる行を計算するため、片方だけを変えたり値を大きくしすぎたりすると WYSIWYG の見た目が崩れることがあります。編集画面に新しく `::first-letter` を追加することも避けてください。エディターでは、すでに存在する `[data-nabi-dropcap-letter]` だけを装飾します。
