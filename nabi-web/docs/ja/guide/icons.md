---
title: "アイコンテーマ"
description: "CSS変数でウィング、プレビュー、全画面、パネル、差分、表の並べ替えアイコンを変更します。SVG・WebP・PNGを混在でき、指定しないアイコンには標準ファイルを使います。"
---

# アイコンテーマ

CSS変数でウィング、プレビュー、全画面、パネル、差分、表の並べ替えアイコンを変更します。SVG・WebP・PNGを混在でき、指定しないアイコンには標準ファイルを使います。

## ファイルの指定

CSSを読み込み、エディターまたは共通の親にテーマクラスを付けます。画像の元の色、透明度、縦横比は維持されます。

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi paper-note">...</div>
```

```css
.paper-note {
  --nabi-icon-toolbar-b: url("/icons/bold.svg");
  --nabi-icon-view-preview: url("/icons/preview.webp");
  --nabi-icon-view-fullscreen-enter: url("/icons/expand.svg");
  --nabi-icon-view-fullscreen-exit: url("/icons/shrink.webp");
  --nabi-icon-panel-preview-close: url("/icons/close.svg");
}
.paper-note[data-nabi-theme="dark"] {
  --nabi-icon-view-preview: url("/icons/preview-dark.webp");
}
```

`/icons/...`のようなルート相対パスか完全なHTTPS URLを使ってください。相対パスがテーマファイルの隣を基準に解決される保証はありません。CSSを自分で配信する場合、同じバージョンの`dist/icons/`も`nabi.css`の隣にコピーします。画像の読み込みに失敗しても、ボタン名、ツールチップ、操作は維持されます。

## ほかのアイコンを探す

アイコン要素の`data-nabi-icon`の値に`--nabi-icon-`を付けるとCSS変数になります。例：`diff-close`は`--nabi-icon-diff-close`です。コンテキスト、メニュー、保存、履歴などのキー規則と特殊文字の処理は<a href="/llms/icons.md" target="_blank" rel="noopener">アイコンの仕様</a>を参照してください。

## ダークモードとパネル

テーマクラスやCSS変数を変えるだけで、再mountせずにアイコンが変わります。標準アイコンはライト・ダークテーマに従います。独自ファイルは`currentColor`を継承しないため、必要に応じて上の例のようにダーク用ファイルを指定してください。`body`直下のパネルも元のエディターのアイコンテーマとクラス・スタイル変更に従います。変数はツールバー内だけでなく、エディターか共通の親に置いてください。

## 標準ボタンの表示

`showPreview`と`showFullscreen`の既定値はどちらも`true`です。`false`にしたボタンはフォーカス対象とイベントも除去されます。両方が`false`なら空のツール領域も作りません。

```ts
import { mountViewTools, renderViewToolsHtml } from 'nabi-note'

const visibility = { showPreview: false, showFullscreen: true }
const toolsHtml = renderViewToolsHtml({ locale: 'en', ...visibility })
const tools = mountViewTools({
  nabi, surface, root, container, locale: 'en', ...visibility,
})
```

SSRとmountに同じ表示オプションを渡します。構成を変えるときは`tools.unmount()`後に新しいオプションでmountします。両方不要なら、最初からツールのmountとSSRマークアップを省略する従来の方法も使えます。`openPreview()`と`setFullscreen()`の直接呼び出しは引き続き使えます。
