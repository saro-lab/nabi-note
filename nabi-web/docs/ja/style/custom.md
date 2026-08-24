---
title: スタイルを変える
description: CSS 変数を使って NABI NOTE の色・フォント・余白などのスタイルをカスタマイズする方法を説明します。
---

# スタイルを変える

シートは **ホストアプリケーションが自分で掛けます。** バンドラ環境なら `import 'nabi-note/nabi.css'` の一行、CDN 環境なら `<link>` タグです。そのあとは必要な CSS 変数だけを上書きすれば、エディタ全体のテーマが一貫して変わります。

NABI NOTE のすべての UI コンポーネントは **色のリテラルを一つも書かず、`--nabi-*` CSS 変数だけでスタイリング**されているので、変数を上書きするだけで簡単にブランディングを合わせられます。

```css
.nabi.nabi.nabi {
  --nabi-accent: #7c3aed;
}
```

クラスセレクタを三度重ねた理由は下の
[CSS 特異度ガイド](#css-特異度specificity-ガイド) を参照してください。

::: tip 保存された HTML にインラインスタイルは含まれません
エディタが出力する HTML(`getHtml()`)には **インラインの `style` 属性が含まれません。** HTML マークアップは意味構造と属性(`data-nabi-align="center"` など)だけを表し、見た目はこのシートが担います。だから保存した HTML を外部ページで描くときも、**`nabi.css` が効いている `.nabi-content` コンテナの中**に置かないと、エディタと同じ見た目にはなりません。

詳しくは下の[保存した HTML を外で描くとき](#保存した-html-を外で描くとき)を参照してください。
:::

::: tip ライト・ダークのテーマは最初から入っています
既定のテーマのためにホストが追加の変数を定義する必要はありません。コアのシートにライトの既定値・`.dark` テーマ・明示的な `.light` テーマの三つがすべて入っています。
:::

## 色・テーマのトークン

| トークン | 意味 | 既定値(ライト) |
|---|---|---|
| `--nabi-bg` · `--nabi-soft` | 背景・少し沈んだ面 | `#fff` · `rgb(0 0 0 / 4.5%)` |
| `--nabi-fg` · `--nabi-muted` · `--nabi-on-accent` | 文字・薄い文字・強調の上の文字 | `#1b1b1f` · `#6b6b76` · `#fff` |
| `--nabi-line` · `--nabi-accent` | 線・メインの強調色(フォーカス/アクティブ) | `#e2e2e8` · `#3b6fe0` |
| `--nabi-danger` · `--nabi-on-danger` | 危険・その上の文字 | `#d93b3b` · `#fff` |
| `--nabi-shadow` · `--nabi-scrim` | ドロップダウンの影・モーダル/プレビューの暗い背景 | — |
| `--nabi-radius` · `--nabi-radius-sm` · `--nabi-radius-xs` | 角(既定・小・最小) | `6px` · `4px` · `3px` |
| `--nabi-layer-radius` | 層(パネル・プレビュー・ライトボックス)の角 | `.25rem` |
| `--nabi-z-sticky` | 貼り付く行の層番号 | `20` |
| `--nabi-grid-cell` | 表のサイズ格子のセルの大きさ | `1.125rem` |
| `--nabi-hl-yellow`·`green`·`cyan`·`pink`·`purple`·`orange` | 蛍光ペンの六色 | 半透明の色 |
| `--nabi-tc-green`·`coral`·`violet`·`amber`·`blue` | 文字色の五色 | 濃い色 |

上の表の変数はコアのシート(`nabi.css`)が **直接宣言している** トークンです。宣言先は `.nabi` だけでなく、単独レンダリングのために `:is(.nabi, .nabi-scrim, .nabi-content:where(:not(.nabi *)))` の三つのセレクタに紐づいています。

## 値を持たず参照だけするトークン(:root に書けます)

以下はコアのシートが **直接宣言せず、`var(--変数, フォールバック)` の形で参照だけする** トークンです。ホストが値を渡さなければ指定のフォールバックが立ちます。コアのレベルで宣言されていないので、**`:root` に書けばそのままグローバルに効きます。**

| トークン | 意味 | 既定のフォールバック |
|---|---|---|
| `--nabi-font` · `--nabi-font-serif` · `--nabi-font-mono` · `--nabi-font-cursive` | エディタと書体の翼の各枝に実際に噛ませるフォント | システムフォント |
| `--nabi-cursive-adjust` | 手書き体の `font-size-adjust` の比率 | `0.4` |
| `--nabi-sticky-top` | 貼り付くツールバーの上のオフセット(固定ヘッダの高さに設定) | `0px` |
| `--nabi-preview-width` | プレビューカードの既定の幅 | `720px` |
| `--nabi-placeholder` | 空のエディタに出す案内文 | なし |
| `--nabi-placeholder-color` | 案内文の色(指定しなければテーマ別のフォールバック色) | `--nabi-placeholder-color-fallback` |
| `--nabi-content-min-height` | 空のエディタの編集領域の最小高さ(編集面 `.nabi-editing` にのみ適用) | `12.5rem` |
| `--nabi-touch-font-size` | タッチデバイス(`pointer: coarse` または幅 40rem 以下)でのフォーム入力(`.nabi-input`)の文字サイズ(iOS Safari の自動拡大を防止) | `16px` |

`--nabi-typeface-base` は参照専用ではなく **コアが直接宣言する** トークンです(既定では `--nabi-font` を参照します)。既定フォントを変えるときは `--nabi-font` を上書きしてください。

`--nabi-keyboard-top` と `--nabi-keyboard-bottom` は **`mountSticky()` がモバイルキーボードの高さを測って動的に書き込む** 内部変数です。

`--nabi-bar-height` も同じく **`mountSticky()` が実際のツールバーの高さを測って書き込む** 内部変数です。`.nabi-content > *` 要素がスクロール時にツールバーの下へ隠れないよう、`scroll-margin-block-start` にこの値を使います。

## トークンのない場所 — 規則を上書きします

以下の三つの項目は CSS 変数ではなく固定の CSS 規則で定義されているので、変えるには該当のクラスセレクタを直接上書きします。

**文字サイズ四段階**(`em` なので親のサイズに従います)：

```css
.nabi-content [data-nabi-size="xs"] { font-size: .75em; }
.nabi-content [data-nabi-size="sm"] { font-size: .875em; }
.nabi-content [data-nabi-size="lg"] { font-size: 1.25em; }
.nabi-content [data-nabi-size="xl"] { font-size: 1.5em; }
```

**ドロップキャップの一文字目の大きさ**：

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 5.9em; line-height: .83; }
```

**コードブロックのトークンの色**：

```css
.nabi-content [data-nabi-token="comment"] { color: #7a8a7a; font-style: italic; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="number"] { color: #2f6fd0; }
.nabi-content [data-nabi-token="literal"] { color: #2f8f4e; }
```

---

## 単位の規格

ボタンの大きさ・余白・ツールバーの高さなど、ほとんどの UI の寸法は `rem` で定義されているので、**ルート(`html`)のフォントサイズ設定に比例して大きさが変わります。** ユーザーがブラウザや OS の既定の文字サイズを拡大すれば、エディタの UI も自然に一緒に大きくなります。

---

## CSS 特異度(Specificity)ガイド

コアが宣言しているテーマの色変数を上書きするときは、スタイルの優先度を確実に上げるために **クラスを三つ重ねる** 方法を勧めます。

```css
.nabi.nabi.nabi,
.nabi-scrim.nabi-scrim.nabi-scrim {
  --nabi-accent: #7c3aed;
}
```

- ライトの既定規則 `:is(.nabi, …)` の特異度は **(0, 1, 0)** です。
- ダークモードの規則 `:where(html, body).dark :is(.nabi, …)` の特異度は **(0, 2, 0)** です。
- なので `.nabi.nabi.nabi` のようにクラスを三つ重ねれば **(0, 3, 0)** の特異度を確保でき、CSS の読み込み順序に関係なく常に安定して上書きできます。

プレビューのモーダルは `body` の直接の子としてマウントされるので、`.nabi-scrim.nabi-scrim.nabi-scrim` セレクタも一緒に指定しないと同じテーマの色が効きません。
フォントのトークンのようにコアが宣言しない参照専用のトークンは、`:root` に一度だけ宣言すればそのまま効きます。

---

## ライト / ダークテーマ

`html` または `body` 要素に `dark` クラスがあればダークテーマ、`light` クラスがあればライトテーマが効きます。クラスがなければ既定のライトテーマで動き、両方のクラスがあるときは明示的な `light` クラスが優先されます。

```html
<html class="dark"><!-- または <body class="dark"> --></html>
```

テーマの切り替えはクラスのトグルだけで即座に反応し、別に呼ぶべき JavaScript API はありません。カスタムスタイルを書くときも `--nabi-*` 変数を使えば、テーマ切り替え時に色が自動で連動します。

---

## シートを掛ける方法

**1. CSS ファイルを丸ごとインポート**(もっとも一般的で推奨される方法)

```ts
import 'nabi-note/nabi.css'
```

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note/dist/nabi.css">
```

**2. 登録した翼のスタイルだけを動的に注入**

```ts
import { collectSheets, injectSheets } from 'nabi-note'

const drop = injectSheets(document, collectSheets(registry))
// drop() を呼ぶと注入したスタイルが DOM から取り除かれます
```

同じ内容のシートは重複して注入されず、単一のタグで管理されます。
サーバーサイドレンダリング(SSR)の環境では、クライアントの JS が動く前のスタイルのちらつき(FOUC)を防ぐために、静的な CSS ファイルを読み込む方式を使うのがよいでしょう。

---

## カスタマイズできる CSS クラスと UI 要素

| セレクタ | 説明 | 作る主体 |
|---|---|---|
| `.nabi` | エディタ全体(ツールバー+編集領域)を包む最上位コンテナ | ホスト |
| `.nabi-content[contenteditable]` | 実際の本文の編集領域 | ホスト |
| `.nabi-toolbar` | ツールバーとコンテキストバーを包む固定ヘッダコンテナ | ホスト |
| `.nabi-toolbar-row` | メインツールバーのボタン行 | `mountToolbar()` |
| `.nabi-context` | 動的なコンテキストツールバーのコンテナ | `mountContextToolbar()` |
| `.nabi-tools` | プレビューと全画面ボタンのラッパー | `mountViewTools()` |
| `.nabi-hints [data-hint]` | Shift を連打したときに出る短縮キーの案内バッジ | `mountHints()` |
| `[data-nabi-tip]` | ボタンのツールチップ(CSS `::after` で描画) | コアのコンポーネント |
| `.nabi-content.nabi-dropping` | ファイルをドラッグしている間の編集領域 | `mountUpload()` |

### モーダルとポップアップ要素

| セレクタ | 説明 | 作る関数 |
|---|---|---|
| `.nabi-scrim` > `.nabi-card` > `.nabi-content.nabi-preview-body` | ドキュメントのプレビューモーダル | `openPreview()` |
| `.nabi-scrim` > `.nabi-card.nabi-lightbox` | 画像のライトボックスポップアップ | `openLightbox()` |
| `.nabi-scrim` > `.nabi-card.nabi-choose` | 貼り付け形式の選択ポップアップ | `openChoosePanel()` |
| `.nabi-scrim` > `.nabi-card.nabi-save` | ファイル保存ポップアップ(ファイル名入力と形式選択) | `openSavePanel()` |
| `.nabi.is-fullscreen` | エディタの全画面モードが有効なときのクラス | `setFullscreen()` |

---

## 保存した HTML を外で描くとき

`getHtml()` で取り出した HTML 文字列は、インラインの `style` を持たず、意味を表すマークアップと `data-nabi-*` 属性だけでできています。
外部ページでエディタと同じ見た目で描くには、本文を `.nabi-content` クラスで包み、`nabi.css` を読み込みます。

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note/dist/nabi.css">

<div class="nabi-content">
  <!-- nabi.getHtml() で保存した HTML の本文 -->
</div>
```

`.nabi` で包まなくても `.nabi-content` 自体にテーマとフォントのトークンが効くので、エディタで見ていたスタイルをそのまま再現できます。

### 読む側専用の表の並べ替えを有効にする

発行した HTML ページで表の列の並べ替え機能を有効にするには、`attachTableSort` 関数をつなぎます。

```ts
import { attachTableSort } from 'nabi-note/viewer'

const detach = attachTableSort(document.querySelector('#article')!, { locale: 'ja' })
```

`data-nabi-sortable` 属性を持つ表を見つけて、見出しのセルに並べ替えボタンを付けます。返ってくる `detach()` 関数を呼ぶと、付けたボタンが取り除かれ、元の行の順序に戻ります。

::: warning 編集中の DOM に attachTableSort を使わないでください
`attachTableSort()` は DOM の構造を直接操作するので、編集中のエディタ領域に使うと、並べ替えボタンの UI が文書の本文に永久に保存されてしまうことがあります。必ず読み取り専用のビューア画面だけで使ってください。
:::

---

## 次のドキュメント

- [{{ t('menu_wing_custom') }}](../wing/custom) — 新しいカスタム書式の翼を自分で作る
- [{{ t('menu_intro_index') }}](../intro) — NABI NOTE の紹介とアーキテクチャ

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'
const { t } = useTranslate()
</script>
