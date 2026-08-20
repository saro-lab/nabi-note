---
title: スタイルを変える
description: 色・形は CSS 変数を上書きして変えます。
---

# スタイルを変える

シートは **ホストが掛けます** — バンドラを使うなら `import 'nabi-note/nabi.css'` の一行、
CDN なら `<link>` の一行です。そのあとは変数を上書きするだけで済みます。

コンポーネントの規則には **色リテラルが一文字もありません。** すべて `--nabi-*` 変数で
描かれているので、変数さえ上書きすれば残りが付いてきます。

```css
.nabi.nabi.nabi {
  --nabi-accent: #7c3aed;
}
```

クラスを三度重ねた理由は下の
[特異度に引っかからないように](#特異度に引っかからないように) にあります。

::: tip このドキュメントの大前提 — 保存値はひとりで立ちません
出ていく HTML(`getHtml()`)には **インラインの `style` が一文字もありません。** 保存値は
何であるかだけを属性で語り(`data-nabi-align="center"`)、どう見えるかはこのシートが
語ります。ですから保存した HTML を読む側で描くときも、**このシートが効いている
`.nabi-content` の中**でなければエディタと同じ姿にはなりません — 下の
[保存した HTML を外で描くとき](#保存した-html-を外で描くとき) を見てください。
:::

::: tip ダーク・ライトはすでに入っています
テーマのためにホストが上書きすべきトークンは **ありません。** コアのシートがライトの
既定値・`.dark` の再定義・明示的な `.light` の再定義の三つをすべて抱えてきます。この
サイトもエディタの中では、フォントのトークン四つ以外は何も上書きしていません。
:::

## 色・形のトークン

| トークン | 意味 | 既定値(ライト) |
|---|---|---|
| `--nabi-bg` · `--nabi-soft` | 背景・少し沈んだ面 | `#fff` · `rgb(0 0 0 / 4.5%)` |
| `--nabi-fg` · `--nabi-muted` · `--nabi-on-accent` | 文字・薄い文字・強調の上の文字 | `#1b1b1f` · `#6b6b76` · `#fff` |
| `--nabi-line` · `--nabi-accent` | 線・強調色 | `#e2e2e8` · `#3b6fe0` |
| `--nabi-danger` · `--nabi-on-danger` | 危険・その上の文字 | `#d93b3b` · `#fff` |
| `--nabi-shadow` · `--nabi-scrim` | 箱の影・プレビューの背景 | — |
| `--nabi-radius` · `--nabi-radius-sm` · `--nabi-radius-xs` | 角 | `6px` · `4px` · `3px` |
| `--nabi-layer-radius` | 層(パネル・プレビュー・ライトボックス)の角 | `.25rem` |
| `--nabi-z-sticky` | 貼り付く行の層番号 | `20` |
| `--nabi-grid-cell` | 表のサイズ格子のセルの大きさ | `1.125rem` |
| `--nabi-hl-yellow`·`green`·`cyan`·`pink`·`purple`·`orange` | 蛍光ペンの六色 | 半透明の色 |
| `--nabi-tc-green`·`coral`·`violet`·`amber`·`blue` | 文字色の五色 | 濃い色 |

この表はコアのシート(`nabi.css`)が **直接宣言している** ものだけを収めました。宣言の
場所は `.nabi` ひとつではなく三つです —
`:is(.nabi, .nabi-scrim, .nabi-content:where(:not(.nabi *)))`。プレビューのオーバーレイは
`body` の子なので `.nabi` からの継承が届かず、エディタの外にひとりで立った
`.nabi-content` もトークンを直接受け取らなければならないからです。

同じ一覧が三揃い(ライトの既定値・`.dark`・明示的な `.light`)書かれています。**上書きする
側は三揃いすべてを見る必要はありません** — 特異度さえ勝てば、一度上書きした値が三つの
場合すべてに効きます。ただしダークで別の値を使いたければ、`.dark` の条件を自分で付ける
必要があります。

## 値を持たず参照だけするトークン

以下はコアが **宣言せず参照だけする** 変数です。ホストが値を渡さなければ括弧の中の
フォールバックが立ちます。宣言された場所がないので **`:root` に書いてもそのまま効きます**
— 上の色・形のトークンと分かれる地点がここです(あちらは `.nabi` に宣言されているので
継承では勝てません)。

| トークン | 意味 | フォールバック |
|---|---|---|
| `--nabi-font` · `--nabi-font-serif` · `--nabi-font-mono` · `--nabi-font-cursive` | 書体の翼の四つの枝に実際に噛ませるフォント | システムフォント |
| `--nabi-cursive-adjust` | 筆記体の `font-size-adjust`。手書きの顔立ちは x ハイトが低く、同じ px でも小さく見えるので、この値が x ハイト基準で測り直します | `0.4` |
| `--nabi-sticky-top` | 貼り付く行がどれだけ下がって座るか。サイトに固定のヘッダがあればその高さ | `0px` |
| `--nabi-preview-width` | プレビューカードの幅。**`openPreview` が開くときに編集領域の幅を測ってカードへ直接書き込むため**、ホストが外から上書きしてもそのインライン値が勝ちます | `720px` |

`--nabi-typeface-base` はこの分類ではありません — **コアが宣言します**(既定は
`--nabi-font` に従います)。書体の翼にはこの値を決めるオプションがないので、変えたければ
このトークンを上書きしてください。

`--nabi-keyboard-top` · `--nabi-keyboard-bottom` も同じ場所に立ちますが、これは **コアが
使います** — `mountSticky()` がモバイルのキーボードが画面を押し上げた分を測ってここに
書き込み、貼り付く行と全画面がその値を読みます。手で書く値ではありません。

## トークンのない場所 — 規則を上書きします

以下の三つは **変数がありません。** コアが規則に値を打ち込んでいるので、変えるにはその
セレクタを上書きします。

**文字サイズ四段階** — `em` なので親のサイズに従います。

```css
.nabi-content [data-nabi-size="xs"] { font-size: .75em; }
.nabi-content [data-nabi-size="sm"] { font-size: .875em; }
.nabi-content [data-nabi-size="lg"] { font-size: 1.25em; }
.nabi-content [data-nabi-size="xl"] { font-size: 1.5em; }
```

**ドロップキャップの大きさ** — 何行を包むかを決める値ではなく文字サイズひとつです。
実際に何行を覆うかはその段落の行間が決めます。

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 5.9em; line-height: .83; }
```

**コードトークンの色** — code の翼のシートが `[data-nabi-token]` に色を直接書きます。
いま色が付く種類は **五つ**です。

```css
.nabi-content [data-nabi-token="comment"] { color: #7a8a7a; font-style: italic; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="number"] { color: #2f6fd0; }
.nabi-content [data-nabi-token="literal"] { color: #2f8f4e; }
```

ハイライタが返す `type` は自由な文字列です — 上の五つ以外の名前を返すと色なしで描かれる
ので、使いたい種類はホストが同じ形で規則を足せば済みます。ダークで別の色を使うには
`.dark` の条件を自分で付けてください — コアはこの五つにダークの変種を付けていません。

アップロードの翼の進捗アニメーション(`--nabi-per`·`--nabi-t`·`--nabi-span`·
`--nabi-clear`·`--nabi-blur-max`)は **翼の内部実装用**です — 名前が `--nabi-` で始まり
ますが、ホストが上書きするために開けた場所ではありません。

---

## 外側の寸法は `rem` です

ボタン・余白・ツールバーのチップをはじめとする外側の寸法はほとんどが `rem` なので、
**ルート(`html`)の文字サイズに従って伸びます。** ユーザーがブラウザや OS で文字を
大きくすれば、エディタの枠も一緒に大きくなります。大きさを変えたければルートの
`font-size` を変えてください。線(`border`)は大きさではなく **線**なので、`px` のまま
残っている場所もあります。

---

## 特異度に引っかからないように

色・形のトークンを上書きするには **クラスを三つ**重ねてください。

```css
.nabi.nabi.nabi,
.nabi-scrim.nabi-scrim.nabi-scrim {
  --nabi-accent: var(--my-accent);
}
```

数えてみるとこうです。ライトの既定値の規則 `:is(.nabi, …)` は `:is()` が引数の中で
最も高いものに従うので **(0,1,0)**、ダークの規則 `:where(html, body).dark :is(.nabi, …)`
は `:where()` が 0 で、`.dark` と `:is()` がそれぞれクラスひとつずつなので **(0,2,0)**
です。ですから `.nabi.nabi` ではダークと **引き分けます** — 引き分ければ後に載った側が
勝ち、コアのシートがホストのシートより後に載ることもあります。三つ重ねて (0,3,0) まで
上げれば順序に頼らずに済みます。

プレビューのオーバーレイは `.nabi` の外(`body` の子)に立つので、そちらのセレクタも
一緒に書かなければ同じ色になりません。

**フォントのようにコアが宣言しないトークンは、この取っ組み合いが要りません** — 宣言
された場所がなく継承だけで届くので、`:root` の一行で済みます。

```css
:root {
  --nabi-font: 'Noto Sans', system-ui, sans-serif;
}
```

---

## ライト・ダーク

`html` か `body` の **どちらか一方**に `dark` クラスがあればダーク、`light` ならライト
です。クラスがなければライトが既定で、両方あれば明示的な `light` が勝ちます(`.light` の
規則が `.dark` の規則の後に載っています)。

```html
<html class="dark"><!-- または <body class="dark"> --></html>
```

クラスをトグルすれば CSS が反応します。呼ぶ API はありません。テーマが差し替えるのは
色の変数だけで、コンポーネントの規則はそのままです — 自分で作ったスタイルも
`--nabi-*` 変数だけを使えばダークに付いてきます。

---

## シートを掛ける二つの道

**① ファイル一つ** — もっとも一般的な道です。すべての翼の CSS が入っています。

```ts
import 'nabi-note/nabi.css'
```

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note/dist/nabi.css">
```

**② 登録したものだけ注入** — 実際に有効にした翼のシートだけを載せたいときです。

```ts
import { collectSheets, injectSheets } from 'nabi-note'

const drop = injectSheets(document, collectSheets(registry))
// drop() を呼ぶと、この呼び出しが入れたものだけが取り除かれます
```

同じ文書のシートは **一度だけ**入ります — たたむ鍵がシートの **内容**なので、ひとつの
文書にエディタを複数立てても積み上がらず、異なる翼の構成が混ざっても合併集合ひとつに
まとまります。

:::: tip 二つの違い — 何が載るか、いつ効くか
**何が載るか。** ファイルはどの翼を登録したのか知りようがないので **すべて**を載せます。
注入は `registry` を見て **登録したものだけ**を載せます。保存された HTML を表示するだけの
ページはエディタがなく `registry` もないので、ファイルの方を使います。

**いつ効くか。** ファイルは `<link>` として head に入り、読み込みが終わるまで **描画を
止めます。** 注入は **エディタの JavaScript が届いたあとにしか** 効きません。だから
ドキュメントをサーバーであらかじめ描いて送るページはファイルの方を使うべきです —
注入で掛けると、サーバーが送ったドキュメントがまず素の姿で一度描かれ、そのあとシートが
乗って見た目と配置が組み直されます。
::::

登録した wing のシートはコアのシートの **後に**入るので、同じ優先順位では wing が
勝ちます。

---

## 掛けられる場所

変数でどうにもならないものは、実際に存在するクラスを直接狙います。

| セレクタ | 何 | 誰が付けますか |
|---|---|---|
| `.nabi` | エディタ全体(クローム + 編集領域)を包む殻。色・形のトークンがここに掛かります | ホスト |
| `.nabi-content[contenteditable]` | 編集領域そのもの | ホスト |
| `.nabi-toolbar` | ツールバー行 + 状況行を包む場所。このクラスがすなわち「上に貼り付く」です | ホスト |
| `.nabi-toolbar-row` | ツールバーが収まる器 | `mountToolbar()` |
| `.nabi-context` | 状況行が収まる器 | `mountContextToolbar()` |
| `.nabi-tools` | プレビュー・全画面の二つのボタンの場所 — コアが右上に浮かせます | `mountViewTools()` |
| `.nabi-tool` | その二つのボタンそのもの | `mountViewTools()` |
| `.tb-group` | ツールバーのボタンのまとまり | `mountToolbar()` |
| `.ctb-group` · `.ctb-button` · `.ctb-swatch` · `.ctb-input` | 状況行のまとまり・ボタン・色見本・文字の欄 | `mountContextToolbar()` |
| `.tb-picker` · `.tb-picker-grid` · `.tb-picker-cell` | 表のサイズ格子などボタンの下に現れる箱 | `mountToolbar()` |
| `.tb-prompt` · `.tb-prompt-input` | 新しく入れるときに現れるリンク先入力のレイヤー | `mountToolbar()` |
| `.nabi-hints [data-hint]` | Shift の二度押しで現れるショートカットのバッジ — バッジは `::before`、名札は `::after` なので二つが一緒に見えます | `mountHints()` |
| `[data-nabi-tip]` | 名札(tooltip) — CSS の `::after` だけで描きます | コア全般 |
| `.nabi-content.nabi-dropping` | ファイルを引きずってきている間の編集領域。案内の文字は `data-nabi-drop` 属性に載ります | `mountUpload()` |

プレビュー・全画面も **コアが作ります。**

| セレクタ | 何 | 誰が |
|---|---|---|
| `.nabi-scrim` > `.nabi-card` > (`.nabi-close` · `.nabi-content.nabi-preview-body`) | ドキュメントのプレビューのオーバーレイ | `openPreview()` |
| `.nabi-scrim` > `.nabi-card.nabi-lightbox` | 絵をひとつだけ大きく見る箱 | `openImageLightbox()` |
| `.nabi.is-fullscreen` | 全画面 — `.nabi` の箱を画面に固定します | `setFullscreen()` (クラス名は `FULLSCREEN_CLASS`) |

`mountViewTools()` を付ければ、二つのボタンが自分でこれらを開いたり閉じたりします。
自分で開きたければ `openPreview({ nabi, editor })` ·
`openImageLightbox({ editor, src, alt?, locale })` · `setFullscreen(root, on)` ·
`isFullscreen(root)` を呼んでください。

::: tip 道具の場所は自分で立ちます
`mountViewTools` が `.nabi-tools` の箱を自分で作り、受け取った器の先頭に入れます。ホストが
`<span>` をツールバーより前に置いておく必要はありません — 場所をあらかじめ作っておくと
むしろ箱が二つになります。
:::

編集画面専用の印も狙えます — `[data-nabi-token]`(コードブロックのトークンの色)、
`[data-nabi-lang]`(コードブロックの言語)、`[data-color]`(蛍光ペン・文字色 —
`<mark>`・`<span>` タグで区別)、
`data-nabi-align`·`data-nabi-typeface`·`data-nabi-size`·`data-nabi-dropcap`(段落の属性)。
これらの印の実際の名前は、各 wing ファイルの `*_ATTR` 定数が正本です。

---

## 保存した HTML を外で描くとき

出ていく値(`getHtml()`)は `data-nabi-*` 属性が残った HTML で、**インラインの `style`
は一文字もありません。** 姿はすべてシートの担当だという意味であり、だからシートなしで
描くと揃えも文字サイズも表の線もない裸の HTML になります。

エディタと同じ姿に描くには `.nabi-content` で包んでください — このクラスは `.nabi` で
包まなくても色・形のトークンを直接受け取ります(`nabi.css` の
`.nabi-content:where(:not(.nabi *))` の規則)。

```html
<div class="nabi-content">保存した HTML</div>
```

シートは上の「シートを掛ける二つの道」で見たとおりに掛ければ済みます — バンドラなら
`import 'nabi-note/nabi.css'`、それ以外なら `<link>` ひとつです。エディタを立てない
ページでも `.nabi-content` さえあれば、コアのシートがトークンを宣言してくれます。

### 読む側で回る動作 — 表の並べ替え

いまは **表の並べ替えひとつ**だけが読む側専用の関数として出ています。任意の wing が
それぞれ読む側の動作を付ける汎用の仕組みはまだありません。

```ts
import { attachTableSort } from 'nabi-note/viewer'

const detach = attachTableSort(document.querySelector('#article')!, { locale: 'ja' })
```

`data-nabi-sortable` が付いた表を探し、見出しのセルに並べ替えボタンを付けます。解除の
関数(`detach`)が挿したボタンと入れ替えた行の順序を戻します。

::: danger 編集対象の要素には付けないでください
`attachTableSort()` は DOM にボタンを挿し、行の順序を変えます。付いている間の DOM を
保存すると、それが値に固まります — 読む側は読み取り専用の複製にだけ付けてください。
:::

---

## 次のドキュメント

- [{{ t('menu_wing_custom') }}](../wing/custom) — ない書式を自分で作る
- [{{ t('menu_intro_index') }}](../intro) — このドキュメントが使う言葉

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'
const { t } = useTranslate()
</script>
