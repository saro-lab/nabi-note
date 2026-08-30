---
title: カスタム wing
description: 永続的な文書機能を追加するための契約と実装手順。
---

# カスタム wing

カスタム wing は単なるツールバーボタンではありません。保存される文書構造、コマンド、HTML と Markdown の変換、インポート規則、画面上の動作をひとまとめにした宣言型の拡張です。registry はエディターが存在する前に宣言を検証し、不正な構造が文書に入らないようにします。

## もっとも狭い factory から始める

多くの書式は完全な宣言を必要としません。値を持たないインライン mark には `simpleMark()`、制限された値の集合を持つ mark には `valueMark()`、子を持たないブロックには `boxObject()`、リストには `listFamily()` を使います。

```ts
import { createNabiWith, simpleMark, wings } from 'nabi-note'

const exStrong = simpleMark({
  w: 'exStrong',
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
})

const { nabi, registry } = createNabiWith(wings().allBasic().use(exStrong))
```

## いくつかの種類の wing を作る

下の例は、それぞれ保存される形が異なります。まず 1 つ登録して `getJson()` と `getHtml()` を確認してください。構造が動いてから、コマンドとボタンを追加します。

### 1. 値を持たないインライン mark: 強調

機能が文字を包むだけなら `simpleMark()` を使います。これは `exStrong` として保存され、`<strong>` として描画されます。

```ts
import { simpleMark } from 'nabi-note'

export const exStrong = simpleMark({
  w: 'exStrong',
  clearable: true,
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
  styles: '.nabi-content strong { font-weight: 700; }',
})
```

`clearable: true` があると、書式を消す操作でこの mark も取り除かれます。ボタンを追加する前に、`nabi.applyCommand()` または別のカスタムコマンドで適用してみます。同じ `.nabi-content strong` セレクターがエディターと公開コンテンツの両方を装飾します。

### 2. 値を持つインライン mark: 状態トーン

色、サイズ、状態のように許可された値から選ぶ機能には `valueMark()` を使います。値は `a.v` に保存され、リスト外の値は `repair()` 中に取り除かれます。

```ts
import { valueMark } from 'nabi-note'

export const exTone = valueMark({
  w: 'exTone',
  key: 'v',
  values: ['quiet', 'loud'],
  clearable: true,
  toHtml: (node, children, ctx) =>
    ctx.element('span', children(), { 'data-ex-tone': String(node.a?.v ?? '') }),
  styles: `
    .nabi-content [data-ex-tone="quiet"] { opacity: .65; }
    .nabi-content [data-ex-tone="loud"] { color: var(--nabi-accent); font-weight: 700; }
  `,
})
```

保存形は `{ "w": "exTone", "a": { "v": "loud" }, "ch": ["Important"] }` です。CSS は保存された値を対象にするため、公開コンテンツも同じように変わります。既存リストから値を気軽に削除しないでください。以前に保存された文書が読み込み時にその値を失うことがあります。

### 3. 子を持たないブロック: 区切り線

画像、動画、区切り線のように、子を持たない独立オブジェクトには `boxObject()` を使います。

```ts
import { boxObject } from 'nabi-note'

export const exDivider = boxObject({
  w: 'exDivider',
  toHtml: (_node, _children, ctx) => ctx.element('hr', ''),
  styles: '.nabi-content hr { border-color: var(--nabi-line); }',
})
```

URL や幅のような値を持つオブジェクトでは、`attrs` に検証を宣言し、必須の値は `requires` に入れます。確認できない値は既定値へ黙って置き換えず、`null` で拒否します。

### 4. 複数段落を持つブロック: callout

文書内容を持つブロックでは `container` を宣言します。`holds: 'blocks'` は段落、リスト、オブジェクトブロックの子を許可します。

```ts
import type { Wing } from 'nabi-note'

export const exCallout: Wing = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      padding: 1rem;
    }
  `,
}
```

この宣言だけでは、選択した段落を包む方法はまだありません。エディター UI に出す前に、`commands` に純粋なコマンドを追加し、それを呼ぶ `button` を追加します。

### 5. 対になるリストと項目

リストと項目が常に一緒に現れる必要がある場合は `listFamily()` を使います。

```ts
import { listFamily } from 'nabi-note'

export const exList = listFamily({
  w: 'exList',
  item: 'exListItem',
  toHtml: (_node, children, ctx) => ctx.element('ul', children(), { class: 'ex-list' }),
  itemHtml: (_node, children, ctx) => ctx.element('li', children()),
  styles: '.nabi-content .ex-list { border-inline-start: 2px solid var(--nabi-line); }',
})
```

`listFamily()` は、リストの中にブロックが入った場合、それを項目で包むよう修復します。チェック状態のように項目レベルの値が必要な場合は、`itemDecl` と `repairItem` を追加します。

### 1 つの順序付き selection に登録する

ブラウザーとサーバーでは、同じ宣言を同じ順序で使います。

```ts
const selected = wings()
  .allBasic()
  .use(exStrong)
  .use(exTone)
  .use(exDivider)
  .use(exCallout)
  .use(exList)

const { nabi, registry } = createNabiWith(selected, { locale: 'ja' })
```

## 名前と文書構造を定義する

文書に入る名前は `ex[A-Z0-9]...` に一致する必要があります。`exCallout` のような名前にしておくと、将来の公式 wing が保存済み内容の意味を変えてしまうことを防げます。

`place` は保存される形を決めます。`mark` はインライン内容を包み、`void` は子を持たないブロック、`container` は子を持つブロック、`attr` は段落属性を変えるもの、`tool` は文書ノードを作らないものです。`container` には `holds: 'blocks' | 'inline'` と `toHtml()` が必要です。

```ts
const exNote = {
  w: 'exNote',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
} as const
```

`attrs`、`boolAttrs`、`allows`、`requiresAnyOf`、`parts` は構造上の制約を宣言します。`parts` 宣言には、各 part に対応する `partHtml` も必要です。値を選ぶ wing の値を制限するには `attrKey` と `attrValues` を使います。

## 宣言オプション一覧

wing に必要なものだけを宣言します。factory がすでに一部の field を補ってくれます。

| 領域 | オプション | 目的 |
| --- | --- | --- |
| 基本 | `w`, `place`, `basic`, `styles` | 名前、構造の種類、basic catalog への所属、基本 CSS |
| 構造 | `holds`, `singleParagraph`, `attrs`, `boolAttrs` | 子の種類、Enter 動作、許可する属性、真偽値属性 |
| 構造 | `parts`, `allows`, `noAlign`, `requiresAnyOf` | 内部 part、許可する子、配置からの除外、wing 依存関係 |
| 値 | `attrKey`, `attrValues`, `currentValue` | 保存値のキーと一覧、現在値の検出 |
| コマンドと入力 | `commands`, `onKey`, `escapeKeys`, `doubleKeys`, `inputRules` | コマンド、キー処理、Escape/二度押し動作、自動書式規則 |
| surface 動作 | `attach` | DOM 動作と cleanup |
| 変換 | `toHtml`, `partHtml`, `toMd`, `partMd` | HTML と Markdown 出力 |
| インポートと修復 | `claim`, `ioFilter`, `repair`, `partRepair` | HTML インポート、ファイル処理、JSON 検証と修復 |
| UI | `button`, `buttons`, `context` | ツールバーとコンテキスト UI 宣言 |
| 書式消去 | `clearable` | 書式を消す操作で削除されるか |

`w` と `place` は常に必須です。ノードを作る `mark`、`void`、`container` wing には `toHtml()` も必要です。container には `holds` が必要で、宣言したすべての part には対応する `partHtml` が必要です。

## HTML、Markdown、JSON を一緒に保つ

`toHtml()` は保存済みノードを HTML に描画し、`toMd()` は Markdown へ書き出します。Markdown builder がない場合は、情報を失わないよう生成された HTML が保持されます。インポート時には `claim()` で、自分の HTML 要素と検証済み属性だけを認識してください。

`repair()` は JSON 読み込み時とコマンド実行後に再び走ります。不正な属性には修正済みノードを返し、保持できないノードには `null` を返します。HTML は `ctx.element()`、`ctx.escape()`、`ctx.url()` で組み立ててください。タグ、属性、URL をこれらの検査の外側で文字列結合してはいけません。

## コマンドと表示動作を分ける

コマンドは文書と選択範囲から次の文書とその中の選択範囲を返す純粋関数です。DOM を読んだり変更したりせず、有効な変更を作れないときは `null` を返します。コマンド名は `insertNote` のように、動詞で始まる lower camel case にします。

表のドラッグ選択のような DOM だけの動作は `attach(host)` に置きます。すべての listener や変更した属性には、すぐに `host.onDispose()` で cleanup を登録してください。途中で setup に失敗しても片付けられるようにするためです。変換入力中の DOM や surface の選択対応付けは変更しないでください。

ツールバーとコンテキストコントロールは `button`、`buttons`、`context` で宣言します。アプリケーション UI 側で同じコマンド規則を重複実装すると、UI と文書モデルがずれることがあります。

## CSS スタイル

wing に必要な基本 CSS は `styles` に置きます。組み込み wing のスタイルはすでに `nabi-note/nabi.css` に含まれています。ブラウザーで選択済み registry のスタイルを組み立てる場合は `collectSheets()` と `injectSheets()` を使えます。SSR では CSS ファイルを link してください。

編集画面と公開コンテンツでは同じ class と data 属性を使います。ただし、編集中の `[data-key]` 構造、`display`、`white-space` は変更しないでください。CSS は見た目だけを変えるべきで、キャレットの対応付けを変えてはいけません。

```ts
const exCallout = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      padding: 1rem;
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      border-radius: var(--nabi-radius);
    }
  `,
} as const
```

`toHtml()` が作る class または data 属性だけを対象にします。サービス固有の変更は、たとえば `.article-body .ex-callout` のように、より狭く指定します。

## 契約全体を検証する

保存した JSON 文書を読み込み直して、同じ構造と HTML になることを確認します。registry が不正な名前、重複コマンド、不足している builder、満たされていない依存関係を拒否することもテストします。不正な HTML インポートと `repair()` 入力、コマンドの選択範囲処理、SSR 出力、スタイルを適用した公開画面も確認してください。

完全な型と factory 引数は、インストール済みの宣言と [English API reference](https://nabi.saro.me/llms/api-reference.md) を確認してください。
