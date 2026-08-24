---
title: 引用
---

# 引用

## 説明

`quoteWing`(識別子 `quote`)は引用ブロック(`<blockquote>`)を処理します。`place: 'container'` と `holds: 'blocks'` 属性を持つため、通常の段落だけでなく表や画像など他のブロック要素も内部に含めることができます。

```json
[{"w":"p","ch":[{"w":"quote","ch":[
  {"w":"p","ch":["引用テキスト"]},
  {"w":"p","ch":[{"w":"table","ch":[]}]}
]}]}]
```

ツールバーのボタンをクリックすると、選択したブロックが引用ブロックとして囲まれます。選択範囲がすでに引用の場合は、同じボタンで解除されます。

段落の先頭で `> `(不等号記号と空白)を入力すると、その段落が自動的に引用に変換されます。

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
