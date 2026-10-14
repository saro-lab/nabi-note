---
title: 基本的な使い方
description: ブラウザー上の NABI NOTE エディターを作成し、文書を保存・復元します。
---

# 基本的な使い方

このガイドでは、ブラウザーでクライアントサイド描画する CSR エディターを扱います。wing を選び、エディターと UI をマウントし、NABI TREE JSON を保存して復元します。

## インストールして基本マークアップを追加する

```bash
npm install nabi-note
```

エディターと公開コンテンツの両方で同じスタイルシートを読み込みます。`contenteditable` は自分で付けないでください。`mountSurface()` が管理します。

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi">
  <div id="toolbar" class="nabi-toolbar"></div>
  <div id="content" class="nabi-content"></div>
</div>
```

## エディターをマウントする

`allBasic()` は、アプリケーション固有の接続なしで動く公式 wing を選びます。アップロード、ファイル保存、文書差分のようにサービス側の接続が必要な wing は、それぞれのガイドに従って追加します。

```ts
import { createNabiWith, mountSurface, mountToolbar, wings } from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const toolbarRoot = document.querySelector<HTMLElement>('#toolbar')!

const { nabi, registry } = createNabiWith(wings().allBasic(), {
  locale: 'ja',
  onError: (error) => console.error(error),
  undoLimit: 200,
  typingMergeMs: 1000,
})

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  locale: 'ja',
  placeholder: 'ここに入力します。',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'ja',
})
```

`locale` はツールバーと補助テキストを制御します。すべての UI mount に同じ値を渡してください。`placeholder` は空のエディターにだけ表示されます。`onError` はコマンドやコールバックで隔離された失敗を受け取ります。`undoLimit` は undo 履歴の数です。既定値は 200 です。`typingMergeMs` は連続入力を 1 つの undo にまとめる間隔で、`0` にすると各入力を別々に残します。

ブロックコンテナから抜けるために Enter を連続して押す際の既定の間隔は 180ms です。Esc と Shift の連続押下は 350ms のままです。`mountSurface()` に `doubleEnterMs` を明示すると、Enter だけでなく Esc の連続押下の間隔もその値に変わります。

各エディターには、互いに重ならない content root と toolbar root が必要です。1 つのページに複数のエディターがある場合は、各ツールバーに `surface` で対応する編集 surface を渡し、フォーカスとショートカットが混ざらないようにしてください。

## ツールバーの構成

既定のツールバーは、見出し、文字書式、配置、リスト、挿入、文書ツールの順にグループ化され、グループ間に縦の区切り線を表示します。デスクトップではすべてのツールを複数行に展開し、モバイルではクイックツールと全ツールボタンを一行に表示します。表・画像・フロート領域のプロパティツールはその下に表示され、本文ツールと一緒に使えます。

`groups` でグループの順序を、`quick` でモバイルのクイックツールの順序を変更します。たとえば画像をよく挿入する編集画面では、`media` グループを先頭に移動できます。

```ts
import { TOOLBAR_GROUPS, mountToolbar } from 'nabi-note'

const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'ja',
  groups: ['media', ...TOOLBAR_GROUPS.filter((group) => group !== 'media')],
  quick: ['b', 'i', 'tc', 'img'],
})
```

クイックツールは指定した順序をそのまま使い、区切り線は表示しません。同じグループ内ではウィングの登録順に並びます。SSR でツールバーを事前描画する場合は、サーバーとブラウザーに同じグループ順序を渡してください。画面幅に応じた配置は [CSS テーマ](./style#モバイルモードの切り替え幅)で説明しています。

`mountHints()` を接続すると、Shift を二度押してキーボードでツールを選べます。Tab でグループを移動し、方向キーで同じグループ内のアイコンを移動します。デスクトップと全画面表示では表示中のツールバーを、モバイルでは全ツールパレットを使います。

画像パネル、URL 入力欄、ファイル選択画面は、開いたときの選択位置を記憶します。カーソルだけを動かした場合は元の位置に挿入しますが、文書を編集または置換した場合は入力を取り消して通知します。元に戻す操作で内容が同じになっても、以前の選択位置を再利用しません。

## wing を選ぶ

必要な機能だけを残すには `use()` と `drop()` を使います。各 wing ページでは、その wing が受け取るオプションを説明しています。

```ts
const selected = wings()
  .allBasic()
  .drop('youtube')
  .use('upload')

const { nabi, registry } = createNabiWith(selected, { locale: 'ja' })
```

より小さなバンドルにしたい場合は、`boldWing` や `imageWing` のように必要な wing だけを配列で渡します。未知の名前、不正なオプション、不足している依存関係は、エディター作成時にすぐ失敗します。

## 保存と読み込み

文書をあとで再編集する場合は、`getJson()` の出力を NABI TREE JSON として保存します。`getHtml()` は公開用の出力です。エディター専用の `getEditorHtml()` の結果は保存しないでください。

```ts
const json = nabi.getJson()
await saveToServer(json)

const saved = await loadFromServer()
if (!nabi.setJson(saved)) showError('保存された文書を読み込めませんでした。')

const publishedHtml = nabi.getHtml()
```

外部 HTML をインポートするには `setHtml()` を使います。ブラウザーエディターには HTML パーサーがすでに用意されているため、パーサーオプションは不要です。`setJson()` と `setHtml()` は、不正な空でない入力に対して `false` を返し、現在の文書は変更しません。

```ts
nabi.setHtml('<p>Imported document</p>')
```

JSON と HTML はどちらも信頼できない入力です。NABI NOTE は登録済み wing と許可されたルールを通してそれらを読みますが、それはアップロード認可やサービス独自のセキュリティポリシーの代わりにはなりません。

## よく使う API

| 作業 | API |
| --- | --- |
| エディターを作る | `createNabiWith`, `wings` |
| surface とツールバーをマウントする | `mountSurface`, `mountToolbar` |
| 保存と復元 | `getJson`, `setJson`, `getHtml`, `setHtml` |
| 変更を監視する | `nabi.onChange(listener)` |
| undo と redo | `nabi.undo()`, `nabi.redo()` |
| サーバーで HTML を描画する | `nabi-note/ssr` の `renderStoredHtml` |
| 公開ページの動作を追加する | `nabi-note/viewer` の `attachViewer` |
| 文書を比較する | `nabi-note/diff` の `diffDocs` |

正確な型とすべての引数は、まずインストール済みパッケージの宣言を確認してください。自動化ツールは [English API reference](https://nabi.saro.me/llms/api-reference.md) も利用できます。

## mount を解放する

作成した順序の逆に unmount します。編集中 root の `innerHTML` を直接変更しないでください。文書の変更には `setJson()`、`setHtml()`、`applyCommand()` のような公開 API を使います。

```ts
function dispose() {
  toolbar.unmount()
  surface.unmount()
}
```
