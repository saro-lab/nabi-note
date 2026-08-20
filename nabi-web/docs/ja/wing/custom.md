---
title: カスタム翼を作る
description: ない書式は翼として作ります — 契約ひとつを埋めればコアが残りをします。
---

# カスタム翼を作る

翼(wing)は **オブジェクトひとつ**です。クラスを継承することも、別の登録手続きを踏む
こともありません — `createNabiWith` に渡す配列に入れることが、そのまま登録です。

太字・表・アップロードも、ここに書かれた枠だけを埋めて作られています。自分で作った翼は
標準の翼と **まったく同じ条件**で動きます — 近道はありません。

---

## いちばん短い翼

`<kbd>` を知るインラインマークひとつです。

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',                                                   // この翼の名前 — 保存値の `w` がこれです
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),   // 出ていく絵
  }),
  // 入ってくる HTML の中で `<kbd>` の持ち主だと名乗ります
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

これで `<kbd>` が文書に残ります。貼り付け・`setHtml()`・保存・再読み込みを通り抜けても
そのままです。

```
登録したとき     <p>押す: <kbd>Ctrl</kbd>+<kbd>S</kbd></p>   →   そのまま
登録しないとき   <p>押す: <kbd>Ctrl</kbd></p>                →   <p>押す: Ctrl</p>
```

**二つの欄は向きが違います。** `toHtml` は出ていく道で、`claim` は入ってくる道です。
`claim` を書かなければ描くことはできても **読み込み直せません** — 保存して読み込む
瞬間に殻が剥がれます。

`simpleMark` は属性のないマークのための近道です。値を抱えるマークには `valueMark`、
物体には `boxObject`、リストの系統には `listFamily` があり、それ以外は `Wing` オブジェクト
を手で書きます。

---

## 翼は定数です

**ほとんどの翼はすでに完成した定数です** — `boldWing`・`headingWing` のようにそのまま
配列に入れるだけです。オプションが必要なものだけ、別に工場関数があります。

```ts
makeImageWing({ allowLocalUrls: true })
makeUploadWing({ allowLocalUrls: true })
```

「付随処理」だけ差し替えたいときは定数を展開して書きます — 翼を新しく作るのではなく
一つの欄だけを変えることなので、こちらのほうが単純です。

```ts
const wing = { ...codeWing, attach: makeCodeAttach({ highlight: myHighlighter }) }
```

---

## 登録と順序

```ts
const { nabi, registry } = createNabiWith([boldWing, italicWing, kbdWing])
```

**配列の順序が、そのままスキャンの順序です。** あるマークアップの持ち主を見分けるとき
(`claim`)、コアはこの順に尋ね、最初に答えた翼が持っていきます。誰も持っていかなければ、
殻を剥がされます。

ツールバーでは **まとまり(`button.group`)が先**です。まとまりの順序は決まっていて、
同じまとまりの中でだけこの配列の順序で並びます。

### 登録するその場で死にます

`createNabiWith` は契約を破った翼を **その場で投げます。** あとから出るのではありません。

| 引っかかるもの | 例 |
|---|---|
| 予約語を名前に使う | `w: 'p'` · `w: 'br'` |
| 同じ名前を二度登録 | `boldWing` を二度 |
| ノードを立てるのに `toHtml` がない | `place: 'mark'` なのに描き方がない |
| コマンド名が規則を破る | 動詞+目的語のキャメルケースでなければなりません(`insertTable`) |
| 必要な相方がない | アップロードは `img` か `a` が一緒になければなりません(`requiresAnyOf`) |

---

## コマンド — 純粋関数です

文書を変えるすべての道がコマンドひとつを通ります。コマンドは **DOM も画面も知りません。**

```ts
import { boxObject, insertLump, type Command, type Wing } from 'nabi-note'

const insertStamp: Command = (doc, sel, args, env) => {
  // 外から来た値なので検査します — 合わなければ何もしません
  if (typeof args['text'] !== 'string') return null
  const stamp = { w: 'stamp', a: { t: args['text'] }, ch: [] }
  const r = insertLump(doc, sel.focus, stamp, env)
  return { doc: r.doc, selection: { anchor: r.caret, focus: r.caret } }
}

export const stampWing: Wing = {
  ...boxObject({
    w: 'stamp',
    attrs: { t: (v) => (typeof v === 'string' ? v : null) },
    toHtml: (node, _children, ctx) =>
      ctx.element('span', ctx.escape(String(node.a?.['t'] ?? '')), { 'data-nabi-stamp': '' }),
  }),
  commands: { insertStamp },
  button: {
    group: 'insert',
    label: { ja: 'スタンプ' },
    action: { kind: 'command', command: 'insertStamp', args: { text: '確認' } },
  },
}
```

| 引数 | 何ですか |
|---|---|
| `doc` | いまの文書(ブロックの配列)です。**変えずに新しいものを返します** |
| `sel` | いまの選択です |
| `args` | ボタンや状況行が渡した値です。**外から来た値なので検査が必要です** |
| `env` | 種類の知識です — 何が何を持てるか、何が物体か |

答えは `{ doc, selection }` か **`null`** です。**変わるものがなければ `null` を答えて
ください** — そうすれば `applyCommand` が `false` を答え、元に戻す地点が積まれません。
答えた文書は `cocoon` がもう一度整えるので、どのコマンドも規則を破った文書を残せません。

呼ぶ側はいつも名前です。

```ts
nabi.applyCommand('insertStamp', { text: '確認' })   // boolean
```

---

## 埋められる枠すべて

`Wing` は二十五の枠があり **必須は二つ**(`w`・`place`)です。

### 何であるか

| 枠 | 意味 |
|---|---|
| `w` | この翼の名前です。保存値の `w` になります。予約語(`p`・`br`)は使えません |
| `place` | `'mark'` 文字の上 · `'void'` 中身のない物体 · `'container'` 中に文章がある物体 · `'attr'` 段落属性 · `'tool'` 文書に痕跡を残さない道具 |
| `holds` | 中身をどう持つか — `'blocks'` または `'inline'` |
| `singleParagraph` | 中身が段落 **ひとつ**に固定されます(表のセル) |
| `boolAttrs` | 値が `1` だけの真偽属性の名前です |
| `allows` | この中に入ってこられる翼の名前です。書かなければすべて |
| `requiresAnyOf` | このうちどれかひとつは一緒に登録されていなければなりません |
| `parts` | 一緒に連れてくるボタンのない構造です — 表の行・セル、折りたたみの要約行 |

### 値

| 枠 | 意味 |
|---|---|
| `attrKey` · `attrValues` | 段落属性が使う欄の名前と受け取れる値の一覧です |
| `currentValue` | いま押されているか — ツールバー・状況行がこの答えで欄を塗ります |

### 行き来する道

| 枠 | 意味 |
|---|---|
| `toHtml` · `partHtml` | 出ていく絵です |
| `claim` | 入ってくる HTML の中でこのタグの持ち主を見分けます |
| `repair` · `partRepair` | JSON の入口でこのノードを整えます。`null` を返すと殻ごと取り除かれます |

### 手とキー

| 枠 | 意味 |
|---|---|
| `commands` | この翼が載せるコマンドたちです |
| `onKey` | キャレットがこの翼のノードの中にあるとき、キーを先に横取りします |
| `escapeKeys` | 次に打つ文字がこのマークの外に出るようにするキーです |
| `inputRules` | 文字だけで起こる自動変換です |
| `attach` | 画面に手を触れる必要があるときです — 表のセルのドラッグ、コードの色付けがこれです |

### 見た目

| 枠 | 意味 |
|---|---|
| `button` · `buttons` | ツールバーのボタンひとつまたは複数です |
| `context` | 状況行の宣言です |
| `styles` | この翼が運ぶ CSS です |

---

## `w` — 名前を付ける

`w` は **保存値にノードごとに繰り返される文字**です。短いほどよいです — 標準の翼が
`b`・`hl`・`tf` のように短いのはこのためです。ただし他人の名前と重なると登録が死ぬので、
自分で作るものは多少長くても重ならない名前を使ってください。

HTML タグ名と同じである必要はありません — 出ていくタグは `toHtml` が決めます。

::: warning 名前をあとで変えると
保存値の `w` がそのままその名前なので、名前を変えると **すでに保存された文書を読み込め
なくなります。** 変える必要があるなら、古い名前も `claim` で一緒に受け取る移行期間を
設けてください。
:::

---

## 次のドキュメント

- [インラインマーク](./custom/inline) — `claim` · `toHtml` · `escapeKeys`
- [ブロックと段落属性](./custom/block) — `place` · `holds` · `allows` · `parts` · `attrKey`
- [キー・自動変換・貼り付け](./custom/input) — `onKey` · `inputRules` · `attach`
- [UI と動作](./custom/ui) — `button` · `context` · `styles`、そして人に尋ねる

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
