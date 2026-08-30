---
title: コード
description: 複数行のコードと、構文ハイライト用の言語情報を保存します。
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# コード

複数行のコードを通常の本文と分けて挿入します。空の段落でバッククォート 3 つを入力して Space または Enter を押すか、ツールバーからコードブロックに切り替えます。バッククォートの後に `ts` のような言語名を付けると、その名前も一緒に保存されます。

言語名は構文ハイライトに使う識別子で、登録されたリスト外の名前も手入力できます。コードの内容とインデントを保つ必要があるため、コードブロックには段落配置を適用しません。

<WingDemo path="/wing/block/code" />

```ts
const selected = wings().use('code').build()
```

## コードハイライターを接続する

コードブロックを登録すると、エディター内では基本の色付けが使われます。公開画面でも色付けするには `nabi-note/viewer` を接続します。viewer は `pre > code` を探し、親要素の `data-nabi-lang` 値を言語名として読みます。その値がない場合は、`code` 要素の `language-...` クラスを確認します。

```ts
import { attachViewer } from 'nabi-note/viewer'

const viewer = attachViewer(article, {
  locale: 'ja',
})

// 公開 HTML を差し替えた後
viewer.refresh()

// 画面を閉じるとき
viewer.unmount()
```

別のハイライターがない場合や、そのハイライターが対象言語を処理できない場合は、依存関係のない内蔵トークナイザーが代わりに色付けします。ハイライターが挿入するトークン用の span は画面上にだけ存在し、保存 JSON や公開 HTML の元データには残りません。`refresh()` と `unmount()` はこの span を取り除き、現在の元コードから再接続します。

### NABI Web サイトでの Shiki 接続

NABI Web サイトでは、Shiki が初期画面や SSR バンドルに入らないよう、ハイライターを動的に読み込みます。`nabi-web/docs/.vitepress/src/highlight.ts` の `loadCodeHighlighting()` は Shiki core を作り、実際にその言語のコードが必要になったときだけ言語文法を取得します。下の例は、公開画面で使っているのと同じ接続方法です。

```ts
import { attachViewer } from 'nabi-note/viewer'
import { loadCodeHighlighting } from '../src/highlight'

const highlighting = await loadCodeHighlighting()
const viewer = attachViewer(article, {
  locale: 'ja',
  highlight: highlighting?.highlight,
})

const stop = highlighting?.onGrammarLoaded(() => viewer.refresh())

// 画面を閉じるとき
stop?.()
viewer.unmount()
```

ある言語に初めて出会うと文法のダウンロードが始まり、その間は内蔵トークナイザーまたはプレーンテキストで表示されます。文法が到着すると `onGrammarLoaded()` が `viewer.refresh()` を呼び、もう一度色付けします。そのため必要な言語だけを読み込み、遅れて届いた文法もページ移動なしで反映できます。

エディター側も同じ `highlight` 関数を使います。NABI Web サイトのデモでは、既定の `codeWing` の `attach` だけを `makeCodeAttach({ highlight, version })` に置き換えています。`version` は文法が 1 つ届くたびに変わる値で、すでに描画されたコードも再度色付けするための印です。独立したサービスでは、まず公開画面の接続だけを実装し、編集中にも Shiki の色付けが必要な場合にこの方法を追加すれば十分です。

## CSS スタイル

コードブロックは `.nabi-content pre`、コードは `.nabi-content pre > code` で装飾します。`white-space` はコードの改行と編集に影響するため変更しないでください。トークン色は `[data-nabi-token]` セレクターで変更できます。

```css
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
```
