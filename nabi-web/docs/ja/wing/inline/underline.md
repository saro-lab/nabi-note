---
title: 下線
---

# 下線

## 説明

`underlineWing` は `<u>` の所有者(claim)です。

- 認めるタグは `<u>` ひとつです。出ていくときもいつも `<u>` で、属性はひとつも
  残しません。**`<ins>` は受け取りません** — 殻が剥がれて文字だけが残ります。太字
  (`<b>`・`<strong>`)や取り消し線(`<s>`・`<strike>`・`<del>`)のように仲間のタグを
  一緒に受け取るマークではありません。
- ヒントモードのショートカットは `U`、加速キーは `Ctrl`/`⌘`+`U`(`mod+u`)です。
- 文字を選んだまま押すとトグルです。
- 登録しなければ `<u>` は殻を剥がされ、平文に落ちます。
- 下線とリンクは画面の上では見た目が重なることがありますが、互いに別の翼(`a`)が
  所有する別々のマークです — 同じ文字に両方を掛けられます。

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, underlineWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翼の一覧がグリフの知識・コマンド・組み立て器を一緒に作る — それが `registry` です
const { nabi, registry } = createNabiWith([underlineWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## デモ

<WingDemo path="/wing/inline/underline" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
