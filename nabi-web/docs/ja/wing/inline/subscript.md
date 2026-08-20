---
title: 下付き文字
---

# 下付き文字

## 説明

`subscriptWing` は `<sub>` の所有者(claim)です。化学式や、下げて書く番号に使います。

- 認めるタグは `<sub>` ひとつです。属性は残しません。
- ヒントモードのショートカットも加速キーもありません。ツールバーのまとまりは
  `script` で、上付き文字と並んで立ちます(登録順どおり上付き文字が先です)。
- 文字を選んだまま押すとトグルです。
- 見た目はこの翼が `Wing.styles` として運ぶシートが出します。

```css
.nabi-content sub, .nabi-content sup { font-size: .72em; line-height: 0; position: relative; }
.nabi-content sub { vertical-align: sub; }
```

**このシートは上付き文字と分け合う一揃いです。** 二つの翼が同じ文字列を持っていて、
両方を登録しても文書には **一度だけ**載ります(`collectSheets` が同じ文字列のシートを
取り除きます)。保存値(HTML)には `<sub>` タグだけが残り、スタイル自体は載りません。

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, subscriptWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翼の一覧がグリフの知識・コマンド・組み立て器を一緒に作る — それが `registry` です
const { nabi, registry } = createNabiWith([subscriptWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## デモ

<WingDemo path="/wing/inline/subscript" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
