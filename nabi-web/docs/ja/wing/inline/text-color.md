---
title: 文字色
---

# 文字色

## 説明

`textColorWing`(名前 `tc`)は `<span data-color="...">` の所有者(claim)です。蛍光ペン
と同じ枝分かれで、値を持つインラインマークなのでオン・オフではなく色を選びます。

- **ツールバーのボタン(ショートカット `C`)は緑を掛けます** — `setTextColor` に
  `{ c: 'green' }` を載せて送ります。引数なしで回るボタンではありません。
- だからこのボタンのトグルは **緑に対するトグル**です。選んだ範囲がすべて緑のときだけ
  外れ、他の色が掛かっていれば緑に着替わります。
- キャレットが文字色マークの中にあると状況行に色見本が五つ出ます — 押すとその場で
  色だけが変わります(マークが重なって積み上がりません)。別の「消す」欄はこの翼には
  ありません — 同じ色をもう一度押すと外れ、それ以外は `clearFormatWing` の役目です。
- **キャレットだけを置いて選んだときは二つに分かれます。** マークの中ならそのマークが
  覆う文章全体が対象で、マークの外なら **予約**として残り、次に打つ文字がその色を
  まといます。
- 保存値には色の名前だけが残ります — `data-color="green"` のような形です。インライン
  `style` は出ていきません。色の値はコアのトークン `--nabi-tc-*` が持ち、シートは
  蛍光ペンと一揃いを分け合います。
- 入ってくるとき(`claim`)は `<span>` タグであって、なおかつ `data-color` 属性を持つ
  ものだけを見ます。`data-color` がまったくない `<span>` はこの翼が主張しないので殻が
  剥がれて平文に落ち、**属性はあるのに値が一覧の外なら、そのときも殻が剥がれて文字だけ
  が残ります。**
- 手で直した保存値の一覧の外の値も `repair` が殻ごと取り除きます。
- 蛍光ペンとは互いに別のマークなので、同じ文字に一緒に掛けられます — 蛍光ペンのシート
  が `color` を書かないのがその理由です。

| 色の名前 | 保存値 |
|---|---|
| 緑 | `green` |
| サンゴ色 | `coral` |
| 紫 | `violet` |
| 琥珀色 | `amber` |
| 青 | `blue` |

この五つが `TEXT_COLORS` として書き出されます — 色の値ではなく **名前の配列**です
(`readonly string[]`)。

## 使用例

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, textColorWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// 翼の一覧がグリフの知識・コマンド・組み立て器を一緒に作る — それが `registry` です
const { nabi, registry } = createNabiWith([textColorWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## デモ

<WingDemo path="/wing/inline/text-color" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
