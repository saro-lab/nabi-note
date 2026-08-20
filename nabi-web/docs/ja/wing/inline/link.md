---
title: リンク
---

# リンク

## 説明

`linkWing`(id `a`)は `<a href>` を所有します。ボタンを押すとキャレットの位置の
近くにアドレス入力レイヤーが開き、`http`/`https` で始まるアドレスだけが確定を有効に
します — このホワイトリスト検査そのものが XSS 防御です(`javascript:` のような
スキームはそもそも通りません)。検証を通らなかった `href` は保存されず、その場合は
`<a>` タグなしの平文として出ていきます。

レイヤーには欄がふたつあります — アドレスと表示される文字です。文字の欄を空にすると
アドレスがそのまま文字になり、キャレットだけで選んだ文字がない場合はキャレットの入った
リンクマーク全体が対象になります(蛍光ペン・文字色と同じ規則)。

## すでにあるリンクは状況行で直します

キャレットがリンクの中に立つと、状況行に **文字の欄がふたつ**出ます — パネルを開く
ボタンではなく、その行の中に直接立つ入力欄(`kind: 'text'`)です。今の値が入ったまま
出てきて、Enter を打つか別の場所を押すと反映されます。値がそのままなら何もしません。

| 欄 | すること |
|---|---|
| アドレス | アドレスだけを変えます。表示される文字はそのまま残ります。 |
| 表示名 | 表示される文字だけを変えます。アドレスと添付の印はそのまま残ります。 |

**添付(ファイルリンク)にはアドレスの欄が出ません** — そのアドレスはアップロードが
決めたものであって、手で直す値ではないからです。名前の欄は、普通のリンクでも添付でも
同じように出ます。空の名前は受け付けません — 名前のないリンクを作ることは、名前の
変更ではなく削除だからです。

## 添付は画面でひとかたまりです

添付はまるごと扱われます。クリックするとキャレットがその中に降りる代わりに **リンク
全体が狙われ**、すぐ横でバックスペースや delete を押すと **リンクがまるごと消えます。**
直す作業はキャレットではなく状況行の仕事です。

この動作は翼が `attach` として持っていて `mountSurface` が一緒に付けます —
**別に mount するものはありません。**

## 添付の印

アップロードから入ってきたリンクは `data-nabi-file` の印(値は拡張子)を付けます —
シートに下線ではなくクリップの箱を描かせるのがこの印です。名前を変えてもアドレスを
変えても、この印は付いてきます。書式のクリアも添付だけは剥がしません — 殻を剥がすと
添付が死んだ平文になってしまうからです。

`linkWing` は **定数**です — 括弧を付けて呼ばず、渡すオプションもありません。

::: warning リンクには `allowLocalUrls` が届きません
`blob:`・`data:` のアドレスを開くスイッチは **画像にだけ**効きます。出ていく場所は
いつも厳格で、`getHtml()` がアドレスを濾すときに使う扉(`ctx.url`)は、ホストが何を
有効にしていてもホワイトリストのまま見ます。

だから `blob:` のアドレスを付けた添付リンクは **書き出す瞬間に平文へ落ちます。**
アップロードが一時的なアドレスをそのままにしてはいけない理由がこれです — アップロード
後に受け取った本当のアドレスに差し替えてはじめて文書に残ります。
:::

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, linkWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翼の一覧がグリフの知識・コマンド・組み立て器を一緒に作る — それが `registry` です
const { nabi, registry } = createNabiWith([linkWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## デモ

<WingDemo path="/wing/inline/link" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
