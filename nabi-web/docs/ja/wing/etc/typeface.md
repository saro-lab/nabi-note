---
title: 書体
description: 選択した文字または段落に書体ファミリーを適用します。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 書体

選択した文字に書体ファミリーを適用します。範囲を選択している場合はその範囲だけを変え、キャレットだけがある場合は現在の段落の文字に適用します。実際のフォントファイルと `font-family` はサービス側の CSS が決めます。

基本ファミリーは `sans`、`serif`、`mono`、`cursive` です。特に日本語を含む多言語サービスでは、各ファミリーにどのフォントを結び付けるかをあらかじめ決めておくのがよいです。

<WingDemo path="/wing/etc/typeface" />

```ts
const selected = wings().use('tf', {
  values: ['sans', 'serif', 'mono'],
}).build()
```

`values` を省略すると、基本ファミリーをすべて使います。`values` に入れた値だけが文書で許可されます。

## CSS スタイル

文書にはファミリー名だけが保存され、フォントファイルは CSS が決めます。エディターと公開画面の同じコンテナーで変数を変更してください。

```css
.nabi-content {
  --nabi-font-serif: "Noto Serif", "Noto Serif JP", serif;
  --nabi-font-mono: "JetBrains Mono", monospace;
}
```

Web フォントを使う場合は、そのフォントファイルも先に読み込む必要があります。`cursive` は多くの言語で十分な対応フォントがないことが多いため、サービスで実際に使うフォントを指定してから提供するのがよいです。
