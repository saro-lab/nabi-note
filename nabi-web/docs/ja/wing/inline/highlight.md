---
title: ハイライト
description: 選択した文字の背後に許可されたハイライト色を付けます。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# ハイライト

選択した文字の背後にハイライト色を付けます。保存データには任意の CSS 色ではなく、許可された色名だけが残るため、文書データと画面上の見た目を分けて扱えます。

<WingDemo path="/wing/inline/highlight" />

```ts
const selected = wings().use('hl', {
  values: ['yellow', 'green', 'cyan'],
}).build()
```

`values` を省略すると、`yellow`、`green`、`cyan`、`pink`、`purple`、`orange` を使います。リストを絞ると、登録していない色は読み込んだ文書でも維持されません。

## CSS スタイル

文書には色名だけが保存されます。エディターと公開画面の色は CSS 変数で変えます。

```css
.nabi-content { --nabi-hl-yellow: #fff0a6; }
```

複数の色をまとめて変えれば、文書内の色名はそのままに、サービスの雰囲気だけを調整できます。

```css
.article-body {
  --nabi-hl-yellow: #fff0a6;
  --nabi-hl-green: #c8f0d8;
  --nabi-hl-pink: #ffd6e5;
}
```
