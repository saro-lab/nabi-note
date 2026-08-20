---
title: ドロップキャップ
---

# ドロップキャップ

## 説明

`dropCapWing` は段落に `data-nabi-dropcap="1"` を付ける単一値の段落属性です。新しい
ブロックを作らず、すでにある段落に印を載せるだけです。

- 値はオン/オフのひとつだけです — ボタンをもう一度押すと属性が外れます。
- **何行ぶんを包むかを決めるオプションも変数もありません。** コアのシートの
  `::first-letter` 規則ひとつが大きさを固定します — `font-size: 5.9em; line-height:
  .83`。文字が実際に何行を覆うかは、その段落の行間が決めます。
- 効く先が最初の一文字だけなので、Enter はこの属性をマークのように扱います — 段落を
  二つに分けても両方に複製されず、その文字に付いていきます。

大きさを変えるにはその規則を上書きします。

```css
.nabi-content [data-nabi-dropcap="1"]::first-letter { font-size: 4.6em; line-height: .86; }
```

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, dropCapWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翼の一覧がグリフの知識・コマンド・組み立て器を一緒に作る — それが `registry` です
const { nabi, registry } = createNabiWith([dropCapWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## デモ

<WingDemo path="/wing/etc/dropcap" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
