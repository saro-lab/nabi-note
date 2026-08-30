---
title: リンク
description: 安全な Web アドレスをつなぎ、アップロード添付を表示します。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# リンク

文字を選択してアドレスをつなぎます。選択せずにアドレスを入力した場合は、アドレスそのものがリンク文字として挿入されます。`http://` または `https://` のアドレスを入力して Space または Enter を押してもリンクに変わります。

リンクには `http:`、`https:`、そして `.` または `/` で始まる同じサイト内のパスだけが保存されます。`javascript:` や `//example.com` のように出所をはっきり判断できないアドレスは拒否されます。アップロードで作られた添付リンクはファイル情報も一緒に保存され、通常のリンクのように手動で作ることはできません。

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

## CSS スタイル

通常のリンクは `.nabi-content a`、添付リンクは `.nabi-content a[data-nabi-file]` で分けて装飾できます。

```css
.article-body a:not([data-nabi-file]) {
  color: var(--nabi-accent);
  text-decoration-thickness: .08em;
  text-underline-offset: .16em;
}

.article-body a[data-nabi-file] {
  display: inline-flex;
  gap: .35em;
  padding: .25em .55em;
  background: var(--nabi-soft);
}
```

添付リンクの `::before` と `::after` はファイルアイコンと拡張子を表示するために使われるので、`content` を置き換えたり消したりしない方が安全です。
