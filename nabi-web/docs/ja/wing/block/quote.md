---
title: 引用
description: 引用文や別の文脈を複数の段落でまとめます。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# 引用

引用文や別の文脈を複数の段落でまとめます。空の段落で `>` に続けて Space を入力するか、選択した段落をツールバーから引用に切り替えます。

引用の中には通常の段落だけでなく、リストや画像のようなブロックも入れられます。同じ範囲をもう一度切り替えると、外側の段落に戻ります。

<WingDemo path="/wing/block/quote" />

```ts
const selected = wings().use('quote').build()
```

## CSS スタイル

引用は `.nabi-content blockquote` で枠線や余白を変えられます。

```css
.article-body blockquote {
  margin-inline: 0;
  padding: .25rem 1rem;
  border-inline-start: 4px solid var(--nabi-accent);
  color: var(--nabi-muted);
  background: color-mix(in srgb, var(--nabi-soft) 72%, transparent);
}
```

`blockquote` 内の段落構造はそのままにして、外側の余白、枠線、色のような表現だけを変えてください。
