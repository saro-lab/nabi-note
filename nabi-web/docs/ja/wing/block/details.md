---
title: 折りたたみ
---

# 折りたたみ

## 説明

`detailsWing`(名前 `details`、ショートカット `D`)は折りたたみ箱(`<details>` +
`<summary>`)を所有します。要約行は `parts` として一緒に連れてくるので別に登録しません
— 配列ではなくレコードです。

```ts
parts: { summary: { holds: 'inline' } }
```

ボタンを押すとキャレットがまたがるブロックたちが新しい折りたたみ箱に包まれ、空の要約行
が先頭に立ちます。要約行で Enter を押すと内容へ下ります(要約行自体は分かれません)。

**エディタは保存されるとおりの姿で描きます。** 閉じた状態で保存された箱はエディタでも
閉じていて、三角を押すとその場で開いたり閉じたりします — その押下がそのまま保存値
(`o`)を変えます。閉じるときにキャレットが中にあれば、キャレットは箱の外に出ます。

::: tip 状況行はありません
以前は **開いたまま保存**・**閉じたまま保存**という二つのボタンがありました。画面が
いつも開いて描いていた頃は、どちらで保存されるかを伝える手立てがそれしかなかった
からです。いまは画面が保存値そのままを描き、三角がそれを変えるので、同じことを二度
言う場所になり取り除かれました。
:::

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
