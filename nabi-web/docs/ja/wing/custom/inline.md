---
title: インラインマークを作る
description: place 'mark' — 文字の上に被せる書式。出ていく道(toHtml)と入ってくる道(claim)を一緒に書きます。
---

# インラインマークを作る

`place: 'mark'` は **文字の上に被せる書式**です。場所を占めず、文章の流れを切らず、
重ねることができます — 太字・斜体・蛍光ペンがすべてこの種類です。

---

## すべて揃ったマークひとつ

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),
    button: {
      group: 'emphasis',
      label: { ja: 'キー' },
      shortcut: 'K',
      action: { kind: 'mark' },        // トグルはコアが行います — コマンドを書かなくても済みます
    },
    styles: `.nabi-content kbd {
      font-family: var(--nabi-font-mono, monospace);
      border: 1px solid var(--nabi-line); border-radius: .25em; padding: 0 .3em;
    }`,
  }),
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

`simpleMark` が埋めてくれるのは `place: 'mark'` と `escapeKeys: ['Escape']` の二つです。
残りはそのまま渡されます。

---

## 二つの向きは別々に書きます

| | 向き | なければ |
|---|---|---|
| `toHtml` | 文書 → HTML | **登録が死にます。** ノードを立てる翼は描き方を持たなければなりません |
| `claim` | HTML → 文書 | 描かれはしますが **読み込み直せません。** 保存して読み込むと殻が剥がれます |

標準のマーク六つ(`b`・`i`・`u`・`s`・`sub`・`sup`)と値マーク四つ(`hl`・`tc`・`fs`・`tf`)
は **コアがすでにタグを知っています。** だから `boldWing` には `toHtml` も `claim` も
ありません。自分で作る名前はコアが知らないので、両方書きます。

### `toHtml`

```ts
toHtml: (node, children, ctx) => ctx.element('kbd', children())
```

| 引数 | 何ですか |
|---|---|
| `node` | いまのノードです。属性は `node.a?.['キー']` で取り出します |
| `children()` | 中身を描いた文字です。**呼んだときに描かれるので**、呼ばなければ中身が出ていきません |
| `ctx` | 安全に組み立てる道具です |

`ctx` が渡すもの:

| | |
|---|---|
| `ctx.element(tag, inner, attrs?)` | ひとかたまりを組み立てます。値は自動でエスケープされます |
| `ctx.escape(text)` | 文字だけをエスケープします |
| `ctx.url(raw)` · `ctx.src(raw)` | アドレスを濾します。信用できないアドレスは **`null`** です |
| `ctx.keys` | いまが **エディタ用**の組み立てかどうかです(`getEditorHtml()`) |

::: warning 文字を直接つなげないでください
`` `<kbd>${node.a?.['t']}</kbd>` `` のように書くと、文書の中の文字がそのままマークアップに
なってしまいます。いつも `ctx.element` か `ctx.escape` を通してください。
:::

### `claim`

```ts
claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null)
```

| | |
|---|---|
| `el` | `{ kind, tag, attrs, children }` — 入ってきたそのままの要素です |
| `inner(block)` | 中身を読みます。マークなら `false`(文字の場所)、ブロックなら `true` |
| 答え | ノードの配列、または **`null`**(自分のものではない → 次の翼へ) |

翼の配列の順序どおりに尋ね、**最初に名乗った翼**が持っていきます。

`null` を答える場所は二つあります — 自分のタグでないとき、そして **自分のタグだが値が
一覧の外にあるとき**です。後者では `inner(false)` を答えれば、殻だけ剥がして文字は
残します。

---

## 値を抱えるマーク

色・大きさのように **決まった一覧からひとつを選ぶ**マークは `valueMark` を使います。

```ts
import { valueMark, type Wing } from 'nabi-note'

const LEVELS = ['low', 'mid', 'high'] as const

const riskWing: Wing = {
  ...valueMark({
    w: 'risk',
    key: 'v',                        // 値が住む属性の欄
    values: [...LEVELS],             // これ以外の値は受け付けません
    toHtml: (node, children, ctx) =>
      ctx.element('span', children(), { 'data-risk': String(node.a?.['v'] ?? '') }),
  }),
  claim: (el, inner) => {
    if (el.tag !== 'span') return null
    const v = el.attrs['data-risk']
    if (v === undefined) return null
    if (!LEVELS.includes(v as typeof LEVELS[number])) return inner(false)   // 一覧の外 — 文字だけ残します
    return [{ w: 'risk', a: { v }, ch: inner(false) }]
  },
}
```

`valueMark` が載せてくれるものが二つ:

- **`currentValue`** — いまキャレットが座っている場所の値です。ツールバーと状況行がこの
  答えでどの欄が押されているかを塗ります。
- **`repair`** — JSON の入口で値をもう一度検査します。一覧の外か存在しなければ `null` を
  答えて **殻ごと取り除きます。** 手で直した保存値が入ってきてもここで引っかかります。

::: tip 値を変えるコマンド
値マークの「この値に変えろ」というコマンドはまだ公開の補助がありません。ツールバーの
ボタンだけでオン・オフする `action: { kind: 'mark' }` はそのまま使え、値を選ぶ必要が
あれば、いまは標準の値マーク四つ(蛍光ペン・文字色・文字サイズ・書体)を使うか、その
宣言を展開して書いてください。
:::

---

## `escapeKeys` — マークの外に出る

マークの端にキャレットが立っているとき、次の文字がマークの中か外かは人にしか分かりません。
`escapeKeys` がその扉です。

```ts
escapeKeys: ['Escape']    // simpleMark・valueMark の既定値です
```

**キャレットは動きません。** このキーを押すと「次に打つ文字はこのマークを脱ぐ」という
予約が掛かります。一文字打つと予約は使われて消えます。

```
<kbd>Ctrl</kbd>(キャレット)  →  Escape  →  タイプ "+"  →  <kbd>Ctrl</kbd>+
```

複数の翼が同じキーを掛けても構いません — キャレットがいま実際にそのマークの中にある
ときだけ予約が掛かるので、重なっているマークのうち該当するものだけが一緒に脱げます。
<kbd>Escape</kbd> は掛かった予約があればそれを **取り消す**のにも使われます。

---

## マークはキーを持てません

`onKey` を書いても **マークには来ません。** キャレットの位置は `{ path, offset }` で、
`path` の末尾は **文字を抱えるホルダー**です — マークはそのホルダーの中のインライン
ノードなので経路にそもそも現れません。キーの持ち主を見分けるとき、コアはこの経路を上に
歩くのでマークに出会うことがありません。

理由は重なりです。太字の中の斜体の中のリンクで <kbd>Enter</kbd> を押したとき、三つの
うち誰が持ち主かを決める方法がありません。マークがキーについて持つ扉は `escapeKeys`
ひとつです。

---

## 次のドキュメント

- [ブロックと段落属性](../custom/block) — 場所を占めるもの
- [キー・自動変換・貼り付け](../custom/input) — `onKey` と `inputRules`
- [UI と動作](../custom/ui) — ツールバーのボタンと状況行

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
