---
title: コード
---

# コード

## 説明

`codeWing`(名前 `code`)はコードブロック(`<pre>`)を所有する **定数**です — 括弧を
付けて呼びません。

`holds: 'inline'` の器で、中は `repair` が平文に押さえておきます — マークや他の翼が
割り込めません。そういう欄が契約に別にあるのではなく、翼が自分の中身を自ら整えて
いるだけです。

空の行で ` ``` ` を打ってスペースか Enter を押すとコードブロックになります —
` ```ts ` のように言語を続けて書けば、その言語も一緒に取り込まれます。`Tab`/
`Shift+Tab` で行をインデント・アウトデントします(複数行を選べば一度に)。Enter は
前の行のインデントを引き継ぎます。

キャレットがコードの中にあるときだけ状況行が出ます — 言語を直接打ち込む入力欄、
「言語なし」、そしてよく使う言語の欄です。

```
javascript typescript jsx tsx · python java kotlin swift
c cpp csharp go rust · php ruby sql
html xml css scss · json yaml toml markdown
bash powershell dockerfile diff
```

この一覧は **近道**にすぎません — コアが知っている言語の一覧ではありません。ここに
ない言語は最初の欄に直接打ち込めばよく、その値はハイライターにそのまま渡ります。

## 色付けは翼に差し込みます

`highlight` は **色ではなく種類を返すフック**です — `(ソース, 言語) =>
{text, type?}[]` の形で、`type` は `keyword`・`string`・`number`・`comment`・
`function`・`class`・`variable`・`operator`・`punctuation`・`tag`・`attribute`・
`literal`・`regexp`・`meta` の十四のうちのひとつに固定されています(`CODE_TOKEN_TYPES`)。

色はコアのシートが `[data-nabi-token="…"]` セレクタで直接決めます — **五つだけ色が
あります**(`comment`・`string`・`keyword`・`number`・`literal`)。残りの種類は印だけが
付いて色の規則がなく、本文の色のまま出ます。値が CSS 変数ではなく固定色なので、別の色
やダークのバリエーションを使うにはそのセレクタを直接上書きします。

```css
.dark .nabi-content [data-nabi-token="keyword"] { color: #c9a0ff; }
```

文法辞書そのものはパッケージにありません — Prism・highlight.js・Shiki のようなものを
自分で繋ぐ必要があります。

色を塗る側は **翼に差し込みます** — 別に mount しません。`makeCodeAttach` で
`attach` を作りコードの翼に差し替えると、`mountSurface` がそれを付けます。このサイト
のデモは Shiki をそうやって繋いだ例です(`.vitepress/src/highlight.ts`)。

```ts
import { codeWing, makeCodeAttach } from 'nabi-note'

// 翼は定数です — 付随処理(`attach`)だけを差し替えます
const wing = { ...codeWing, attach: makeCodeAttach({ highlight }) }
```

`version` を一緒に渡すと **文書はそのままなのに塗る側が変わったとき**に塗り直します。
文法を非同期で取ってくるハイライター(Shiki は言語に初めて出会うとそうです)がその
場合です — 文法が届いても文書は変わっていないので `onChange` が鳴らず、これがないと
何か文字をもう一つ打たないと色が入りません。

```ts
let grammarAge = 0
const wing = {
  ...codeWing,
  attach: makeCodeAttach({ highlight, version: () => grammarAge }),
}
// 文法が遅れて届いたとき — 数を上げれば塗り直します
grammarAge += 1
```

保存値は外の慣例に従います — `<pre data-nabi-lang="ts"><code class="language-ts">`
であり、色は `data-nabi-token` 属性として出ます(インライン `style` ではありません)。

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, codeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翼の一覧がグリフの知識・コマンド・組み立て器を一緒に作る — それが `registry` です
const { nabi, registry } = createNabiWith([codeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## デモ

<WingDemo path="/wing/block/code" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
