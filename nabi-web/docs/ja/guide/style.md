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
  --nabi-font: Inter, system-ui, sans-serif;
  --nabi-sticky-top: 4rem;
}
```

共有トークンは共通の親に置くと、エディターと公開表示が同じ視覚言語を保てます。

```html
<section class="brand-note">
  <div class="nabi">...</div>
  <article class="nabi-content">...</article>
</section>
```

```css
.brand-note {
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

ハイライトと文字色のトークンは `--nabi-hl-<name>` と `--nabi-tc-<name>` を使います。たとえば `--nabi-hl-yellow` を変えると、文書データを変えずに、保存済みの `yellow` ハイライトの表示色だけを変えられます。

```css
.article-editor {
  --nabi-hl-yellow: #fff0a6;
  --nabi-tc-blue: #2563eb;
}
```

## ダークモード

ライトモードが既定です。`html` または `body` に `.dark` を付けるか、特定のエディターや公開本文に `data-nabi-theme="dark"` を設定します。

```html
<div class="nabi" data-nabi-theme="dark">...</div>
<article class="nabi-content" data-nabi-theme="dark">...</article>
```

祖先の `.dark` から外したい場合は `data-nabi-theme="light"` を使います。テーマ切り替えはアプリケーションが制御します。パッケージは `prefers-color-scheme` に自動追従しません。

```css
.dark .brand-note {
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
  --nabi-font: Georgia, serif;
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
