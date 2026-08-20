---
title: 番号付きリスト
---

# 番号付きリスト

## 説明

`orderedListWing`(名前 `ol`、ショートカット `N`)は `<ol>` を所有します。項目は
`parts` として一緒に連れてくるので `oli` を別に登録しません — 配列ではなくレコード
です。

```ts
parts: { oli: { holds: 'blocks' } }
```

ボタンを押すとキャレットのあるブロック(または選択にまたがるブロックたち)を番号付き
リストで包み、もう一度押すと解けます。他のリストのボタンを押すとその種類に着替えます。

行の先頭に数字とピリオドを打ってスペースを押しても(`1. `)同じ結果です。**数字は
いくつでも始まりとして認めますが桁数は九桁まで**で(`1234567890. ` は掛かりません)、
`1.2 ` のようにピリオドの後に何かが続くと掛かりません。空の行である必要はありません
— 見るのはキャレットの前の行の先頭だけで、段落の最初の行でだけ掛かります。

- `Tab`/`Shift+Tab` でインデント・アウトデントすること、空の項目で Enter を押すと
  リストを終えること、項目の先頭での Backspace が前の項目に合わさることは、すべて
  [箇条書き](./bullet-list) と同じです。
- 番号は保存値に入りません — `<ol>` が描くものなので、項目を差し込んだり消したり
  すればブラウザが自動で振り直します。
- 入れ子も本物のマークアップとして保存値にそのまま残ります。項目がブロックを持つので
  文章は段落を一枚まとい、入れ子になったリストはラッパー段落の中に立ちます。
- `start`・`type` のような属性は生き残りません。だから `start="5"` で入ってきた
  リストも 1 から数え直します。

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, orderedListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翼の一覧がグリフの知識・コマンド・組み立て器を一緒に作る — それが `registry` です
const { nabi, registry } = createNabiWith([orderedListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## デモ

<WingDemo path="/wing/block/ordered-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
