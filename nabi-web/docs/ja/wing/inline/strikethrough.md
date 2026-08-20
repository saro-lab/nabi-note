---
title: 取り消し線
---

# 取り消し線

## 説明

`strikeWing` は `<s>` の所有者(claim)です。消したけれど残しておきたい値に使います。

- 入ってくるときは `<s>`・`<strike>`・`<del>` の三つをすべて認め、出ていくときは
  いつも `<s>` です。属性はひとつも残しません — `<del datetime="…">` の時刻も
  残りません。
- ヒントモードのショートカットは `S` です。**加速キーはありません** — 同じ
  `emphasis` まとまりの太字・斜体・下線と違い、`Ctrl`/`⌘` の組み合わせは掛かって
  いません。
- 文字を選んだまま押すとトグルです。
- 登録しなければ `<s>` は殻が剥がれて平文に落ちます。

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, strikeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翼の一覧がグリフの知識・コマンド・組み立て器を一緒に作る — それが `registry` です
const { nabi, registry } = createNabiWith([strikeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## デモ

<WingDemo path="/wing/inline/strikethrough" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
