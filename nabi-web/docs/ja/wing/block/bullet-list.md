---
title: 箇条書き
---

# 箇条書き

## 説明

`bulletListWing`(名前 `ul`、ショートカット `L`)は `<ul>` を所有します。項目は `parts`
として一緒に連れてくるので `li` を別に登録しません — 配列ではなくレコードです。

```ts
parts: { li: { holds: 'blocks' } }
```

ボタンを押すとキャレットのあるブロック(または選択にまたがるブロックたち)をリストで
包み、もう一度押すと解けて段落に戻ります。他のリストのボタンを押すとその種類に着替え
ます。

行の先頭にハイフンひとつを打ってスペースを押しても(`- `)同じ結果です。**空の行である
必要はありません** — 見るのはキャレットの前の行の先頭だけなので、`- あとの文` で
スペースを打っても掛かり、後ろの文はそのまま項目の中に残ります。ただし段落の **最初の
行**でだけ掛かります。

- `Tab` はすぐ上の兄弟項目の下へ一段インデントします。最初の項目には入る場所がないので
  何も起こりません — リストの中では `Tab` が空白を入れません。
- `Shift+Tab` は親の次の兄弟へアウトデントします — 最上位でアウトデントするとリストから
  抜けて段落になります。複数の項目にまたがって選択していれば、またがった項目すべてが
  一緒に動きます。
- **空の項目で Enter を押すとアウトデントです** — 最上位だったならリストはそこで終わり、
  キャレットはその下の新しい段落に立ちます。リストを終える方法がこれです。
- **項目の先頭で Backspace を押すと前の項目に合わさります。** 合わせる前の項目がなければ
  アウトデントに落ちます。項目の末尾での Delete は逆に次の項目を引き寄せます。
- 項目の中はブロックなので段落が一枚入ります。マーク(太字など)や他のインラインの翼は
  その段落の中でそのまま使えます。
- タグが持っていた `type` のような属性は生き残りません。リストの中に項目でないものが
  入ってくると、捨てずに項目ひとつで包みます。
- チェックリストとタグ(`<ul>`)を分け合っていますが、互いに別の翼です — 印の属性で
  分かれます(`data-nabi-list="task"` があればチェックリスト)。

## 入れ子は本物のマークアップです

構造が保存値にそのまま残ります。ただし **項目は文章ではなくブロックを持つので**、
文章は段落を一枚まとい、入れ子になったリストはラッパー段落の中に立ちます。

```html
<li><p>あ</p><div data-nabi-p><ul><li><p>い</p></li></ul></div></li>
```

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, bulletListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翼の一覧がグリフの知識・コマンド・組み立て器を一緒に作る — それが `registry` です
const { nabi, registry } = createNabiWith([bulletListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

`li` は `parts` として自動的に付いてくるので、配列に直接入れません。

## デモ

<WingDemo path="/wing/block/bullet-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
