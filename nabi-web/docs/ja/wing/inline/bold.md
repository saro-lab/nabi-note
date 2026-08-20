---
title: 太字
---

# 太字

## 説明

`boldWing` は `<b>` の所有者(claim)です。文字を選んでツールバーの **B** を押すか、
ヒントモード(Shift の二度押しに続けて `B`)で適用すると、その範囲が太字になります。

- 入ってくるときは `<b>` と `<strong>` の両方を認めますが、出ていくときは常に `<b>`
  ひとつです。属性はひとつも残しません — `class`・`style`・`data-*` は落ち、タグだけが
  残ります。
- ヒントモードのショートカットは `B`、加速キーは `Ctrl`/`⌘`+`B`(`mod+b`)です。
- 文字を選んだまま押すとトグル(`toggleMark`)です — すでに全体が太字なら外し、
  そうでなければ適用します。この翼は自分のコマンドを持ちません — ボタンが
  `action: { kind: 'mark' }` なのでコアの `toggleMark` に直接行きます。
- 登録しなければ `<b>` は殻を剥がされ、平文に落ちます(登録されていないタグは
  すべてこうなります — nabi 全体の規則です)。

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, boldWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翼の一覧がグリフの知識・コマンド・組み立て器を一緒に作る — それが `registry` です
const { nabi, registry } = createNabiWith([boldWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## デモ

<WingDemo path="/wing/inline/bold" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
