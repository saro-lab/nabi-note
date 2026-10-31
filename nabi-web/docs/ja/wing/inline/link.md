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

## URL の貼り付け

前後の空白を除いた貼り付け内容全体が有効な `http://` または `https://` の URL であれば、すぐにリンクとして挿入されます。文中の URL、複数の URL を含むテキスト、相対パスは従来の貼り付け処理に従います。コードブロックやリンク wing のないエディターではテキストのままになります。エディターからコピーした有効な内部クリップボードデータがある場合は、元の書式を保つためにそちらを優先します。

`mountSurface()` の `onPasteUrl` コールバックで、リンクの表示テキストを指定できます。

| 引数 | 値 |
| --- | --- |
| `url` | 前後の空白を除いた完全な URL |
| `isSameOrigin` | URL のプロトコル、ホスト、ポートが、エディターを含む文書のオリジンと一致するかどうか |
| `path` | `/` で始まるパス。クエリとフラグメントも含みます。例: `/posts/1?a=2#top` |

```ts
const surface = mountSurface({
  nabi,
  registry,
  root: document.querySelector<HTMLElement>('#editor')!,
  onPasteUrl(url, isSameOrigin, path) {
    if (isSameOrigin && path === '/guide') return 'NABI NOTE'
    return url
  },
})
```

空白以外の文字を含む文字列を返すと、その文字列が表示テキストになります。コールバックがない場合、空の値や文字列以外の値を返した場合、またはエラーが発生した場合は、貼り付けた URL がそのまま表示されます。返された文字列を HTML として解釈することはなく、リンク先も変わりません。

コールバックは `async` 関数や Promise にも対応します。応答を待つ間も URL リンクはすぐに挿入され、後から有効な結果が届くと、そのリンクの表示テキストだけが変わります。その間にリンクが編集・削除された場合、新しい文書が読み込まれた場合、または surface がアンマウントされた場合は、遅れて届いた結果を適用しません。

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
