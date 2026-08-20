---
title: チェックリスト
---

# チェックリスト

## 説明

`taskListWing`(名前 `tl`、ショートカット `K`)は箇条書きとタグ(`<ul>`)を分け合って
いますが、別の実装です — 出ていくとき `data-nabi-list="task"` でチェックリストである
ことを、項目ごとに `data-nabi-checked` でチェック状態を書きます。

項目は `parts` として一緒に連れてきます — 配列ではなくレコードです。

```ts
parts: { tli: { holds: 'blocks', boolAttrs: ['ck'] } }
```

保存値ではチェックは `ck` で、値は `1` だけです — オフの状態は `0` ではなく **欄が
まったくないこと**です。出ていく HTML ではそれが `data-nabi-checked="true"`/`"false"`
に展開されます。

ボタンを押すとキャレットのあるブロック(または選択にまたがるブロックたち)をチェック
リストで包みます。行の先頭に `[ ] ` または `[x] `(大文字小文字は問いません)を打っても
同じ結果で、どちらを打ったかによって最初からチェックの付いた項目で始まります。空の行で
ある必要はなく、段落の最初の行でだけ掛かります。

チェックボックスは `<input>` ではなく CSS で描いた印です — `contenteditable` の中に
本物の input を置くとキャレットが絡まるからです。オンの欄は強調色のタイルの上に白い
✕ で、その行は薄くなり取り消し線が引かれます。

**オン・オフを切り替える場所は欄そのものです** — 項目の先頭にある細い帯(文字ひとつ
分ほど)を押すと変わり、文字の側を押すとただキャレットが行きます。右から左へ書く文章
ではその帯は反対側に立ちます。この動作は翼が `attach` として持っているので **別に
mount するものはありません。**

`Tab`/`Shift+Tab` でインデント・アウトデントすること、空の項目で Enter を押すとリスト
を終えることは [箇条書き](./bullet-list) と同じです。

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, taskListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翼の一覧がグリフの知識・コマンド・組み立て器を一緒に作る — それが `registry` です
const { nabi, registry } = createNabiWith([taskListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## デモ

<WingDemo path="/wing/block/task-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
