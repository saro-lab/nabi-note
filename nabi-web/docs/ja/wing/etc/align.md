---
title: 配置
---

# 配置

## 説明

`alignWing`(id `align`)**ひとつ**が左・中央・右の三つをすべて持っています。ツールバー
では定数です — ひとつにまとめる `align()` ファクトリではなく、値ごとにボタンが別々に
あります。ブロックに `data-nabi-align` 属性を付けます。

- タグはそのままにして属性だけが付く **ブロック属性**です。`<p data-nabi-align="center">`
  のように、段落そのものは変わりません。
- **段落と見出しに掛かります。** `<h2 data-nabi-align="c">` もできます — 見出しも
  ひとつの行だからです。段落属性四つのうち配置だけがそうで、文字サイズ・書体・
  ドロップキャップは今も段落専用です。
- 値は一度にひとつだけです — 左揃えを掛けた状態で中央揃えを押すと、左が外れて中央が
  付きます。掛かっている値をもう一度押すと、属性が丸ごと外れます(既定の配置に
  戻ります)。
- **Enter は配置を両側にそのまま引き継がせます。** 段落を分けると両方の段落が同じ配置
  をまとって出てきます — 見出し(`h`)が空の側から外れ、ドロップキャップ(`dc`)が片側
  だけ付いていくのと違い、配置にはそういう例外がありません。
- 三つはひとつの翼の **ボタン三つ**です(`buttons`) — 別々にオン・オフできず、
  `alignWing` ひとつだけを wings 配列に入れます。
- **表・画像・YouTube の位置もこの翼が付けます。** 物体は自分を抱えるラッパー段落の
  中に住み、その段落が配置を持つので、「中央揃えの画像」はつまり「中央揃えの段落の中の
  画像」ということです。だから画像・表の状況行には配置の欄がそもそもなく、配置だけは
  物体の上にキャレットがあってもツールバーで隠れません。

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, alignWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翼の一覧がグリフの知識・コマンド・組み立て器を一緒に作る — それが `registry` です
const { nabi, registry } = createNabiWith([alignWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## デモ

<WingDemo path="/wing/etc/align" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
