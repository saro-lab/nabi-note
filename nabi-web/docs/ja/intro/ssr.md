---
title: SSR サポート
description: 保存したものをサーバーであらかじめ描き、エディタ・ツールバーを hydrate で引き継ぎます。
---

# SSR サポート

## 保存したものだけを描く場所 — エディタは立てません

コメント一覧のように **表示するだけの場所** にはエディタは要りません。ドキュメントを
描くのに要るのは登録した翼の一覧(`registry`)ひとつだけなので、それだけを受け取る扉が
別にあります。

```ts
import { makeRegistry, defaultWings, renderStoredHtml, renderStoredEditorHtml } from 'nabi-note/ssr'

// サーバーが立つときに一度 — 保存したものがいくつあってもこれひとつを使い回します
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['コメント一行'] }]   // DB から読んだナビツリー

renderStoredHtml(saved, registry)        // '<p>コメント一行</p>'
renderStoredEditorHtml(saved, registry)  // '<p data-key="n0">コメント一行</p>'
```

**`nabi-note/ssr` は描くのに要るものだけが入った入口です。** 編集面(`surface`)と画面の
道具(`ui`)を一つのファイルも踏まないので(網が守ります)、サーバーの束に DOM のコードが
混ざり込むことがありません。同じ扉が `nabi-note` にもあるので、すでにエディタを載せた
ページはそちらをそのまま使えば済みます。

| | |
|---|---|
| `renderStoredHtml(json, registry, options?)` | 保存・公開する HTML — `getHtml()` と同じ値 |
| `renderStoredEditorHtml(json, registry, options?)` | エディタの HTML — `getEditorHtml()` と同じ値(`data-key` が付きます) |

- **どちらも DOM を使いません** — サーバーでそのまま動きます。
- **ナビツリーでなければ `null` です** — 拒否の規則は `setJson()` と同じです(ドキュメント
  全体が配列でなければなりません)。例外は投げません。
- **エディタが出す値と一文字も違いません。** 同じ手順(正規化 → 組み立て)を通るので、
  XSS が濾し取られる場所も同じです — 表示する側だけ洗いが甘くなることはありません。
- `options` は `{ allowLocalUrls }` ひとつです — `createNabiWith` のそのオプションと同じ
  意味です。

**同じ保存内容はいつも同じ `data-key` を得ます。** だからサーバーが `renderStoredEditorHtml`
でエディタをあらかじめ描いて送り、ブラウザで `hydrate` が引き継げば、画面を描き直しません。

```ts
mountSurface({ nabi, registry, root: surface, hydrate: true })
```

ずれていればその場で新しく描くので、サーバーとクライアントの翼の一覧さえ揃っていれば
済みます。

::: tip このサイトのホームがその見本です
ホームのデモのドキュメントは **ビルド時に `renderStoredEditorHtml` であらかじめ描いて**
ページに埋め込んだもので、エディタはその上で `hydrate` によって目覚めます。だから
エディタのコードが届く前でも文章はすでに読めます — 空の場所が急に埋まる区間がありません。
:::

---

## ツールバーもあらかじめ描けます

ボタンの行は **ドキュメントを見ません。** 登録した翼の一覧と言葉とグループの順番しか
見ないので、出てくる文字は **定数**です — サーバーが立つときに一度呼べば、その文字を
使い続けます。リクエストのたびに呼び直す必要はありません。

```ts
import { makeRegistry, defaultWings, renderToolbarHtml } from 'nabi-note/ssr'

const registry = makeRegistry(defaultWings)

const toolbarHtml = renderToolbarHtml({ registry, locale: 'ja' })
// '<div class="nabi-group" data-group="font">…</div>'
```

この文字をツールバーの器にそのまま入れて送れば、ブラウザでは `mountToolbar` が **同じ
関数**で描きます。すでに同じ行が立っていれば **描き直さず配線だけを掛けます。**

```ts
mountToolbar({ nabi, registry, surface, root: toolbar })
```

::: warning 器に `class="nabi-toolbar-row"` を一緒に書いてください
あらかじめ描いた行を送るときは **最初の一枚から** このクラスが必要です。コアはこの
クラスがなければ mount のときに自分で付けますが、そうすると左右の余白がそのとき付いて
**ボタンの行が横に一度ずれます。** ホストが先に書いておけば、コアはそれに触れません
(自分が付けたものだけを外します)。

```html
<div class="nabi-toolbar-row">あらかじめ描いた行</div>
```
:::

- **ずれても壊れません** — 立っている行がいまの翼の一覧と違えば、その場で新しく描き
  ます。失うのはあらかじめ描いた値だけで、画面はいつも正しくなります。
- **あらかじめ描いた行は「何も押されておらず何も隠れていない」状態です。** 押し込み
  (`aria-pressed`)と非表示はキャレットが決めるものなので、サーバーは知りません。
  キャレットによってボタンが隠れる構成なら、mount のあとにいくつか消えて行が
  詰め直されることがあります。
- **エディタを立てる場所にだけ入れてください。** 読むだけのページにはツールバーが
  ないので、この文字を受け取る理由がありません。

**プレビュー・全画面の二つのボタンも同じ道です。** その二つは翼ではなく蓋の部品なので、
上のツールバーの文字には入りません — 別に描いて `mountViewTools` が立つ器に入れます。

```ts
import { renderViewToolsHtml } from 'nabi-note/ssr'

renderViewToolsHtml({ locale: 'ja' })
// '<span class="nabi-tools">…</span>'
```

::: tip このサイトのホームがその見本です
ホームのデモのツールバーは **ビルド時に `renderToolbarHtml`・`renderViewToolsHtml` で
あらかじめ描いて** 埋め込んだもので、`mountToolbar`・`mountViewTools` はその行を見分けて
配線だけを掛けます。だからアイコン三十五個が遅れて埋まっていく区間がありません。
:::

---

## 次のドキュメント

- [{{ t('menu_intro_usage') }}](./usage) — npm で導入する道、組み立て・入力・出力の全体
- [{{ t('menu_intro_cdn') }}](./cdn) — ビルドツールなしで `<script>` ひとつで

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
