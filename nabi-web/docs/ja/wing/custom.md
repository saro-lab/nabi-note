---
title: カスタム翼を作る
description: NABI NOTE の Wing インターフェース仕様を書いて、新しいカスタム書式や機能を作る方法を案内します。
---

# カスタム翼を作る

翼(Wing)は **ひとつの純粋な JavaScript オブジェクト**です。複雑なクラスの継承も、別途の
フレームワーク登録手続きもいりません — `createNabiWith` に渡す配列にオブジェクトを含める
だけで、その場で登録されます。

太字・表・ファイルアップロードなど、標準で提供されるすべての公式翼も、同じ `Wing` インター
フェース仕様で書かれています。自分で作ったカスタム翼も、標準の翼と **まったく同じ環境と条件**
で動きます。

---

## いちばん簡単な翼の例

`<kbd>` キーボードタグに対応するインラインマーク翼の例です。

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',                                                   // この翼の固有識別子(nabi ツリーに保存されるキー)
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),   // HTML 出力関数
  }),
  // 入力された HTML の中の <kbd> タグを検出し、nabi ツリーのノードに変換
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

これでエディタ内で `<kbd>` タグが保持されます。クリップボードからの貼り付け、`setHtml()`、
保存や読み込みを経ても、マークアップはそのまま残ります。

```
登録時:     <p>ショートカット: <kbd>Ctrl</kbd>+<kbd>S</kbd></p>   →   <kbd> タグを保持
未登録時:   <p>ショートカット: <kbd>Ctrl</kbd></p>              →   <p>ショートカット: Ctrl</p>(プレーンテキストに変換)
```

`toHtml` は nabi ツリーを HTML に書き出すシリアライズ関数、`claim` は外部 HTML を nabi ツリーに
読み込むデシリアライズ規則です。`claim` を定義しなくても HTML 出力は可能ですが、保存後に
読み込み直すとタグがプレーンテキストに変換されます。

属性を持たないマークには `simpleMark()`、値を持つマークには `valueMark()`、独立したブロック
オブジェクトには `boxObject()`、リスト構造には `listFamily()` のヘルパーを使うと、ボイラー
プレートを減らせます。

---

## 翼のモジュールとファクトリ関数

**ほとんどの標準翼は、あらかじめ定義された不変の定数オブジェクト**です(`boldWing`・
`headingWing` など)。追加の設定オプションが必要な一部の翼だけが、ファクトリ関数の形で
提供されます。

```ts
makeImageWing({ allowLocalUrls: true })
makeUploadWing({ allowLocalUrls: true })
```

特定の標準翼の動作(構文ハイライターなど)だけを変えたい場合は、既存の翼オブジェクトをスプ
レッド演算子で展開し、必要な属性だけを上書きできます。

```ts
const wing = { ...codeWing, attach: makeCodeAttach({ highlight: myHighlighter }) }
```

---

## 登録の順序と検証

```ts
const { nabi, registry } = createNabiWith([boldWing, italicWing, kbdWing])
```

**配列内の翼の順序が、そのまま HTML スキャンの優先順位になります。** 外部 HTML を解析する
とき(`claim`)、登録順に検査が行われ、最初に所有権を主張した翼がそのタグを処理します。
どの翼も処理しなかったタグは、タグが取り除かれ内部のテキストだけが残ります。

ツールバーのボタン配置は **ボタングループ(`button.group`)の順序が優先**され、同じグループ
内でのみ翼の登録順に配置されます。

### 検証と例外処理(厳格な検証)

`createNabiWith` は仕様に違反する翼が登録されると、実行時エラーとして後回しにせず
**初期化の時点で即座に例外(Error)を発生**させます。

| 検証項目 | 違反例 |
|---|---|
| 予約語を識別子に使用 | `w: 'p'`、`w: 'br'` |
| 識別子(w)の重複登録 | 同じ `boldWing` を重複して渡す |
| レンダリング関数の欠落 | `place: 'mark'` なのに `toHtml` が未定義 |
| コマンド命名規則違反 | 動詞+名詞のキャメルケース規則違反(例: `insertTable`) |
| 必須の依存翼の欠落 | アップロード翼で `requiresAnyOf` に指定された画像/リンク翼が欠けている |

---

## コマンド(Command) — 純粋関数

文書を変更するすべての操作は、コマンド関数を通じて実行されます。コマンドは **DOM API や
画面レンダリングに依存しない純粋関数**として動作します。

```ts
import { boxObject, insertLump, type Command, type Wing } from 'nabi-note'

const insertStamp: Command = (doc, sel, args, env) => {
  // 外部引数の型を検証
  if (typeof args['text'] !== 'string') return null
  const stamp = { w: 'stamp', a: { t: args['text'] }, ch: [] }
  const r = insertLump(doc, sel.focus, stamp, env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

export const stampWing: Wing = {
  ...boxObject({
    w: 'stamp',
    attrs: { t: (v) => (typeof v === 'string' ? v : null) },
    toHtml: (node, _children, ctx) =>
      ctx.element('span', ctx.escape(String(node.a?.['t'] ?? '')), { 'data-nabi-stamp': '' }),
  }),
  commands: { insertStamp },
  button: {
    group: 'insert',
    label: { ja: 'スタンプ' },
    action: { kind: 'command', command: 'insertStamp', args: { text: '確認' } },
  },
}
```

| パラメータ | 説明 |
|---|---|
| `doc` | 現在の nabi ツリー文書配列(不変オブジェクトとして扱い、直接変更せず新しい文書を返す) |
| `sel` | 現在のキャレットおよび選択範囲の状態(`{ anchor, focus }`) |
| `args` | ツールバーボタンや UI から渡された引数オブジェクト |
| `env` | スキーマ知識と環境コンテキスト |

コマンドは変更後の `{ doc, selection }` オブジェクト、または **`null`** を返します。
**文書に変更がない場合は必ず `null` を返さなければなりません。** `null` を返すと
`applyCommand` は `false` を返し、不要な取り消し履歴が積まれません。返された文書は
`cocoon`(正規化)エンジンを通過するため、スキーマの整合性が保証されます。

呼び出し側はコマンド名で呼びます。

```ts
nabi.applyCommand('insertStamp', { text: '確認' })   // boolean を返す
```

---

## Wing インターフェースの詳細仕様

`Wing` インターフェースは合計 31 個の属性で構成され、**必須属性は 2 個**(`w`・`place`)
です。

### 1. 基本識別と構造

| 属性 | 説明 |
|---|---|
| `w` | 翼の固有識別子(必須、予約語 `p`・`br` を除く) |
| `place` | 翼の種類(必須: `'mark'` インライン書式、`'void'` 中身のないブロック、`'container'` コンテナブロック、`'attr'` 段落属性、`'tool'` 文書に保存されないツール) |
| `basic` | バックエンド/ホスト側の追加連携なしに動作する翼かどうか(`boolean`、既定値 `false`)。`wings().allBasic()` 呼び出し時の絞り込み基準になります |
| `holds` | コンテナ内部で許容する子要素の種類(`'blocks'` または `'inline'`) |
| `singleParagraph` | 内部が単一の段落に固定されるかどうか(表のセルなど) |
| `boolAttrs` | 値が `1` のみで表現される真偽属性の名前一覧 |
| `allows` | コンテナ内部に許可する子翼の名前一覧(未指定時はすべて許可) |
| `noAlign` | ラッパー段落へのテキスト整列適用を遮断するかどうか(`boolean`、ブロックオブジェクト専用)。コードブロックなど `pre` タグの整列崩れを防ぐために使われます |
| `requiresAnyOf` | 一緒に登録されるべき依存翼の一覧(このうち一つ以上の登録が必須) |
| `parts` | 翼の内部に従属する下位構成要素の定義(表の行/列、折りたたみブロックの summary など) |

### 2. 属性と状態管理

| 属性 | 説明 |
|---|---|
| `attrKey` · `attrValues` | 段落属性翼が使う属性キーと、許容される値の一覧 |
| `currentValue` | 現在のキャレット位置の属性値を返す関数(ツールバーボタンのアクティブ状態表示用) |

### 3. シリアライズと入出力

| 属性 | 説明 |
|---|---|
| `toHtml` · `partHtml` | nabi ツリーを HTML に変換するシリアライズ関数 |
| `toMd` | nabi ツリーをマークダウンに変換するシリアライズ関数(任意、未定義の場合は `toHtml` で代用) |
| `partMd` | 下位パーツ(`parts`)のマークダウンシリアライズ関数 |
| `ioFilter` | 翼自身がサポートするファイル入出力およびクリップボードフィルタ |
| `claim` | 入力された HTML マークアップの所有権を判定し、nabi ツリーに変換する関数 |
| `repair` · `partRepair` | JSON 読み込み時にノードの妥当性を検証・補正する関数(`null` を返すとノードが除去される) |

### 4. 入力とイベント制御

| 属性 | 説明 |
|---|---|
| `commands` | 翼が提供するコマンド関数のマップ |
| `onKey` | キャレットがその翼の内部にあるとき、キーボード入力を先取りするハンドラ |
| `escapeKeys` | 次に入力される文字でそのマーク書式から抜けるトリガーとなるキーの一覧 |
| `doubleKeys` | 350ms 以内にキーを2回連続入力したときに実行するコマンドのマッピング(`{ キー名: コマンド名 }`、例: Esc Esc → 書式解除) |
| `inputRules` | 文字入力のパターンに応じて自動的に実行される書式変換規則 |
| `attach` | DOM 要素に直接イベントリスナーを結びつけたり制御したりするフック(表のドラッグ、コードのハイライトなど) |

### 5. UI とスタイル

| 属性 | 説明 |
|---|---|
| `button` · `buttons` | 上部ツールバーに表示されるボタンの定義 |
| `context` | キャレット位置に応じて現れる状況ツールバーの定義 |
| `styles` | その翼が内蔵する CSS スタイルシート文字列 |

---

## IO フィルタ拡張

**IO フィルタ(IoFilter)は文書ノードを直接生成せず、クリップボードの貼り付けとファイルの
保存・読み込み形式を処理する拡張ポイントです。**

| フィールド | 説明 |
|---|---|
| `id` · `label` | フィルタの固有識別子と、UI に表示されるラベル(識別子が重複すると例外が発生) |
| `paste` | クリップボードデータ(`PasteData`)を解析し、貼り付け候補を返す関数 |
| `save` | 保存設定オブジェクト(`{ extension, write, lossy?, mime? }`) |
| `read` | ファイル名とテキストを受け取り、nabi ツリーに解析する関数(一致しない場合は `null` を返す) |

IO フィルタの3つのメソッドはすべて任意です。マウントオプション(`mountSurface`・
`mountFile`)、`createNabiWith({ ioFilters })`、または翼自体の `ioFilter` 属性を通じて
登録でき、**先に登録されたフィルタが優先順位を持ちます。**

---

## 識別子(`w`)の命名規則

`w` は **nabi ツリー内でノードごとに繰り返し保存される識別子文字列**です。シリアライズ容量
を最小限にするため、短い文字列を使うのがよいでしょう(公式翼の `b`・`hl`・`tf` など)。
公式翼との衝突を防ぐため、カスタム翼には `ex` 接頭辞(例: `exNote`・`exStamp`)を使うことが
推奨されます。

::: warning 識別子を変更する際の注意
保存データの `w` フィールドが識別子と直接対応しているため、識別子を変更すると、既存の保存
済み文書データを読み込む際に認識できなくなるおそれがあります。移行が必要な場合は、`claim`
関数で旧バージョンの識別子も併せて処理するようにしてください。
:::

---

## 次のドキュメント

- [インラインマークを作る](./custom/inline) — `claim` · `toHtml` · `escapeKeys`
- [ブロックと段落属性を作る](./custom/block) — `place` · `holds` · `allows` · `parts` · `attrKey`
- [キー・自動変換・貼り付け](./custom/input) — `onKey` · `inputRules` · `attach`
- [UI とやり取り](./custom/ui) — `button` · `context` · `styles`、ユーザーダイアログとの連携

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
