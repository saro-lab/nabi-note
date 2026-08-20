---
title: ブロックと段落属性を作る
description: void·container·attr — 場所を占めるものを作ります。物体はいつもラッパー段落の中に住みます。
---

# ブロックと段落属性を作る

場所を占めるものは三つの種類です。

| `place` | 何 | 例 |
|---|---|---|
| `'void'` | **中身のない物体**です。キャレットが中に入れません | 区切り線・画像・YouTube |
| `'container'` | **中に文章がある物体**です | 引用・折りたたみ・表・リスト・コード |
| `'attr'` | 段落自体に付く値です。ノードは立てません | 見出し・揃え・ドロップキャップ |

---

## 物体はラッパー段落の中に住みます

ドキュメントは **ブロックの配列**で、最上位に立てるのは段落(`p`)だけです。物体は最上位に
直接立たず、**自分だけを抱えた段落**ひとつを着て立ちます。

```json
[{ "w": "p", "ch": [{ "w": "hr", "ch": [] }] }]
```

この段落が **ラッパー段落**で、画面には `<div data-nabi-p>` として描かれます。

こうする理由は二つです。物体の前後にキャレットが立つ場所がいつもあり(段落ひとつが常に
そこにあるので)、**揃えのような段落属性を物体がそのまま受け取ります** — 「中央揃えの
画像」はつまり「中央揃えの段落の中の画像」ということです。

---

## 中身のない物体を作る

```ts
import { boxObject, createNabiWith, insertLump, type Command, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const insertStar: Command = (doc, sel, _args, env) => {
  const r = insertLump(doc, sel.focus, { w: 'star', ch: [] }, env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

const starWing: Wing = {
  ...boxObject({
    w: 'star',
    toHtml: (_node, _children, ctx) => ctx.element('hr', '', { 'data-nabi-star': '' }),
  }),
  commands: { insertStar },
  button: {
    group: 'insert',
    label: { ja: '星' },
    action: { kind: 'command', command: 'insertStar' },
  },
}
```

`insertLump` がラッパー段落を勝手に着せます。

```
<div data-nabi-p><hr data-nabi-star/></div>
```

空の段落の上で呼ぶと **その段落に乗り換えます** — 入れるたびに空行がひとつずつ残ることは
ありません。そして、その段落がすでに持っていた揃えはそのまま生き残ります。

`boxObject` が埋めてくれるのは `place: 'void'` と **属性の検査器**です。

```ts
boxObject({
  w: 'stamp',
  attrs: { c: (v) => (v === 'red' || v === 'blue' ? v : null) },   // 一覧の外の値は落ちます
  requires: ['c'],                                                 // なければこの物体は立ちません
  toHtml: /* … */,
})
```

`attrs` に書かなかった属性は **知らない欄なのでまるごと落ちます。** 契約の外の値が保存値に
こっそり乗る場所はありません。

---

## 中身のある物体を作る

`place: 'container'` は `holds` を必ず一緒に書きます — 書かなければ登録が死にます。

```ts
import { createNabiWith, toggleWrap, type Command, type Wing } from 'nabi-note'

const toggleNote: Command = (doc, sel, _args, env) => {
  const r = toggleWrap(doc, sel, 'note', env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

const noteWing: Wing = {
  w: 'note',
  place: 'container',
  holds: 'blocks',                  // 中に段落が住む('inline' なら文字だけ)
  allows: ['p'],                    // この中に入ってこられるもの
  toHtml: (_node, children, ctx) => ctx.element('aside', children(), { 'data-nabi-note': '' }),
  claim: (el, inner) => (el.tag === 'aside' ? [{ w: 'note', ch: inner(true) }] : null),
  commands: { toggleNote },
  inputRules: [{ trigger: 'space', pattern: /^!$/, run: () => ({ name: 'toggleNote' }) }],
  button: {
    group: 'container',
    label: { ja: 'ノート' },
    action: { kind: 'command', command: 'toggleNote' },
  },
}
```

`toggleWrap` は **トグル**です。選択がまたがる最上位ブロックたちをこの器で包み、すでに
すべて包まれていれば中身をその場に広げます。

```
包む前   [p"一行目", p"二行目"]
包んだ後 [p[ note[ p"一行目", p"二行目" ] ]]
もう一度押す [p"一行目", p"二行目"]
```

### `holds`

| | 中に住むもの | 例 |
|---|---|---|
| `'blocks'` | 段落と他の物体 | 引用・折りたたみ・表のセル |
| `'inline'` | 文字とマークだけ | 折りたたみの要約行・コード |

### `allows`

書くと **それ以外のものは入ってこられません。** コアが自動で整理器をひとつ載せ、貼り付け
でも保存値でも、一覧の外のものは殻を剥がして中の文字だけを段落として下ろします。

書かなければすべて許可です。`allows` に知らない名前を書くと **登録するその場で死にます。**

---

## `parts` — ボタンのない中身の構造

表の行・セル、折りたたみの要約行のように **ひとりでは立てず、ツールバーのボタンもない**
構造は部品として宣言します。

```ts
const detailsWing: Wing = {
  w: 'details',
  place: 'container',
  holds: 'blocks',
  boolAttrs: ['o'],                                   // 値が1だけの属性 — 開いているか
  parts: { summary: { holds: 'inline' } },            // 要約行
  toHtml: /* … */,
  partHtml: { summary: /* … */ },                     // 部品ごとに組み立てが必要です
  repair: repairDetails,
}
```

規則は四つです。

- 部品は **コンテナだけ**が持てます。他の `place` に書くと登録が死にます。
- 部品ごとに `partHtml` がなければなりません。なければ登録が死にます。
- 部品の名前は翼の名前・他の部品の名前と重なってはいけません。
- 部品を整える必要があれば `partRepair` に部品の名前で書きます。

`StructureDecl` は三つを受け取ります — `holds` · `singleParagraph` · `boolAttrs`。

### `singleParagraph`

中身が **段落ひとつに固定**されます。表のセルがこれです — セルの中で <kbd>Enter</kbd>
を押しても段落が二つに割れず、二つのセルにまたがる選択を消してもセル同士が合体しません。
格子を守っているのはこのひとつです。

### `boolAttrs`

値が `1` だけの属性です — 折りたたみの `o`(開閉)、タスクリストの `ck`(チェック)、段落の
`dc`(ドロップキャップ)。オフの状態は `0` ではなく **欄がまったくないこと**です。

---

## `repair` — 保存値の入口にある最後の扉

`repair` は **JSON がドキュメントになる直前**にこのノードを一度整えます。

```ts
repair: (node) => {
  if (!正しいか(node)) return null    // null — このノードは殻ごと取り除かれます
  return 整えたノード                  // そのままでも構いません(同じオブジェクトを返せば変わりません)
}
```

手で直した保存値、別の版から来た文書、他人が作った JSON がすべてこの扉を通ります。ここを
通ったものだけがドキュメントになるので、**翼が自分のノードの形を自ら保証できる唯一の
場所**です。

`allows` と `repair` を一緒に書くと、`allows` の整理が **先に**回り、その結果が `repair`
に渡されます。

---

## `requiresAnyOf` — 相方がいてはじめて立つ翼

```ts
requiresAnyOf: ['img', 'a']
```

このうちどれかひとつも一緒に登録されていなければ **登録するその場で死にます。** アップロード
の翼がこれを使います — アップロードしたものを画像かリンクとして立てなければならないのに、
どちらもなければアップロードしても何もできないからです。

---

## 段落属性(`place: 'attr'`)

段落属性はノードを立てません。段落の `a` に値をひとつ載せるだけです。

```json
{ "w": "p", "a": { "h": 2, "a": "c" }, "ch": ["中央揃えの見出し2"] }
```

::: warning 欄が三つに決められています
`attrKey` は **`h`(見出し)・`a`(揃え)・`dc`(ドロップキャップ)**の三つのうちどれかで
なければならず、それ以外の名前を書くと登録が死にます。いまの版では **新しい段落属性は
作れません** — 段落の属性欄はコアが知る三つで閉じています。

同じ理由で、この三つはすでに `headingWing`・`alignWing`・`dropCapWing` が占めているため、
`place: 'attr'` の翼を新しく書く場所は事実上ありません。段落ごとに値を載せたいなら、
いまはコンテナで包む方を選んでください。
:::

値を扱う欄が二つあります。

| | |
|---|---|
| `attrValues` | 受け取れる値の一覧です(見出しなら `[1,2,3,4,5,6]`) |
| `currentValue` | この段落がいま持っている値です。ツールバー・状況行がこの答えで押された欄を塗ります |

---

## 公開されているドキュメント補助

いまの版が外に出している編集の補助は四つです。

| | すること |
|---|---|
| `insertLump(doc, caret, lump, env, wrap?)` | 物体ひとつをラッパー段落ごと立てます |
| `removeLump(doc, topIndex, env)` | 最上位のラッパー段落ひとつをまるごと取り除きます |
| `toggleWrap(doc, sel, containerW, env)` | またがるブロックたちを器で包む、または広げます |
| `topNodeAt(doc, path)` | この経路が属する最上位ノードです |

四つとも `{ doc, caret }` を返すので、コマンドが返す形にひとつ移し替えます。

```ts
return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
```

::: tip これより細かい編集が必要なら
文字単位で切ってつなぐ内側の補助(マークを載せる・段落属性を書くといったもの)はまだ
公開 API ではありません。それまでは `doc` 配列を直接新しく組み立てて返しても構いません
— 返した文書は `cocoon` がもう一度整えるので、規則を破った文書がそのまま残ることは
ありません。
:::

---

## 次のドキュメント

- [キー・自動変換・貼り付け](../custom/input) — `onKey` · `inputRules` · `attach`
- [UI と動作](../custom/ui) — ツールバーのボタンと状況行

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
