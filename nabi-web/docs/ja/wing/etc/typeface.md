---
title: 書体
---

# 書体

## 説明

`typefaceWing`(名前 `tf`)は **インラインの値マーク**です。完成した定数なので配列に
入れるだけで済み、渡すオプションがありません。出ていくときは
`<span data-nabi-typeface="serif">` として描かれます。

値は `sans`・`serif`・`mono`・`cursive` の四つ(`TYPEFACES`)です。

- **フォント名をひとつも持っていません。** 選ぶのは **系統**であり、実際にどのフォント
  が出るかは、ホストが `--nabi-font`・`--nabi-font-serif`・`--nabi-font-mono`・
  `--nabi-font-cursive` の四つのトークンに載せた値が決めます。
- 四つの系統を **翼ひとつ**がすべて持っています。選ぶ場所は状況行の欄四つ(`select`)で、
  そこへ入る道としてツールバーのボタンがひとつあります。ボタンを押すと `serif` が
  掛かります。
- **何も掛かっていない文章は `--nabi-typeface-base` をまといます。** このトークンが
  エディタ全体の下地の書体で、触らなければ `--nabi-font` に従います。「標準」を選ぶ欄は
  別にありません — 掛かっている系統を **もう一度選ぶと剥がれて**その場所に戻ります。
- 選ぶ欄は **自分が指す顔で**描かれます。セリフの欄はセリフで、等幅の欄は等幅で書かれて
  いるので、名前を知らなくても何を選ぶのか見えます。
- **キャレットだけのときはその段落全体**に掛かります。文字がひとつもない段落では予約
  として残り、次に打つ文字がその書体をまといます。

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, typefaceWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翼の一覧がグリフの知識・コマンド・組み立て器を一緒に作る — それが `registry` です
const { nabi, registry } = createNabiWith([typefaceWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

ホストが載せるフォントは CSS の一箇所です。ひとつの系統にフォントを何枚も積んでおくと、
ブラウザが文字ごとに前から順に見ていき、その文字を持つ最初のフォントで描くので、どの
言語を書き入れても、その系統の形が保たれます。

```css
:root {
  --nabi-font: 'Noto Sans', 'Noto Sans KR', 'Noto Sans JP', system-ui, sans-serif;
  --nabi-font-serif: 'Noto Serif', 'Noto Serif KR', Georgia, serif;
  --nabi-font-mono: 'Noto Sans Mono', ui-monospace, monospace;
  --nabi-font-cursive: 'Caveat', 'Gaegu', cursive;
}
```

## デモ

<WingDemo path="/wing/etc/typeface" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
