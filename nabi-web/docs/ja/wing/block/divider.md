---
title: 区切り線
---

# 区切り線

## 説明

`dividerWing`(名前 `hr`)は `<hr>` ひとつを所有します。**`place: 'void'`** — 中身の
ない物体なので、キャレットが中に入る場所がありません。区切り線のすぐ前や後ろで
Backspace・Delete を押すと、そのブロックひとつが丸ごと消え、範囲を選んで消しても
同じ結果です。

ボタンを押すと区切り線が **自分のラッパー段落をまとって**立ちます。空の段落がひとつ
一緒にできるわけではありません — キャレットはそのラッパー段落の上、区切り線のすぐ後ろ
に座ります。

立つ場所は、キャレットがあった段落に文字があるかどうかで分かれます。

| キャレットがあった場所 | 結果 |
|---|---|
| 文字のある段落 | その段落の **後ろに**立つ |
| 空の段落 | その段落に **乗り換える** — 空行がひとつも残らない |

空の段落に乗り換えるとき、その段落が持っていた揃えはそのまま生き残ります。

行の先頭にハイフン三つ以上(`---`)だけがある状態で Enter を押しても同じ結果です —
この自動変換は **Enter がトリガー**です。

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, dividerWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翼の一覧がグリフの知識・コマンド・組み立て器を一緒に作る — それが `registry` です
const { nabi, registry } = createNabiWith([dividerWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## デモ

<WingDemo path="/wing/block/divider" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
