---
title: コード
---

# コード

## 説明

`codeWing`(識別子 `code`)はコードブロック(`<pre><code>`)を処理する不変の翼オブジェクトです。

`holds: 'inline'` のコンテナで、内部のテキストは `repair` の段階で純粋なテキストに正規化されるため、他のインラインマークやブロックが入り込みません。

空の行で ` ``` ` を入力してスペースか Enter を押すとコードブロックに変換されます(` ```ts ` のように言語識別子を一緒に入力すると、その言語が自動的に設定されます)。<kbd>Tab</kbd> と <kbd>Shift</kbd>+<kbd>Tab</kbd> でコード行のインデントを増減でき、複数行を選択している場合は一括で適用されます。Enter キーを押すと前の行のインデント幅が自動的に引き継がれます。

キャレットがコードブロック内にあるとき、動的コンテキストツールバーが有効になり、言語を直接入力する欄、「言語なし」ボタン、よく使う主要言語のショートカットボタンが表示されます:

```
javascript typescript jsx tsx · python java kotlin swift
c cpp csharp go rust · php ruby sql
html xml css scss · json yaml toml markdown
bash powershell dockerfile diff
```

上のリストにない言語でも入力フォームに直接言語名を入力でき、入力された値はそのまま文法ハイライターに渡されます。

## 色付けは翼に差し込みます

`highlight` オプションはソースコードと言語を受け取り、トークン配列を返すフック関数です:`(source, lang) => { text: string, type?: string }[]`。

トークンの `type` は `CODE_TOKEN_TYPES` に定義された14種類の標準トークン型のいずれかを返します(`keyword`、`string`、`number`、`comment`、`function`、`class`、`variable`、`operator`、`punctuation`、`tag`、`attribute`、`literal`、`regexp`、`meta`)。

コアのスタイルシートは `[data-nabi-token="…"]` セレクタで、既定の5種類のトークン(`comment`、`string`、`keyword`、`number`、`literal`)にテーマカラーを与えます。ダークモードやカスタムカラーを適用するには、そのCSSセレクタを上書きできます。

```css
.dark .nabi-content [data-nabi-token="keyword"] { color: #c9a0ff; }
```

Shiki や Prism など外部のハイライターを接続するときは、`makeCodeAttach` を使って `attach` フックを構成します。

```ts
import { codeWing, makeCodeAttach } from 'nabi-note'

const wing = { ...codeWing, attach: makeCodeAttach({ highlight: myHighlighter }) }
```

Shiki のように文法バンドルを非同期で読み込む場合は、`version` オプションを渡すことで、文法の読み込みが完了したときにエディタ画面を再度ハイライトできます:

```ts
let grammarAge = 0
const wing = {
  ...codeWing,
  attach: makeCodeAttach({ highlight: myHighlighter, version: () => grammarAge }),
}

// 非同期の言語文法読み込みが完了したとき
grammarAge += 1
```

保存されるHTML構造は標準形式に従います:`<pre data-nabi-lang="ts"><code class="language-ts">`。各トークンは `data-nabi-token` 属性で安全にマークアップされます。

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, codeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翼の一覧がグリフの知識・コマンド・組み立て器を一緒に作る — それが `registry` です
const { nabi, registry } = createNabiWith([codeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## デモ

<WingDemo path="/wing/block/code" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
