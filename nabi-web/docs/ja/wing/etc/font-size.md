---
title: 文字サイズ
---

# 文字サイズ

## 説明

`fontSizeWing`(名前 `fs`)は文字の大きさを変える**値に基づくインラインマーク翼**です(出力は `<span data-nabi-size="lg">`)。

対応する大きさは `xs`・`sm`・`lg`・`xl` の四段階で、標準の大きさは五つめの値ではなく**属性がまったくないこと**です。

- メインツールバーのボタンを押すと、既定では **`lg`(大きく)** が掛かります。
- キャレットが文字サイズのマークの中にあるとき、動的な状況行にスライダー(`range`)が表示され、「既定」「特に小さく」「小さく」「大きく」「特に大きく」から選べます。スライダーを「既定」に動かすとマークが外れます。
- 範囲を選ばずキャレットだけの状態で大きさを選ぶと、その段落全体に適用されます。

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, fontSizeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

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
