---
title: 蛍光ペン
---

# 蛍光ペン

## 説明

`highlightWing`(名前 `hl`)は `<mark data-color="...">` の所有者(claim)です。値を
持つインラインマークなので、オン・オフのトグルではなく色を選ぶ枝分かれです —
文字色と同じ筋です。

- **ツールバーのボタン(ショートカット `H`)は黄色を掛けます** — `setHighlight` に
  `{ c: 'yellow' }` を載せて送ります。引数なしで回るボタンではありません。
- だからこのボタンのトグルは **黄色に対するトグル**です。選んだ範囲が **すべて
  黄色のときだけ**外れます — すべて緑の範囲で押すと外れる代わりに黄色に着替わり、
  もう一度押してはじめて外れます。
- キャレットが蛍光ペンマークの中にあると状況行に色見本が六つ出ます — 押すとその場で
  色だけが変わります。別の「消す」欄はこの翼にはありません。同じ色をもう一度押すと
  外れ、書式のクリアは `clearFormatWing` の役目です(別に登録が必要です)。
- **キャレットだけを置いて選んだときは二つに分かれます。** キャレットがすでに蛍光ペン
  マークの中にあれば、そのマークが覆う文章全体が対象になります(範囲を選び直す必要は
  ありません)。マークの外なら掛ける文字がないので **予約**として残り、次に打つ文字が
  その色をまとって出てきます。
- 保存値には色の名前だけが残ります — `data-color="yellow"` のような形です。インライン
  `style` は出ていきません。実際の背景色はこの翼が `styles` として運ぶシートが描き
  (文字色と一揃いを分け合います)、色の値そのものはコアのトークン `--nabi-hl-*` が
  持ちます — ホストはそのトークンを上書きして変えます。
- **一覧の外の値はどこにも乗りません。** コマンドはそもそも回らず、入ってくる HTML で
  一覧にない `data-color` を付けた `<mark>` は殻が剥がれて **文字だけが残ります。**
  `data-color` がまったくない `<mark>` も同じです — 色がそのまま値なので、値のない
  蛍光ペンには立つ場所がありません。
- 手で直した保存値も同じです — `repair` が一覧の外の値に出会うと、そのノードを殻ごと
  取り除きます。

| 色の名前 | 保存値 |
|---|---|
| 黄色 | `yellow` |
| 黄緑 | `green` |
| 水色 | `cyan` |
| ピンク | `pink` |
| 紫 | `purple` |
| オレンジ | `orange` |

この六つが `HIGHLIGHT_COLORS` として書き出されます — 色の値ではなく **名前の配列**
です(`readonly string[]`)。色の値はシートが持ちます。

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, highlightWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翼の一覧がグリフの知識・コマンド・組み立て器を一緒に作る — それが `registry` です
const { nabi, registry } = createNabiWith([highlightWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## デモ

<WingDemo path="/wing/inline/highlight" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
