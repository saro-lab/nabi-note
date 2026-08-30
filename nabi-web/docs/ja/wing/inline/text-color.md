---
title: 文字色
description: 選択した文字に許可された色名を適用します。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 文字色

選択した文字に色名を適用します。保存される値は CSS の色文字列ではなく許可された名前で、実際の色は `--nabi-tc-<name>` CSS 変数で決めます。そのため、同じ文書でもライトテーマとダークテーマの両方で読みやすく調整できます。

<WingDemo path="/wing/inline/text-color" />

```ts
const selected = wings().use('tc', {
  values: ['green', 'coral', 'blue'],
}).build()
```

`values` を省略すると、基本パレットの `green`、`coral`、`violet`、`amber`、`blue` を使います。リストを減らすと、それ以外の色はコマンドでも読み込みでも受け付けません。

## CSS スタイル

文書には色名だけが保存されます。エディターと公開画面の実際の色は CSS 変数で決めます。

```css
.nabi-content { --nabi-tc-blue: #2563eb; }
```

文字色は背景色と一緒に調整し、コントラストを確認してください。ダークテーマでは、同じ色名に別の値を与えられます。

```css
.dark .article-body {
  --nabi-tc-blue: #93c5fd;
  --nabi-tc-green: #86efac;
}
```
