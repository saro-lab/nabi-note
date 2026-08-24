---
title: CDN で使う
description: ビルドツールを使わず、HTML タグだけで NABI NOTE を使う方法を紹介します。
---

# CDN で使う

<CdnDemo />

---

## 基本構成と動作の仕組み

上のデモは、バンドラーやビルドツールを使わず、HTML ファイル一つだけで動きます。

### HTML タグ2行で導入

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">
<script src="https://cdn.jsdelivr.net/npm/nabi-note@latest"></script>
```

パッケージが書き出すすべてのモジュールは、グローバルオブジェクト `NabiNote`(短縮形 `N`)にまとまります。**CSS スタイルシートは必ず自分でリンクしてください。** JavaScript のマウント関数は CSS を自動で注入しないため、`<link>` タグを忘れるとスタイルの当たっていない状態で表示されます。

### HTML 構造

```html
<div id="app" class="nabi">                    <!-- 色テーマ・角丸・フォントの基準となるルート -->
  <div id="chrome" class="nabi-toolbar">        <!-- ツールバーとコンテキストバーを包む固定ヘッダー -->
    <div class="nabi-toolbar-row">
      <span id="tools"></span>                 <!-- プレビュー・全画面ボタン(右寄せ) -->
      <div id="toolbar"></div>
    </div>
    <div id="context"></div>                   <!-- カーソル位置に応じて動的に現れるコンテキストバー -->
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

各要素の `id` は自由に指定できます。マウント関数に渡すのは id 文字列ではなく実際の DOM 要素オブジェクトです。4つのクラス(`nabi`・`nabi-toolbar`・`nabi-toolbar-row`・`nabi-content`)はスタイルシートが参照する必須クラスなので、そのまま残してください。プレビューと全画面機能が不要なら、`<span id="tools">` 要素と `mountViewTools` の呼び出しをまとめて省略できます。`mountViewTools` は渡されたコンテナの中に専用のボタン領域を自動で構成します。

### 翼(Wing)の構成

翼の構成はビルダーのチェーンで簡単に書けます。上の例は、ホスト側の追加連携なしで動く基本の26個の翼から始めて、保存・開く機能を足し、書体の選択肢を2種類に絞った例です。

```js
var wings = N.wings().allBasic().use('save').use('open').use('tf', { values: ['sans', 'serif'] })
```

- `all()` は公式の翼を全部有効にします。呼ばなければ既定の翼は含まれず、`use()` で明示した翼だけが登録されます。
- `allBasic()` は公式の翼の中から、**ホストアプリ側の追加連携なしで動く26種類の翼**を選びます。アップロード・保存・開くの3つは、サーバーのエンドポイントやファイル保存先のようにホストが用意すべき設定があるため、基本セットから除外されています。上の例で保存・開くを `use()` で追加宣言しているのはこのためです。
- `use('名前', オプション?)` は特定の翼を追加します。すでに登録済みの翼に呼ぶとオプションだけを更新します(例: `use('tf', { values: [...] })`)。ある翼が別の翼に依存している場合(例: アップロード翼は画像かリンクの翼が必要)、依存先も自動でまとめて登録されます。
- `drop('名前')` は登録済みの翼一覧から特定の翼を取り除きます。他の翼が依存している翼を取り除こうとすると例外が発生し、一緒に取り除くべき関連翼を案内します。
- 翼の名前は、ナビツリーに保存される短い一意のキー(`w`)です(例: `b`(太字)、`tf`(書体)、`upload` など)。全一覧は `console.log(N.wingNames())` で確認できます。
- **誤った名前やオプションを渡すと即座にエラーになります。** 誤字、サポートされていないオプションキー、有効範囲外の値などを渡すと、エラーメッセージが正しい修正方法を案内します。

`createNabiWith` はビルダーインスタンスを直接引数として受け取れるので、別途 `build()` を呼ぶ必要はありません。翼を配列形式で直接渡すこともできます。

```js
var wings = [N.boldWing, N.italicWing, N.headingWing, N.bulletListWing]
```

自作のカスタム翼はオブジェクト形式で渡します(`N.wings().all().use(customWing)`)。カスタム翼の `w` 識別子は、公式翼の識別子との衝突を避けるため `ex` プレフィックスで始めることが推奨されます(`exNote` など)。詳しい作り方は [{{ t('menu_wing_custom') }}](../wing/custom) 文書を参照してください。

各翼の詳細な仕様は [{{ t('menu_wing') }}](../wing/inline/bold) メニューで確認できます。

### ダイアログと通知の連携

上の例では `ask` オプションを通じてブラウザ標準の `alert` と `confirm` を接続しています。例えば「編集中の内容があります。続行しますか?」のような確認メッセージをブラウザのポップアップで表示できます。

`ask` を渡さない場合、確認ダイアログの既定の返答はキャンセル(`false`)として処理され、単純な通知メッセージはコアに内蔵された toast UI がツールバー下部に自動で表示されます。詳しくは [{{ t('menu_intro_usage') }}](./usage) 文書を参照してください。

`ask` には複数の選択肢から一つを選ぶ `choose` 処理関数も含まれます。ただし、**クリップボード貼り付け時の形式選択ポップアップは、特別な設定なしでも既定で動作します。** `mountToolbar` がマウントされる際にコアが専用のポップアップ UI を自動で接続するため、ツールバーを使うページでは追加の実装なしに選択ポップアップが表示されます。独自のモーダル UI に置き換えたい場合にのみ `ask.choose` を渡してください。

### 入出力メソッド

| メソッド | 説明 |
|---|---|
| `nabi.getHtml()` | 保存・配信用の HTML を返す |
| `nabi.getJson()` | ナビツリー(JSON)データを返す |
| `nabi.setHtml(html)` · `nabi.setJson(json)` | 新しい文書データに置き換える |
| `nabi.onChange(fn)` | 文書変更イベントのリスナーを登録する |
| `N.renderStoredHtml(json, registry)` | エディタなしでナビツリーを HTML に変換する(下記 [読み取り専用ビューア](#読み取り専用ビューア-viewer) 参照) |

---

## CDN 配信アドレス

特定のバージョンを固定したい場合は、CDN URL にバージョン番号を明記します。jsDelivr と unpkg のどちらもサポートされています。

バージョンを明記しない URL(`/npm/nabi-note`)は、CDN のキャッシュの都合でスクリプトと CSS のバージョンが一致しなくなることがあるため、バージョンを明記するか `@latest` タグを使うことを推奨します。

| 種類 | アドレス |
|---|---|
| **バンドルスクリプト(最新)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest` |
| **バンドルスクリプト(バージョン固定)** | <code>{{ CDN_BUNDLE }}</code> |
| **スタイルシート(最新)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css` |
| **スタイルシート(バージョン固定)** | <code>{{ CDN_SHEET }}</code> |
| **バンドルスクリプト(unpkg)** | `https://unpkg.com/nabi-note` |

CDN バンドルは、npm 配布パッケージ内の `dist/` ビルド結果と同一です。

---

## 読み取り専用ビューア(Viewer)

保存済みの HTML 文書を**単純に表示するだけのページ**では、エディタインスタンスを作る必要はありません。同じスタイルシートを読み込み、`.nabi-content` コンテナの中に HTML をレンダリングすれば、エディタで作成したときの見た目のまま表示されます。

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">

<div class="nabi-content">
  <!-- nabi.getHtml() で保存した HTML 文字列 -->
</div>
```

文書を**ナビツリー(JSON)形式で保存している場合**は、レンダリング関数を呼び出すことで純粋な JavaScript として HTML をレンダリングできます。保存済みの JSON データと登録済みの翼一覧(`registry`)を引数として渡します。

```html
<script>
  var registry = N.makeRegistry(N.wings().all().build())

  var saved = [{ w: 'p', ch: ['コメント一行'] }]   // サーバーから読み込んだナビツリー
  document.querySelector('.nabi-content').innerHTML = N.renderStoredHtml(saved, registry)
</script>
```

ナビツリー形式でなければ `null` を返し、レンダリング結果はエディタインスタンスの `getHtml()` の結果と完全に一致します。同じ XSS フィルタリング規則が適用され、DOM に依存しないため、サーバー(Node.js など)でも同じように動作します([{{ t('menu_intro_ssr') }}](./ssr) 参照)。

npm パッケージを使うサーバー環境では、グローバルバンドルの代わりに軽量モジュールの **`nabi-note/ssr`** を使います。レンダリングに必要なロジックのみが含まれているため、編集領域や UI コードがサーバーバンドルに含まれません。

CSS スタイルシートには**すべての翼のスタイルが含まれています。**

基本的な書式は CSS だけで表現されますが、**表の並べ替えとコードのシンタックスハイライトにはクライアント側の JavaScript の動作が必要です。** 列見出しをクリックしての行の並べ替えや、コードのトークン化・色付けが必要な場合は、軽量ビューアランタイムを接続できます。

```html
<script type="module">
  import { attachViewer } from 'https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/viewer/index.js'

  attachViewer(document.querySelector('.nabi-content'), { locale: 'ja' })
</script>
```

- ビューアを接続しなくても文書は正常に表示されます(表の並べ替え機能とコードの色付けが無効になるだけで、本文の閲覧には影響しません)。
- 表の並べ替え機能は、エディタで並べ替えが有効化された表(`data-nabi-sortable` 属性を持つもの)にのみ動作します。
- コードのシンタックスハイライトは内蔵トークナイザーが標準搭載されているため、外部依存なしで動作します。Shiki などの外部ハイライターを使う場合は、`{ locale: 'ja', highlight }` オプションで渡せます。
- グローバルの `NabiNote` バンドルにはビューアのエントリーポイントが含まれていません。読み取り専用ページのバンドルサイズを最適化するため、`nabi-note/viewer` という別モジュールとして提供されています。

---

## 次の文書

- [{{ t('menu_intro_usage') }}](./usage) — npm パッケージのインストールとエディタの詳しい使い方
- [{{ t('menu_wing_custom') }}](../wing/custom) — 新しいカスタム書式の翼を自分で作る

<script setup lang="ts">
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
import { useTranslate } from '../../.vitepress/src/langs.ts'
// バージョン番号はパッケージバージョンを動的に参照
import { CDN_BUNDLE, CDN_SHEET } from '../../.vitepress/src/version.ts'

const { t } = useTranslate()
</script>
