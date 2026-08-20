---
title: 紹介
description: NABI NOTE はブラウザで動作するオープンソースの WYSIWYG エディタです。
---

# NABI NOTE とは?

NABI NOTE はブラウザで動作する **オープンソースの WYSIWYG エディタ**です。

## ナビツリー

HTML でそのまま扱うと、DOM のないサーバー側では処理できないという問題があるため、
**ナビツリー**という JavaScript オブジェクトとして扱われ、JSON・HTML の双方向に
直列化されます。また、ナビツリーと HTML を行き来する過程で XSS の要素が取り除かれます。

> ナビノートが提供するすべての翼は XSS 対策済みですが、`カスタム翼(外部プラグイン)`
> については、その開発者に XSS 対策の有無を確認する必要があります。

<FlowHub :sources="hubSources" :core="hubCore" :targets="hubTargets" caption="" />

## DOM のない SSR(サーバーサイド)対応

保存しておいたナビツリーを **サーバー(Node.js)でそのまま読んで** 送る HTML を組み立て
られます。DOM が必要なのは **入力**(`setHtml()`)と、画面に付ける `mount*` だけです。

表示するだけの場所は、エディタを立てるまでもなく扉ひとつで済みます。受け取るのは保存
内容と `registry`(登録した翼の一覧)の二つで、答えは HTML の文字列です。

**サーバーでは `nabi-note/ssr` を使います** — 描くのに要るものだけが入った入口なので、
編集面と画面の道具がまったく載りません。

```ts
import { makeRegistry, defaultWings, renderStoredHtml } from 'nabi-note/ssr'

// 翼の一覧はサーバーが立つときに一度だけ作ります — 保存内容がいくつあってもこれひとつを使い回します
const registry = makeRegistry(defaultWings)

const saved = [{ w: 'p', ch: ['コメント一行'] }]   // DB から読んだナビツリー
renderStoredHtml(saved, registry)
// '<p>コメント一行</p>'
```

**ナビツリーでなければ `null` を答えます** — 拒否の規則は `setJson()` と同じです。
通過した値はエディタが出す `getHtml()` と **一文字も違いません**。同じ手順(正規化 →
組み立て)を通るためで、だから XSS が濾し取られる場所も同じです。

エディタをサーバーであらかじめ描いておくには、対になる扉を使います — 付くのは `data-key`
だけです。

```ts
import { renderStoredEditorHtml } from 'nabi-note/ssr'

renderStoredEditorHtml(saved, registry)
// '<p data-key="n0">コメント一行</p>'
```

同じ保存内容はいつも同じ `data-key` を得るので、この HTML をそのまま送り、ブラウザで
`mountSurface({ nabi, registry, root, hydrate: true })` が引き継げば画面を描き直しません。
**このサイトのホームのデモが実際にそう動いています** — 最初の画面のドキュメントはサーバー
が描いて送ったもので、エディタはその上で目覚めます。

### 三つの入口

| 導入するもの | 何が入っているか | いつ |
|---|---|---|
| `nabi-note` | エディタ全部 — 組み立て・編集面・画面の道具 | 文章を **書く** 場所 |
| `nabi-note/ssr` | 保存内容を HTML に描くことだけ | サーバー、または読むだけのページ |
| `nabi-note/viewer` | 読む側の動作(表の並べ替え・コードの色付け) | 公開した HTML を **見せる** 場所 |

`nabi-note/ssr` は編集面(`surface`)と画面の道具(`ui`)を **一つのファイルも踏みません**
— 網がソースを検査してそれを守ります。だからサーバーの束に DOM のコードが混ざり込む道が
ありません。

## 書式はすべて翼です

他のエディタで「プラグイン」と呼ばれる単位を **翼(wing)** と呼びます。コアが直接知って
いるのは段落(`p`)と改行(`br`)、そして平文だけで、見出し・リスト・表・太字はすべて翼です。

```ts
import { createNabiWith, parseNodes, boldWing } from 'nabi-note'

const bare = createNabiWith([], { parseHtml: parseNodes }).nabi
bare.setHtml('<p><b>太字</b> <i>斜体</i></p>')
bare.getHtml()
// '<p>太字 斜体</p>'                    — 宣言した翼がないので平文に変わります。

const bold = createNabiWith([boldWing], { parseHtml: parseNodes }).nabi
bold.setHtml('<p><b>太字</b> <i>斜体</i></p>')
bold.getHtml()
// '<p><b>太字</b> 斜体</p>'              — boldWing だけを宣言したので boldWing だけが残り、他は平文に変わります。
```

翼として登録していないマークアップは **平文に変換されます。** そのため宣言していない
HTML は除かれ、ナビが公式に提供するすべての翼は悪意あるスクリプトを取り除きます。


## インターフェース

ドキュメントは `applyCommand()` を通してだけ変えられます。

```ts
nabi.applyCommand('toggleMark', { w: 'b' })     // 太字
nabi.applyCommand('setHeading', { value: 2 })   // 見出しレベル2
nabi.undo()
nabi.redo()
```
コマンドは **成否を `boolean` で返します。** 何も変わらなければ `false` を答え、履歴を
残したり修正を加えたりしません。


## コードの層

**値がこの順序で流れるという意味ではありません。** 下から上へ積み上げた **依存の向き**で、
規則はひとつです — **下の層は上の層を知りません。** だから下側の層(`schema`・`doc`・
`html`)は DOM を踏まず、それがサーバーでそのまま動く理由です。値が出入りする道は上の
ナビツリーの図のとおりです。

<LayerStack
  :layers="layers"
  caption=""
/>

この順序は文章で交わした約束ではなく **網が機械的に守ります** — 層に逆らう import が
一つでも生まれれば、その場でテストが壊れます。


## 用語

| 言葉 | 意味 |
|---|---|
| **マーク(mark)** | 文字装飾 例)`<b>` · `<i>` · `<a>` |
| **ブロック(block)** | 例)段落・見出し・リスト・表・画像 |
| **段落属性(paragraph attribute)** | 段落の属性 例)揃え・ドロップキャップ |
| **ラッパー段落** | 表・リスト・画像のような単一段落オブジェクトを包む段落。 |
| **所有(claim)** | あるマークアップがどの翼のものかを見分ける判定。 |
| **部品(parts)** | 翼内の機能 例)表の行・セル、折りたたみの要約行 |

### 編集画面

| 言葉 | 意味 |
|---|---|
| **キャレット(caret)** | エディタ内の選択カーソル |
| **状況行(context row)** | いまキャレットが選んでいる状態を制御するツールバー 例)表の行・列コマンド、コードの言語欄、リンクのアドレス・名前欄、見出しの H1〜H6 |

### コア

| 言葉 | 意味 |
|---|---|
| **cocoon** | ナビツリーの正規化の段階です。**すべてのコマンドのあとに戻ってきて**、どのコマンドも規則を破ったドキュメントを残せません |
| **付随処理(attach)** | 翼が画面に手を触れる必要があるときに宣言するフックです。例)表のセルのドラッグ、コードの色付け、チェックのトグルはすべてこれです。`mountSurface` が登録された翼のものを一緒に取り付けます |
| **自動変換(input rule)** | 文字を打つだけで起こる変換です。例)ハイフンと空白はリストに、`#` と空白は見出しに |


## 次のドキュメント

- [{{ t('menu_intro_usage') }}](./intro/usage) — 組み立て・入力・出力のすべて
- [{{ t('menu_intro_cdn') }}](./intro/cdn) — ビルドツールなしで `<script>` ひとつで
- [{{ t('menu_wing_custom') }}](./wing/custom) — ない書式を自分で作る

<script setup lang="ts">
import FlowHub from '../.vitepress/ui/FlowHub.vue'
import LayerStack from '../.vitepress/ui/LayerStack.vue'
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

const layers = [
  { name: 'locale', what: '言語' },
  { name: 'code', what: '編集画面と読む側が一緒に使う純粋なトークナイザー' },
  { name: 'schema', what: 'ナビツリーの形と Cocoon の定義' },
  { name: 'doc', what: '挿入・削除・分割・範囲。DOM なし' },
  { name: 'caret', what: 'カーソルの位置・選択・境界' },
  { name: 'html', what: 'ナビツリー ↔ HTML' },
  { name: 'editor', what: 'コマンドインターフェースを持つインスタンス' },
  { name: 'wing', what: '登録時点の Wings 検査' },
  { name: 'wings', what: '公式の翼たち(bold, italic … table, upload…)' },
  { name: 'surface', what: 'キャレット・IME・入力をツリーに合わせる' },
  { name: 'ui', what: 'UI レイヤー' },
  { name: 'viewer', what: '読み取り専用' },
]
</script>
