---
title: 引用
---

# 引用

## 説明

`quoteWing`(名前 `quote`)は引用箱(`<blockquote>`)を所有します。`place: 'container'`
で `holds: 'blocks'` — 中にブロックが住みます。他の物体と同じく引用自身もラッパー
段落をひとつまとって最上位に立ちます。

**`allows` は掛けていません。** 引用の中は最上位と同じ規則なので、表や画像もラッパー
段落をまとってその中に立てます — そういう HTML を貼り付けたり読み込んだりすると、
そのまま生き残ります。

```json
[{"w":"p","ch":[{"w":"quote","ch":[
  {"w":"p","ch":["文章"]},
  {"w":"p","ch":[{"w":"table","ch":[]}]}
]}]}]
```

ただし **挿入ボタンは引用の中には入りません。** 画像・表・区切り線のように
`insertLump` で立つものは、いつも **最上位**に位置を取るので、キャレットが引用の中に
あっても新しい物体は引用の **後ろ**に立ちます。引用の中に入れるには貼り付けを使います。

ボタンを押すと選択がまたがる最上位ブロックすべてを引用で包みます。またがったものが
**すべてすでに引用**のときだけ解けます — 混ざっていれば、まるごともう一度包みます。

行の先頭が `>` だけの状態でスペースを打っても、その行が引用になります — この自動変換
は **スペースがトリガー**です(Enter ではありません)。同じ行に続けて書くものだから
です。

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, quoteWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翼の一覧がグリフの知識・コマンド・組み立て器を一緒に作る — それが `registry` です
const { nabi, registry } = createNabiWith([quoteWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## デモ

<WingDemo path="/wing/block/quote" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
