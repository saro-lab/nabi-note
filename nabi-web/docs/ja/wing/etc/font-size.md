---
title: 文字サイズ
---

# 文字サイズ

## 説明

`fontSizeWing`(名前 `fs`)は **インラインの値マーク**です。文字の上に被せる書式であって
段落属性ではありません。出ていくときは `<span data-nabi-size="lg">` として描かれます。

値は `xs`・`sm`・`lg`・`xl` の四つで、標準の大きさは五つめの値ではなく **属性がまったく
ないこと**です。

- 書体(`tf`)と対になっています — 翼ひとつが値のすべてを持ち、選ぶ場所は状況行です。
  ただし書体は欄を四つ並べ、サイズは目盛りひとつを使います。
- **状況行は目盛り(`range`)です。** サイズは順序を持つ値なので(小さい → 大きい)、欄を
  並べる代わりにひとつの取っ手で動かします。いま掛かっている値が取っ手の位置として
  見え、ラベルにその値の名前が一緒に出ます。
- **目盛りのいちばん先頭の欄が「標準」です。** 中央ではなく先頭である理由は、一覧が
  小さいものから大きいものの順で、その前が「何も掛かっていない」場所だからです。この欄
  に移すと `base` のような値が書かれるのではなく **マークが剥がされます。**
- **欄のラベルはロケールに従います** — 日本語では「既定・最小・小・大・最大」です。
- ツールバーのボタンを押すと **`lg`(大きく)** が掛かります。目盛りが小さいものから
  並んでいるのでそのままにすると先頭の欄である `xs` が掛かりますが、サイズのボタンを
  押して文字が小さくなることを望む人はいないからです。
- **キャレットだけのときはその段落全体**に掛かります。サイズは単語ひとつだけを大きく
  することが稀なので、範囲を選ばなければ段落を狙います(蛍光ペン・文字色はこれと違い、
  いまのマークの区間だけを狙います)。
- 文字がひとつもない段落で押すと **予約**として残ります — 次に打つ文字がそのサイズを
  まとって出てきます。
- 同じ値をもう一度掛けると脱ぎます。

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, fontSizeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翼の一覧がグリフの知識・コマンド・組み立て器を一緒に作る — それが `registry` です
const { nabi, registry } = createNabiWith([fontSizeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## デモ

<WingDemo path="/wing/etc/font-size" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
