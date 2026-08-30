---
title: 文字サイズ
description: 許可された段階の中で文字サイズを変えます。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 文字サイズ

選択した文字のサイズ段階を変えます。範囲を選択している場合はその範囲に適用され、キャレットだけがある場合は現在の段落の文字サイズを変えます。保存データには `px` のような任意値ではなく、許可された段階だけが残ります。

<WingDemo path="/wing/etc/font-size" />

```ts
const selected = wings().use('fs', {
  values: ['sm', 'lg', 'xl'],
}).build()
```

`values` を省略すると、`xs`、`sm`、`lg`、`xl` の段階を使います。リストを絞ると、以前の文書に入っていた別の段階も読み込み時に削除されます。

## CSS スタイル

サイズは `.nabi-content [data-nabi-size="xs"]` のように、保存された段階のセレクターで変えられます。文書にない任意の段階を作らず、登録した `values` の中だけで CSS を調整してください。

```css
.article-body [data-nabi-size="xs"] { font-size: .78em; }
.article-body [data-nabi-size="sm"] { font-size: .9em; }
.article-body [data-nabi-size="lg"] { font-size: 1.3em; }
.article-body [data-nabi-size="xl"] { font-size: 1.65em; }
```

段階ごとのサイズ差を一定にしておくと、作成者がエディターで選んだ意味が公開画面でも保たれます。
