---
title: SSR 設定
description: 保存した NABI TREE 文書をサーバーで安全に HTML へ描画し、ブラウザーでエディターを hydrate します。
---

# SSR 設定

サーバーではブラウザー用の surface や UI ではなく、`nabi-note/ssr` だけを import します。保存済みの NABI TREE JSON を検証し、公開 HTML または hydrate 可能なエディター HTML に変換します。

## 公開 HTML を描画する

```ts
import { makeRegistry, renderStoredHtml, wings } from 'nabi-note/ssr'

const registry = makeRegistry(wings().allBasic().build())
const html = renderStoredHtml(storedJson, registry)

if (html === null) throw new Error('保存された文書を読み込めませんでした。')
```

`renderStoredHtml()` は JSON 入力を検証して正規化し、公開 HTML を返します。`null` は現在の registry ではその入力を読めないという意味です。公開ページではパッケージ CSS と `.nabi-content` を含めてください。

```html
<link rel="stylesheet" href="/assets/nabi.css">
<article class="nabi-content">...</article>
```

インタラクティブな表ソートやコードハイライトが必要な場合だけ、ブラウザーで `nabi-note/viewer` の `attachViewer()` を追加します。通常の公開コンテンツは CSS だけで十分です。

## 事前描画したエディターマークアップを hydrate する

最初の描画からエディターを表示したい場合は、サーバーで `renderStoredEditorHtml()` を使って描画し、ブラウザー側の surface に `hydrate: true` を渡します。

```ts
// server
const initialEditorHtml = renderStoredEditorHtml(storedJson, registry)

// browser
const { nabi, registry } = createNabiWith(wings().allBasic(), { doc: storedJson })
const surface = mountSurface({ nabi, registry, root: content, hydrate: true })
```

サーバーとブラウザーは、同じ文書、同じ順序の wing 宣言、HTML に影響する同じオプションを使う必要があります。サーバー出力は content root の直接の子としてそのまま挿入し、その root にあらかじめ `contenteditable` を設定しないでください。構造が異なる場合、surface は新しいエディター HTML を描画します。

## ツールバーも事前描画する

`renderToolbarHtml()` と `renderViewToolsHtml()` は、サーバーでツールバーコントロールを事前描画できます。ブラウザーで mount すると、registry、locale、グループ順が一致するときにそのコントロールへ動作が接続されます。ツールバー root の中に任意のホスト DOM を入れることはサポートしていません。

SSR 中に `injectSheets()` のようなブラウザー API は使わないでください。ビルド済みの `nabi-note/nabi.css` ファイルを link するか、CSS バンドルに含めます。
