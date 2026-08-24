---
title: 斜体
---

# 斜体

## 説明

`italicWing` は斜体書式(`<i>`)を扱うインラインマーク翼です。強調や外来語など、文字の
調子を変えたいときに使います。

- 入力時は `<i>` と `<em>` の両方を認識し、出力時は標準の `<i>` タグに統一されます。
- ヒントモード(Shift を2回連打してから `I`)とショートカット `Ctrl`/`⌘`+`I` に対応します。
- テキストを選択した状態で実行するとトグル動作になります。

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
