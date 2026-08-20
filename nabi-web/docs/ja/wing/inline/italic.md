---
title: 斜体
---

# 斜体

## 説明

`italicWing` は `<i>` の所有者(claim)です。耳慣れない語や引用のように、筋を変えたい
文字に使います。

- 入ってくるときは `<i>` と `<em>` を併せて認め、出ていくときは `<i>` ひとつに
  まとめます。属性はひとつも残しません。
- ヒントモード(Shift の二度押し)のショートカットは `I` — 物理キー(`KeyI`)で拾うので
  ハングル配列でも効きます。加速キーは `Ctrl`/`⌘`+`I`(`mod+i`)です。
- 文字を選んだまま押すとトグルです。
- 登録しなければ `<i>` は殻を剥がされ、平文に落ちます。

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, italicWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翼の一覧がグリフの知識・コマンド・組み立て器を一緒に作る — それが `registry` です
const { nabi, registry } = createNabiWith([italicWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## デモ

<WingDemo path="/wing/inline/italic" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
