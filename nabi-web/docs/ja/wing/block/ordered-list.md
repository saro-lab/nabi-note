---
title: 番号付きリスト
---

# 番号付きリスト

## 説明

`orderedListWing`(名前 `ol`、ショートカット `N`)は `<ol>` を所有します。項目は
`parts` として一緒に連れてくるので `oli` を別に登録しません。

```ts
parts: { oli: { holds: 'blocks' } }
```

ボタンを押すとキャレットのあるブロック(または選択にまたがるブロックたち)が
番号付きリストに変わり、もう一度押すと普通の段落に戻ります。他のリストの
ボタンを押すとすぐその種類に切り替わります。

段落の先頭で `1. `(数字、ピリオド、スペース)を入力しても同様に番号付き
リストへ自動変換されます。開始番号は自由に入力でき、最大九桁まで認識します。

### ショートカットと編集動作

- `Tab`/`Shift+Tab` でインデント・アウトデントすること、空の項目で Enter を
  押すとリストを終えること、項目の先頭での Backspace が前の項目に合わさる
  ことは、すべて[箇条書き](./bullet-list)と同じです。
- 各項目の番号は HTML の `<ol>` タグがブラウザ上で動的に描くので、途中で
  項目を挿入・削除しても番号は自動的に振り直されます。
- 入れ子のリスト構造はラッパー段落(`<div data-nabi-p>`)を通じて安全に
  入れ子表示されます。

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, orderedListWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翼の一覧がグリフの知識・コマンド・組み立て器を一緒に作る — それが `registry` です
const { nabi, registry } = createNabiWith([orderedListWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## デモ

<WingDemo path="/wing/block/ordered-list" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
