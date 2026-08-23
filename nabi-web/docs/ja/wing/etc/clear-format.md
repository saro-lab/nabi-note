---
title: 書式をクリア
---

# 書式をクリア

## 説明

`clearFormatWing` は **完成した定数**です。配列に入れるだけで済みます — 渡すオプションが
ありません。

`place: 'tool'` なので文書に自分のノードを立てません。コマンドひとつ(`clearFormat`)と
ツールバーのボタンひとつがすべてです。

- **取り除く一覧はコアに決められています。** インラインマーク十一(`b`・`i`・`u`・`s`・
  `sub`・`sup`・`hl`・`tc`・`fs`・`tf`・`a`)と段落属性三つ(`h` 見出し・`a` 揃え・`dc`
  ドロップキャップ)です。ホストが一覧を管理する必要はなく、自分で作った翼のマークは
  **ここでは取り除かれません。**
- **範囲を選んで押すと** その区間のマークと、またがる段落の属性を一度に剥がします。
- **キャレットだけのときはひと重ねずつ**剥がします — キャレットのある場所で **いちばん
  内側のマーク**から、そのマークが続く区間だけ。剥がすマークがなければ、そのとき段落
  属性を取り除きます。
- **添付リンクは剥がしません** — `file` 属性を付けたリンク(`a`)はどこでも不可侵です。
  殻を剥がすと添付が死んだ平文になってしまうからです。
- **物体を抱えた段落の揃えは残ります。** 画像・表を抱えたラッパー段落では揃え(`a`)だけ
  は取り除かれません — 書式を消そうとして画像が左に跳ぶことを防ぎます。
- 剥がすものがなければコマンドが `null` を答えます。元に戻す地点が積まれません。

## <kbd>Esc</kbd> 二連打

ツールバーのボタンのほかに **キーボードから入る道がひとつ**あります —
<kbd>Esc</kbd> を続けて二度叩くことです。一文字のヒントも `⌘` の加速キーもこの
身振りを持てなかったので、二連打の宣言(`doubleKeys`)に行き着きました。

- **ボタンを押すのとまったく同じことをします。** 範囲を選んでいればその区間、
  **キャレットだけなら**その場所のひと重ね — 何を剥がすかはコマンドがすでに知っているので、
  キーの側はキャレットの状態で枝分かれしません。
- **発動するのは二度目の叩きの、ちょうどそこです。** 四回叩いても発動は一回きりで、
  二度の叩きの間が 350ms を超えると数え直しになります。キーを押しっぱなしにした連打
  (`repeat`)と IME 変換中の叩きは数えません。
- **優先度は最も低いです。** <kbd>Esc</kbd> が持つ他のすべての仕事(予約の取り消し、
  マークを脱ぐこと)が済んだあとにだけ順番が回ってきます — 蛍光ペンの真ん中で
  <kbd>Esc</kbd> を押すと一度目でマークを脱ぐ予約が掛かり、二度目もそのまま書式を
  消すところまで届きます。
- **効かない場所は五つだけです** — 開いたパネル、覆い(scrim)、全画面、ヒントの
  バッジ、アップロード中のロックです。
- ボタンのツールチップにもそう書いてあります — **「書式をクリア (Esc Esc)」**、
  Shift のバッジと同じ形です。

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, clearFormatWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翼の一覧がグリフの知識・コマンド・組み立て器を一緒に作る — それが `registry` です
const { nabi, registry } = createNabiWith([clearFormatWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## デモ

<WingDemo path="/wing/etc/clear-format" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
