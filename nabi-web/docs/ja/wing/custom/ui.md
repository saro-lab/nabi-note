---
title: UI と連携
description: ツールバーボタン(button)、コンテキストツールバー(context)、翼専用スタイルシート(styles)の連携方法を案内します。
---

# UI と連携

翼がユーザーインターフェース(UI)を提供する領域は3つです: **メインツールバー**(`button`/`buttons`)、**コンテキストツールバー**(`context`)、**翼専用CSS**(`styles`)。

---

## ツールバーボタン(`button` / `buttons`)

```ts
button: {
  group: 'emphasis',                   // 所属するボタングループ(必須)
  svg: '<path d="…"/>',                // 16×16 viewBox 内の SVG path 文字列
  label: { ja: '太字' },
  shortcut: 'B',                       // ヒントモード(Shift 二連打)で表示される文字
  accelerator: 'mod+b',                // キーボードショートカット(Ctrl/⌘ の組み合わせ)
  action: { kind: 'mark' },            // インラインマークを切り替える動作
}
```

ひとつの翼が複数のボタンを提供するときは `buttons` 配列で定義します(例: テキスト揃えの翼が左/中央/右の3つのボタンを提供する場合)。各ボタンは `name` で区別し、`value` にそのボタンが表す値を指定します。

### ボタングループ(`group`)の順序

ツールバーのボタングループが描画される順序は次のように固定されています:

```
font · heading · emphasis · script · color · link ·
align · list · structure · media · container · clear · file
```

翼を配列のどこに宣言しても、ボタンは所属グループの位置に自動的に配置され、同じグループ内でのみ翼の登録順に並びます。一覧にない新しいグループ名を指定すると、ツールバーの末尾に新しいグループが追加されます。

特定のグループに属するボタンが現在の状態で全て隠れると、そのグループと区切り線も自動的に隠れます。

### ボタンアクション(`action`)の種類

| `kind` | 動作の説明 | 追加のプロパティ |
|---|---|---|
| `'mark'` | インラインマークを切り替える(コアの既定ロジックで動作) | — |
| `'command'` | 指定したコマンドを実行 | `command`、`args?` |
| `'menu'` | ドロップダウンの値選択メニューを表示 | `command`、`argKey`、`values` |
| `'grid'` | 表挿入用の行×列グリッドピッカーを表示 | `command`、`rowsKey`、`colsKey`、`max?` |
| `'prompt'` | 入力ポップアップを開き、入力値をコマンドに渡す | `command`、`fields` |
| `'file'` | ファイル選択ダイアログを開く | `accept?`、`multiple?` |
| `'host'` | ホストのコールバック(`mountToolbar` の `onHost`)に渡す | — |

`action` を定義していないボタンは、クリックしても何も起こりません。

### ショートカット(`shortcut` と `accelerator`)

| 項目 | 形式 | 規則 |
|---|---|---|
| `shortcut` | `'B'` | ラテン**大文字または数字1文字** |
| `accelerator` | `'mod+b'` | `mod+` の後に**小文字1文字** |

異なる翼が同じショートカットを重複して宣言すると、初期化時に即座に例外が発生します。

`accelerated` オプションを指定すると、ショートカットで実行したときだけ別の動作に分岐できます(例: ボタンクリックではオプションのモーダルが開き、ショートカット入力では既定値がそのまま適用される、というように)。

::: warning ショートカットは指定した編集領域の内部でのみ動作します
ショートカットのイベントは、`mountToolbar({ surface })` に渡された編集領域内部で発生したキー入力のみを検知します。1ページに複数のエディタが存在するときは、`surface` オプションを必ず指定しないとキーイベントが互いに干渉します。
:::

---

## ボタンの「押されている(Pressed)」状態の表示規則

ツールバーボタンが「現在アクティブ(Pressed)」と表示される基準は、翼の種類(`place`)によって決まります:

| `place` | アクティブ判定の基準 |
|---|---|
| `'mark'` | 現在のカーソル位置にそのインラインマークが適用されているか |
| `'attr'` | 現在の段落ノードの `currentValue` の返り値がボタンの `value` と一致するか |
| `'container'`・`'void'` | 現在のカーソルがその物体の内部または上に位置しているか |
| `'tool'` | 常に非アクティブ状態を維持 |

複数の値を持つ翼(見出し、揃えなど)は、`currentValue` 関数が返した文字列と一致する `value` を持つボタンだけがアクティブ状態として塗られます。

```ts
currentValue: (node) => {
  const h = node.a?.['h']
  return typeof h === 'number' && h >= 1 && h <= 6 ? String(h) : undefined
}
```

---

## ボタンの自動非表示ルール

エディタコアは、書式を適用できない状況では関連するツールバーボタンを自動的に無効化または非表示にします:

- **コードブロック内部のように書式が制限された領域**では、インラインマークや他のブロック作成ボタンが自動的に隠れます。
- 物体(画像・表など)のラッパー段落では、見出しなどの段落属性が隠れます(ただし**テキスト揃え(`a`)は物体自身を揃えるための例外として残ります**)。
- 上位コンテナの `allows` 許可リストに含まれない翼のボタンは自動的に隠れます。

---

## 動的コンテキストツールバー(`context`)

現在カーソルが置かれている要素に特化した設定ツールを提供する補助ツールバーです(例: 画像クリック時のサイズ調整スライダー、リンククリック時のURL入力フォーム、表内部にカーソルがあるときの行/列追加ボタン)。

```ts
context: {
  title: { ja: 'ノート' },
  controls: [
    {
      kind: 'select',
      name: 'tone',
      label: { ja: 'トーン' },
      command: 'setNoteTone',
      argKey: 'value',
      attr: 't',                                    // 現在の値を読み取るノード属性キー
      values: [
        { value: 'info', label: { ja: '通知' } },
        { value: 'warn', label: { ja: '注意' } },
      ],
    },
  ],
}
```

### コンテキストツールバーコントロールの種類(`ContextControl`)

| `kind` | コントロールの形 | 主なプロパティ |
|---|---|---|
| `'button'` | 単純なボタンクリック | `command`、`args?` |
| `'toggle'` | トグルスイッチ(ON/OFF) | `command`、`token` |
| `'select'` | ドロップダウン選択メニュー | `command`、`argKey`、`values`、`attr?` |
| `'range'` | スライダーバー(幅調整など) | `command`、`argKey`、`values`、`rest?`、`readout?` |
| `'text'` | テキスト入力欄(リンクURLなど) | `command`、`argKey`、`initial?`、`placeholder?`、`validate?` |
| `'prompt'` | 複合フォーム入力ポップアップ | `command`、`fields` |
| `'lightbox'` | 画像拡大ポップアップ | `src`、`alt?` |

すべてのコントロールは共通で `name`(必須)、`label?`、`svg?`、`tip?`、`visible?` プロパティをサポートします。`visible(node)` 関数によって、特定の条件(例: セルが結合されているときだけ「結合解除」ボタンを表示)に応じてコントロールの表示・非表示を動的に制御できます。

---

## 翼専用スタイル(`styles`)

翼が必要とするCSSスタイルを自身に内蔵できます。

```ts
styles: `
  .nabi-content aside[data-nabi-note] {
    border-left: 3px solid var(--nabi-accent);
    padding: 0.5rem 1rem;
    margin: 1rem 0;
  }
`
```

`collectSheets(registry)` と `injectSheets(document, sheets)` を使えば、登録された翼のスタイルだけを文書に動的に注入できます。同じスタイル文字列は重複して注入されません。

---

## ユーザー対話ダイアログとの連携(`ask`)

```ts
const { nabi, registry } = createNabiWith(wings, {
  ask: {
    message: (text) => window.alert(text),
    confirm: (text) => window.confirm(text),
  },
})
```

- `message`: 単純な通知の表示(`(text: string) => void`)
- `confirm`: 確認/キャンセルの選択(`(text: string) => boolean | Promise<boolean>`)
- `choose`: 複数選択肢からの選択(`(question: string, options: ChooseOption[]) => number | Promise<number>`)

`ChooseOption` の形は `{ label: string, icon?: string }` で、返り値は選ばれた選択肢の0始まりのインデックス(キャンセル時は `-1`)です。

::: warning ask ハンドラを指定しないときの既定動作
`ask` ハンドラを渡さない場合、`confirm` の既定の返り値は安全のため `false`(キャンセル)になります。`choose` はハンドラがない場合、既定で最初の候補(インデックス `0`)が選ばれます。貼り付け形式の選択などのUIは、`mountToolbar` がマウントされる際にコア内蔵の専用UIが自動的にバインドされるため、通常の環境では `choose` を自分で実装する必要はありません。
:::

---

## 次のドキュメント

- [インラインマークを作る](../custom/inline) · [ブロックと段落属性を作る](../custom/block) · [キー・自動変換・貼り付け](../custom/input)
- [スタイルのカスタム](../../style/custom) — CSS変数とテーマガイド

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
