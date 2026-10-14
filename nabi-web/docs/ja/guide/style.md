---
title: CSS テーマ
description: CSS 変数でエディターと公開コンテンツの色、フォント、サイズ、ダークモードを設定します。
---

# CSS テーマ

NABI NOTE は編集画面と公開コンテンツで同じ CSS を使います。パッケージのスタイルシートを一度読み込み、サービスのコンテナー上で必要な変数だけを上書きします。

```ts
import 'nabi-note/nabi.css'
```

```css
.article-editor {
  --nabi-fg: #202124;
  --nabi-bg: #fff;
  --nabi-accent: #5b4ee8;
  --nabi-content-min-height: 20rem;
  --nabi-font: Pretendard, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

編集画面の `.nabi` と公開画面の `.nabi-content` に同じテーマクラスを指定すると、両方に同じ変数を適用できます。パッケージの CSS の後にサービスの CSS を読み込み、現在のテーマを `data-nabi-theme` で指定します。

```html
<div class="nabi brand-note" data-nabi-theme="light">...</div>
<article class="nabi-content brand-note" data-nabi-theme="light">...</article>
```

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-fg: #1f2937;
  --nabi-muted: #6b7280;
  --nabi-bg: #fff;
  --nabi-soft: #f7f7fb;
  --nabi-line: #e5e7eb;
  --nabi-accent: #635bff;
  --nabi-radius: 10px;
}
```

## よく使う変数

| 目的 | 変数 |
| --- | --- |
| 文字と背景 | `--nabi-fg`, `--nabi-muted`, `--nabi-bg`, `--nabi-soft` |
| 枠線とアクセント | `--nabi-line`, `--nabi-accent`, `--nabi-on-accent` |
| 角丸と影 | `--nabi-radius`, `--nabi-layer-radius`, `--nabi-shadow` |
| フォントファミリー | `--nabi-font`, `--nabi-font-serif`, `--nabi-font-mono`, `--nabi-font-cursive` |
| 編集 surface | `--nabi-content-min-height`, `--nabi-placeholder-color` |
| 固定ツールバーとプレビュー | `--nabi-sticky-top`, `--nabi-preview-width` |
| タッチ操作 | `--nabi-touch-font-size`, `--nabi-touch-control-size` |
| モバイルモードの切り替え幅 | `--nabi-mobile-breakpoint` |

ハイライトと文字色はそれぞれ `--nabi-hl-<name>`、`--nabi-tc-<name>` で変更します。表のセル背景色は `--nabi-cell-<name>` を使い、`yellow`、`green`、`cyan`、`pink`、`purple`、`orange` に対応します。変数は保存された色名を変えず、画面上の色だけを変えます。

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
  --nabi-cell-cyan: #e2f4f7;
}
```

既定のテーマではセルの背景を淡い色で表示します。ダークモードでは同じ色名を維持しながら、明るく彩度を抑えた別の色を使い、暗い背景でも色を見分けやすくしています。背景が透ける半透明色なので、色を変更する場合は実際のページ背景で文字とのコントラストを確認してください。既定の色変数を上書きするには、任意の外側の親ではなく、上の例のように実際の編集要素・公開要素にテーマクラスを指定します。

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

## モバイルモードの切り替え幅

既定の `layout: 'compact'` ツールバーは、画面幅が `36rem` 未満になるとモバイルの一行配置に切り替わります。ちょうど `36rem` ならデスクトップ配置を維持します。デスクトップでは編集画面自体が狭くても、すべてのツールを折り返して表示します。オブジェクトのプロパティツールも下で折り返し、両方の行が本文の上のスペースを使います。全画面表示では画面幅に関係なく全ツールを展開します。

モバイルではクイックツール、全ツールボタン、接続したプレビュー・全画面ボタンがメインツールバーに残ります。プロパティツールの表示中も一緒に使えます。全ツールパレットもデスクトップと同じグループ順序と区切り線を使います。`layout: 'wrap'` は常に全ツールを折り返して表示します。

モバイルのパネルはツールバーとプロパティツールの周囲にある空きスペースで開きます。表のサイズ選択は例外で、半透明の背景の中央に開き、タッチしやすい 5×5 のグリッドを表示します。キーボードが閉じるのを待たず、サイズを選ぶと表を一つ挿入して閉じます。

`--nabi-mobile-breakpoint` を `:root`、祖先要素、または個々の `.nabi` に指定すると基準を変更できます。`rem`、`px`、`calc()` など、0 以上の CSS 長さを使います。CSS 値、ルートの文字サイズ、画面幅が変わると、開いているパネルにも自動的に反映されます。`body` の下に移された入力パネルも、元の編集画面の基準に従います。

```css
.article-editor {
  --nabi-mobile-breakpoint: 40rem;
}
```

フロート領域が一列になる基準は別です。画面幅ではなく本文コンテナの幅が `36rem` 未満の場合に一列で表示し、印刷時も同じ配置を使います。

## ダークモード

ライトモードが既定です。`html` または `body` に `.dark` を付けるか、特定のエディターや公開本文に `data-nabi-theme="dark"` を設定します。

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

祖先の `.dark` から外したい場合は `data-nabi-theme="light"` を使います。テーマ切り替えはアプリケーションが制御します。パッケージは `prefers-color-scheme` に自動追従しません。

```css
.brand-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-fg: #f3f4f6;
  --nabi-muted: #a1a1aa;
  --nabi-bg: #18181b;
  --nabi-soft: #27272a;
  --nabi-line: #3f3f46;
  --nabi-accent: #a5b4fc;
}
```

## 公開コンテンツも装飾する

公開 HTML にも `.nabi-content` と同じ CSS が必要です。表、コードブロック、画像、チェックリスト、ドロップキャップは JavaScript なしで描画されます。表ソートやコードハイライトのような動作が必要な場合だけ `nabi-note/viewer` を追加します。

```html
<article class="nabi-content article-body">...</article>
```

```css
.article-body {
  --nabi-font: "Noto Serif KR", serif;
  --nabi-bg: transparent;
}
```

本文の幅や行間のように、パッケージが所有しないレイアウトはサービス側の class で決めます。

```css
.article-body {
  max-inline-size: 46rem;
  margin-inline: auto;
  padding: 2rem 1.25rem;
  line-height: 1.75;
}
```

## 編集構造を変えない

編集中の `[data-key]` ノードで `display` や `white-space` を変えたり、編集可能な文字の中に擬似要素を追加したり、オブジェクト wrapper の pointer 動作を無効にしたりしないでください。これらの規則を変えると、キャレットの位置計算や文書との対応付けが壊れることがあります。

公開ドロップキャップは `::first-letter` を使い、編集中 surface は実際の `[data-nabi-dropcap-letter]` 要素を使います。`.nabi-editing` 内に別の `::first-letter` ルールを追加したり、その要素を置き換えたりしないでください。
