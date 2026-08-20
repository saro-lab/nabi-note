---
title: 見出し
---

# 見出し

## 説明

`headingWing`(id `h`)**ひとつ**が六つのレベルすべてを持っています。見出しは別のノード
ではなく **段落の属性**です — 保存値は `{"w":"p","a":{"h":2}}` で、出ていくときに `<h2>`
になります。

段落がそのまま見出しになるので、揃え・ドロップキャップのような他の段落属性と一緒に
掛かります(`<h2 data-nabi-align="c">`)。

## ツールバーはひとつ、レベルは状況行で

**ツールバーのボタンは `H` ひとつだけです。** 段落で押すと見出し1になり、キャレットが
見出しの中にあると状況行に `見出し`・`H1`〜`H6` の欄が出ます — いま何レベルかが押された
欄として見え、他の欄を押すとそのレベルへ移ります。`見出し` の欄を押すと段落に戻ります。

空の行で `#` をレベルの数だけ(レベル2なら `##`)打ってスペースを押すと、自動的にその
レベルの見出しになります — 打った `#` とスペース自体は消えます。

## 使用例

レベルの選択欄は `mountContextToolbar` が描きます。

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, headingWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翼の一覧がグリフの知識・コマンド・組み立て器を一緒に作る — それが `registry` です
const { nabi, registry } = createNabiWith([headingWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

コマンドで直接掛けることもできます。

```ts
nabi.applyCommand('setHeading', { value: 2 })  // レベル2の見出しに
nabi.applyCommand('setHeading', { value: 2 })  // 同じレベルをもう一度 — 段落に戻る
```

複数の段落を選んで掛けると **選ばれた段落すべて**に掛かります。表・リストのように段落の
場所を占めるものは飛ばされます — 見出しは文章の段落の属性だからです。

## デモ

<WingDemo path="/wing/block/heading" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
