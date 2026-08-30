---
title: 書式を消す
description: 選択範囲の文字書式と段落書式を取り除きます。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 書式を消す

選択範囲の文字書式をまとめて取り除きます。太字、色、書体など登録済みの基本 mark と、見出し、配置、ドロップキャップなどの段落属性が対象です。Esc を素早く 2 回押しても同じ動作を実行できます。

リスト、表、引用、画像のような文書構造をプレーンテキストに変えることはありません。画像や動画の外側の配置、アップロードで作られた添付リンクもそのまま残ります。

<WingDemo path="/wing/etc/clear-format" />

```ts
const selected = wings()
  .use('b')
  .use('i')
  .use('clearFormat')
  .build()
```

消したい書式の wing も一緒に選んでおく必要があります。そうしないと、その書式を消すことはできません。
