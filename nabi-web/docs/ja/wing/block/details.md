---
title: 折りたたみ
---

# 折りたたみ

## 説明

`detailsWing`(識別子 `details`、ショートカット `D`)はアコーディオン形式の折りたたみブロック
(`<details>` + `<summary>`)を処理します。要約行(`<summary>`)は `parts` 属性として内蔵されて
いるため、別途登録する必要はありません。

```ts
parts: { summary: { holds: 'inline' } }
```

ツールバーのボタンをクリックすると、キャレットが触れているブロックが折りたたみブロックで
包まれ、先頭に空の要約行が作られます。要約行で Enter を押すと本文の内容領域へ移動します
(要約行の中では改行によって分割されません)。

**エディタの編集画面でも実際の保存状態どおりに描画されます。** 閉じた状態(`open` 未設定)
で保存されたブロックはエディタでも閉じたまま読み込まれ、左側の矢印アイコンをクリックすれ
ばいつでも開閉できます(矢印をクリックすると、その場でナビツリーの `o` 属性が変わります)。
ブロックを閉じるときにキャレットが本文の中にあった場合、キャレットはブロックの外へ安全に
移動します。

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, detailsWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翼の一覧がグリフの知識・コマンド・組み立て器を一緒に作る — それが `registry` です
const { nabi, registry } = createNabiWith([detailsWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## デモ

<WingDemo path="/wing/block/details" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
