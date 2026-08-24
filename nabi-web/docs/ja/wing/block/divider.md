---
title: 区切り線
---

# 区切り線

## 説明

`dividerWing`(識別子 `hr`)は横の区切り線(`<hr>`)を処理します。`place: 'void'` オブジェクト
のため内部にテキストは入らず、区切り線の直前や直後で Backspace または Delete を押すと
区切り線ブロック全体が削除されます。

ボタンをクリックすると区切り線が**専用のラッパー段落(`<div data-nabi-p>`)に包まれて**
挿入されます。キャレットは区切り線の直後に置かれます。

挿入位置はキャレットが置かれていた段落の状態によって変わります:

| キャレットの位置 | 挿入動作 |
|---|---|
| 文字のある段落 | その段落の**後ろに**新しい区切り線を挿入 |
| 空の段落 | その空の段落を**区切り線に置き換える**(不要な空行を防ぐ) |

空の段落を置き換える際、その段落に設定されていたテキスト揃えはそのまま維持されます。

空行でハイフンを3つ以上入力してEnterキーを押すと(`---` + Enter)区切り線に自動変換されます。

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
