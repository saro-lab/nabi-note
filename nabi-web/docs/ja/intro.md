---
title: 紹介
description: NABI NOTE はブラウザで動作するオープンソースの WYSIWYG エディタです。
---

# NABI NOTE とは?

NABI NOTE はブラウザで動作する **オープンソースの WYSIWYG エディタ**です。

## ナビツリー

HTML を直接操作すると、DOM のないサーバーサイド(Node.js など)では文書を扱いにくい
という問題があります。そこで NABI NOTE は文書を **ナビツリー** という純粋な
JavaScript のツリーオブジェクトとして管理し、JSON・HTML の双方向シリアライズに対応
しています。また、ナビツリーと HTML を変換する過程で、XSS を引き起こしうる悪意ある
要素も自動的に取り除かれます。

> ナビノートが公式に提供するすべての標準翼は XSS 対策に対応していますが、
> `カスタム翼(外部プラグイン)` を作成・導入する際は、その開発者に XSS 対策の有無を
> 確認する必要があります。

<FlowHub :sources="hubSources" :core="hubCore" :targets="hubTargets" caption="" />

## DOM のない SSR(サーバーサイドレンダリング)対応

データベースなどに保存しておいたナビツリーは **サーバー(Node.js など)でそのまま
読み込み**、クライアントに渡す HTML を組み立てることができます。DOM API が必要になる
のは、外部の HTML 文字列を **入力する**(`setHtml()`)処理と、画面にエディタを描く
`mount*` 関数だけです。

文書を読み取り専用で表示するだけの画面では、エディタを立てる必要すらなく、単一の
レンダリング関数(`renderStoredHtml`)を呼ぶだけで済みます。保存されたナビツリーの
データと `registry`(登録済みの翼一覧)を引数として受け取り、安全な HTML 文字列を
返します。

**サーバー環境では `nabi-note/ssr` エントリを使います** — レンダリングに必要な
コアロジックだけを含む軽量な入口なので、編集領域(`surface`)や画面のツール(`ui`)の
コードがサーバーのバンドルに含まれることはありません。

```ts
import { makeRegistry, defaultWings, renderStoredHtml } from 'nabi-note/ssr'

// 翼の一覧はサーバー起動時に一度だけ作成し、以降すべてのリクエストで再利用します。
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['コメント一行'] }]   // DB から読み込んだナビツリー
renderStoredHtml(saved, registry)
// '<p>コメント一行</p>'
```

**有効なナビツリー形式でなければ `null` を返します** — 検証ルールは `setJson()` と
同じです。検証を通過して返る値は、エディタのインスタンスで呼び出す `getHtml()` の
結果と **完全に一致します**。同じ正規化・組み立てパイプラインを通るため、XSS が
フィルタされる箇所も同じです。

エディタ自身の編集画面をサーバーで事前にレンダリング(SSR)するには、
`renderStoredEditorHtml` 関数を使います。各ノードに `data-key` 属性が付いた HTML が
生成されます。

```ts
import { renderStoredEditorHtml } from 'nabi-note/ssr'

renderStoredEditorHtml(saved, registry)
// '<p data-key="n0">コメント一行</p>'
```

同じ保存データは常に同じ `data-key` を生成します。そのため、サーバーでレンダリング
した HTML をそのまま送り、ブラウザ側で
`mountSurface({ nabi, registry, root, hydrate: true })` によってハイドレーション
すれば、画面を再描画せずにエディタが引き継げます。**このサイト自身のホームデモも
実際にこの方式で動いています** — 最初の画面の文書はサーバーが事前にレンダリング
したもので、クライアント側ではエディタがその DOM の上でそのまま起動します。

### 3 つのエントリポイント

| エントリ | 内容 | 用途 |
|---|---|---|
| `nabi-note` | エディタの全機能(文書モデル、編集領域、ツールバー、UI ツール) | 文書を**書く/編集する**画面 |
| `nabi-note/ssr` | ナビツリーを HTML にレンダリングするだけの軽量な SSR 専用モジュール | サーバー環境、または読み取り専用ページ |
| `nabi-note/viewer` | 読み取り側の動作(表の列並べ替え、コードのハイライトなど) | 公開済みの HTML を**表示する**画面 |

`nabi-note/ssr` は編集領域(`surface`)や画面のツール(`ui`)を **一切参照しません**。
アーキテクチャレベルのユニットテストでこれを厳密に検証しているため、サーバーの
バンドルに DOM 依存のコードが混ざり込む心配はありません。

## すべての書式は翼です

他のエディタで「プラグイン」と呼ばれる単位を、NABI NOTE では **翼(wing)** と呼びます。
エディタのコアが直接扱うのは基本の段落(`p`)、改行(`br`)、そして平文だけで、見出し・
リスト・表・太字など、その他すべての書式や拡張機能は独立した翼として提供されます。

```ts
import { createNabiWith, parseNodes, boldWing } from 'nabi-note'

const bare = createNabiWith([], { parseHtml: parseNodes }).nabi
bare.setHtml('<p><b>太字</b> <i>斜体</i></p>')
bare.getHtml()
// '<p>太字 斜体</p>'                    — 翼が登録されていないため、タグが取り除かれ平文に変換されます。

const bold = createNabiWith([boldWing], { parseHtml: parseNodes }).nabi
bold.setHtml('<p><b>太字</b> <i>斜体</i></p>')
bold.getHtml()
// '<p><b>太字</b> 斜体</p>'              — boldWing だけが登録されているため、太字だけが残り、他は平文に変換されます。
```

翼として登録されていないマークアップは **自動的に平文に変換されます。** そのため、
宣言されていない任意の HTML 要素は安全に除外され、ナビノートが公式に提供するすべての
翼は悪意あるスクリプトを徹底的にフィルタします。


## インターフェース

文書は `applyCommand()` を通してのみ安全に変更できます。

```ts
nabi.applyCommand('toggleMark', { w: 'b' })     // 太字を切り替え
nabi.applyCommand('setHeading', { value: 2 })   // H2 見出しを設定
nabi.undo()
nabi.redo()
```
コマンドは **成功したかどうかを `boolean` で返します。** 何も変更がなければ `false`
を返し、履歴を残したり不要な処理を行ったりしません。


## コードの層

以下の構成はデータが実行される順序ではなく、`src/` ディレクトリに組まれた
**14 個の層(Layer)** を表しています。核となる原則は **下の層は上の層を参照しない**
ということです。そのため下の層(`schema`、`doc`、`html` など)は DOM に一切依存せず、
サーバー環境(Node.js)でもそのまま動作します。

```
src/
├── style/     コアスタイルシート — 編集画面とビューアが共用する CSS
├── locale/    多言語辞書
├── code/      編集画面とビューアが共用する純粹なトークナイザー
├── schema/    ナビツリーの構造および cocoon(正規化)の定義
├── doc/       ノードの挿入・削除・分割・範囲演算 — DOM なし
├── caret/     カーソル位置・選択範囲・境界処理
├── html/      ナビツリー ↔ HTML の双方向シリアライズ
├── io/        入出力処理 — 貼り付け候補・保存・開く・マークダウン
├── editor/    コマンドインターフェースとエディタインスタンス
├── wing/      翼の妥当性検査と登録管理
├── wings/     公式の翼コレクション(bold · italic … table · upload)
├── surface/   キャレット・IME・入力イベントをツリーに同期
├── ui/        UI レイヤー — ツールバー・コンテキストバー・ポップアップ
├── viewer/    読み取り専用のビューア動作
├── index.ts   コアのエントリポイント — `nabi-note`
└── ssr.ts     SSR 専用のエントリポイント — `nabi-note/ssr`(surface・ui を参照しない)
```

**行の並びがそのまま層の順序です** — アルファベット順ではなく、**下の層から上の層の
順**に並んでいます。`style` が最下層で、`viewer` が最上層です。

この層の依存規則は単なる推奨ではなく、**ユニットテストによって機械的に検証されます。**
層の規則に違反する `import` が発生すると、ビルドおよびテストの段階で即座に失敗します。


## 用語

| 用語 | 説明 |
|---|---|
| **マーク(mark)** | インラインの文字装飾(例:`<b>`、`<i>`、`<a>`) |
| **ブロック(block)** | ブロックレベルの要素(例:段落、見出し、リスト、表、画像) |
| **段落属性(paragraph attribute)** | 段落全体に適用される属性(例:文字揃え、ドロップキャップ) |
| **ラッパー段落** | 表や画像のような単独のブロックオブジェクトを包む段落 |
| **所有判定(claim)** | 入力された HTML マークアップがどの翼に属するかを判定する規則 |
| **部品(parts)** | 翼の内部を構成する要素(例:表の行・列、折りたたみブロックの要約行) |
| **IO フィルタ(io filter)** | クリップボードからの貼り付け(入力)と保存・開く(出力)を扱う拡張ポイント。翼の規約の外側で動作するため、ナビツリーに独自のノードを作りません |

### 編集画面に関する用語

| 用語 | 説明 |
|---|---|
| **キャレット(caret)** | エディタ内部のテキストカーソルおよび選択範囲 |
| **コンテキスト行(context row)** | 現在キャレットがある位置のブロック/書式の状態に応じて動的に表示される補助ツールバー(例:表の行・列操作、コード言語の選択、リンクのアドレス入力、見出しレベルの選択) |

### コアに関する用語

| 用語 | 説明 |
|---|---|
| **cocoon** | ナビツリーの正規化ステップです。**すべてのコマンド実行直後に動作し**、スキーマ規則に違反する異常なツリーが生成されないことを保証します |
| **アタッチ(attach)** | 翼が DOM を直接制御する必要があるときに宣言するフックです(例:表のセルのドラッグ選択、コードの構文ハイライト、チェックボックスの切り替え)。`mountSurface` の実行時に、登録済みの翼のフックがまとめて接続されます |
| **入力規則(input rule)** | 文字入力だけで書式が自動的に変換される簡易ルールです(例:`- ` の入力でリストに変換、`# ` の入力で見出しに変換) |


## 次のドキュメント

- [{{ t('menu_intro_usage') }}](./intro/usage) — エディタの組み立て・入力・出力の全ガイド
- [{{ t('menu_intro_cdn') }}](./intro/cdn) — ビルドツールなしで `<script>` タグひとつだけで使う
- [{{ t('menu_wing_custom') }}](./wing/custom) — 新しいカスタム書式の翼を自分で作る

<script setup lang="ts">
import FlowHub from '../.vitepress/ui/FlowHub.vue'
import { useTranslate } from '../.vitepress/src/langs.ts'

const { t } = useTranslate()

const hubSources = [
  { label: 'HTML · JSON', note: '直接入力 · 貼り付け · 読み込み', kind: 'in' },
  { label: 'setHtml() · setJson()', note: '関数入力', kind: 'gate' },
];

const hubCore = { label: 'ナビツリー', note: 'Tree Object', kind: 'core' }

const hubTargets = [
  { label: 'getHtml()', note: 'Output HTML', kind: 'out' },
  { label: 'getJson()', note: 'Output JSON', kind: 'out' },
  { label: 'getEditorHtml()', note: 'エディタ用 HTML', kind: 'out' },
];

</script>
