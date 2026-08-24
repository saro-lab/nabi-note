---
title: SSR サポート
description: サーバー側で保存済みの文書をあらかじめレンダリングし、ブラウザでは hydrate でエディタとツールバーを即座に引き継ぎます。
---

# SSR（サーバーサイドレンダリング）サポート

## 保存済み文書のレンダリング（読み取り専用画面）

コメント一覧や投稿の閲覧画面のように**文書を表示するだけの画面**では、エディタのインスタンスを作る必要はありません。文書を HTML にレンダリングするために必要なのは登録済みの翼一覧（`registry`）だけなので、サーバー専用のレンダリング関数が用意されています。

```ts
import { makeRegistry, defaultWings, renderStoredHtml, renderStoredEditorHtml } from 'nabi-note/ssr'

// サーバー起動時に一度だけ生成し、複数のリクエストで再利用します。
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['コメント一行'] }]   // DB から読み込んだナビツリー

renderStoredHtml(saved, registry)        // '<p>コメント一行</p>'
renderStoredEditorHtml(saved, registry)  // '<p data-key="n0">コメント一行</p>'
```

**`nabi-note/ssr` はレンダリングに必要なコアロジックだけを収めた軽量な入口です。** 編集領域（`surface`）や画面上の UI ツール（`ui`）を一切参照せず、アーキテクチャレベルの単体テストによってサーバーバンドルに DOM コードが混入しないことを保証しています。すでにエディタ全体のバンドルを読み込んでいる環境であれば、`nabi-note` パッケージから同じ関数を使うこともできます。

| 関数 | 説明 |
|---|---|
| `renderStoredHtml(json, registry, options?)` | 保存・公開用の HTML — エディタの `getHtml()` と同じ値 |
| `renderStoredEditorHtml(json, registry, options?)` | エディタ初期化用の HTML — `getEditorHtml()` と同じ値（`data-key` 付き） |

- **DOM API を一切使用しません。** Node.js などのサーバー環境でそのまま実行できます。
- **有効なナビツリー構造でない場合は `null` を返します。** 検証ルールは `setJson()` と同じです。不正なデータが渡されても例外は投げず、`null` を返して原因を `console.error` に記録します。
- **エディタインスタンスが生成する結果と完全に一致します。** 同じ正規化・組み立てパイプラインを通るため、XSS フィルタリングも同じ場所で適用されます。
- `options` パラメータは `{ allowLocalUrls?: boolean }` をサポートし、`createNabiWith` の同名オプションと同じ役割を持ちます。

**同じナビツリーデータは常に同じ `data-key` を生成します。** そのため、サーバー側で `renderStoredEditorHtml` によってエディタの初期 HTML をあらかじめレンダリングしてクライアントに送り、ブラウザで `hydrate: true` オプションを付けてマウントすれば、再描画やちらつきなしに即座に有効化されます。

```ts
mountSurface({ nabi, registry, root: surface, hydrate: true })
```

サーバーとクライアントのレンダリング結果に不一致が生じても、クライアント側で自動的に通常のレンダリングにフォールバックするため、サーバーとクライアントで翼一覧（`registry`）を揃えておくだけで安全に動作します。

::: tip このサイトのホームデモは実際に SSR hydration で動作しています
ホームデモの文書は**ビルド時に `renderStoredEditorHtml` であらかじめレンダリング**されて HTML に埋め込まれており、クライアントスクリプトの読み込み後に `hydrate` でエディタが有効化されます。そのため JS の読み込み前でも本文はすでに表示されており、レイアウトのずれ（CLS）が発生しません。
:::

---

## ツールバーの事前レンダリング

ツールバーのボタン構成は**文書の内容に依存しません。** 登録済みの翼一覧、表示言語（locale）、グループの順序だけから生成されるため、結果は決定的（deterministic）です。サーバー起動時に一度レンダリングしてキャッシュし、複数のリクエストで再利用できます。

```ts
import { makeRegistry, defaultWings, renderToolbarHtml } from 'nabi-note/ssr'

const registry = makeRegistry(defaultWings)

const toolbarHtml = renderToolbarHtml({ registry, locale: 'ja' })
// '<div class="nabi-group" data-group="font">…</div>'
```

この HTML 文字列をツールバーのコンテナ内に含めてクライアントに渡すと、ブラウザ側の `mountToolbar` が既存のマークアップを検知して、**再描画せずにイベントリスナーだけを紐付けます。**

```ts
mountToolbar({ nabi, registry, surface, root: toolbar })
```

::: warning コンテナ要素に `class="nabi-toolbar-row"` を明示してください
事前レンダリングしたツールバーを渡す場合、ツールバーの行要素には**最初から** `class="nabi-toolbar-row"` が含まれている必要があります。これが欠けていると、マウント時にコアが自動でこのクラスを付与し、その瞬間にパディングが適用されて**ボタンの行が一瞬ずれる**ことがあります。
:::

- **構造が一致していなくても安全です。** 渡された HTML が現在の翼一覧と異なる場合、クライアント側でその場で再レンダリングされるため、画面が崩れることはありません。
- **事前レンダリングされたツールバーは初期状態（何も押されておらず、何も隠れていない状態）でレンダリングされます。** ボタンの押下状態（`aria-pressed`）や状況に応じた表示・非表示はキャレット位置によって決まるため、クライアントのマウント後にキャレット位置に応じて自動的に状態が同期されます。
- **エディタを含む画面でのみ使用してください。** 単純な読み取り専用ページにはツールバーは不要です。

**プレビュー・全画面表示の 2 つのボタンも同様に事前レンダリングできます。** これらは翼ではなくビューツールのコンポーネントなので、`renderViewToolsHtml` を使って別途レンダリングします。

```ts
import { renderViewToolsHtml } from 'nabi-note/ssr'

renderViewToolsHtml({ locale: 'ja' })
// '<span class="nabi-tools">…</span>'
```

::: tip ホームデモのツールバーにも事前レンダリングが適用されています
ホームデモのツールバーは**ビルド時に `renderToolbarHtml` と `renderViewToolsHtml` によって事前レンダリング**されて埋め込まれており、`mountToolbar` と `mountViewTools` はその行を検知してイベントの紐付けだけを行います。そのため、数十個のツールバーアイコンが遅れて表示される、といった現象は起こりません。
:::

---

## 次のドキュメント

- [{{ t('menu_intro_usage') }}](./usage) — npm パッケージのインストールとエディタの詳しい使い方
- [{{ t('menu_intro_cdn') }}](./cdn) — ビルドツールなしで `<script>` タグひとつで使う方法

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
