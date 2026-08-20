---
title: キー・自動変換・貼り付け
description: onKey でキーを横取りし、inputRules で文字だけで書式を作り、attach で画面に手を触れます。
---

# キー・自動変換・貼り付け

翼が人の手の動きを受け取る扉は三つです — **キー**(`onKey`)、**文字**(`inputRules`)、
**画面**(`attach`)。

---

## キーが通る道

<kbd>Enter</kbd> がひとつ押されると、この順序で尋ねます。前で誰かが処理すると後ろは
来ません。

```
① ツールバーのショートカット   どこでも聞きます (Ctrl+B のようなもの)
② 自動変換                    inputRules — Enter・Space のみ
③ 翼の onKey                  キャレットが座った場所の持ち主へ
④ 物体を狙う                  段落の先頭でバックスペース → 前の物体をまるごと選択
⑤ コアの規則                  段落を分ける・消す・キャレットの移動
⑥ ブラウザ                    ここまで誰も持っていかなかったときだけ
```

---

## `onKey` — キーを横取りする

```ts
import type { OnKey } from 'nabi-note'

const noteKeys: OnKey = (intent, doc, sel, env, owner) => {
  if (intent.key !== 'backspace') return null      // 自分の仕事ではない — コアに渡します
  if (sel.focus.offset !== 0) return null
  const first = [...owner.path, 0]
  if (first.length !== sel.focus.path.length) return null
  if (!first.every((v, i) => v === sel.focus.path[i])) return null
  return toggleNote(doc, sel, {}, env)             // 最初のセルの先頭でバックスペース — ノートを広げます
}

const noteWing: Wing = {
  w: 'note',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
  commands: { toggleNote },
  onKey: noteKeys,
}
```

| 引数 | 何ですか |
|---|---|
| `intent` | `{ key, dir? }` — どのキーか |
| `doc` · `sel` · `env` | コマンドが受け取るものと同じです |
| `owner` | `{ path, node }` — **自分が持ち主として選ばれたそのノード**です |

答えはコマンドと同じ `{ doc, selection }` か **`null`** です。`null` は「持っていかない」
という意味で、コアが引き継ぎます — 条件に合わなければ必ず `null` を答えてください。

### 来るキー

| `intent.key` | いつ |
|---|---|
| `'enter'` | <kbd>Enter</kbd> **と** <kbd>Shift</kbd>+<kbd>Enter</kbd> の両方 |
| `'tab'` · `'shiftTab'` | <kbd>Tab</kbd> · <kbd>Shift</kbd>+<kbd>Tab</kbd> |
| `'backspace'` · `'delete'` | 削除の両方 |
| `'arrow'` | 矢印。向きは `intent.dir`(`'left'`·`'right'`·`'up'`·`'down'`) |

文字キーは来ません。文字はブラウザが打ち、コアが受け取って書き留めます。

### 持ち主はひとつです

キャレットの経路を **上へ歩いて最初に出会う段落でないノード**、そのノードを所有する翼が
持ち主です。

```
経路 [1, 0, 0] のキャレット                 持ち主候補
  [1, 0, 0]  →  p        段落なので飛ばします
  [1, 0]     →  note     ← 持ち主です
  [1]        →  p(ラッパー)  ここまでは来ません
```

だから **いちばん内側の器が勝ちます** — 表の中のリストで <kbd>Tab</kbd> はリストが受け
取ります。部品(`parts`)も持ち主になれ、そのとき `owner.node` は部品のノードですが
`onKey` はそれを宣言した翼のものが呼ばれます。だから `owner.node.w` で何が選ばれたのか
先に見分けるのが慣例です。

マークは持ち主になれません —
[理由はインラインのドキュメントに](./inline#マークはキーを持てません)。

---

## `inputRules` — 文字だけで作る

`# ` を打つと見出しになり、`> ` を打つと引用になるのがこれです。

```ts
inputRules: [
  { trigger: 'space', pattern: /^>$/, run: () => ({ name: 'toggleQuote' }) },
]
```

| 欄 | |
|---|---|
| `trigger` | `'space'` または `'enter'` — このキーを打った **瞬間**に検査します |
| `pattern` | 正規表現です。`run` がそのマッチを受け取ります |
| `run` | `{ name, args? }` — 回すコマンドです |
| `scope` | `'block'`(既定)または `'word'` |

### `'block'` — 行の先頭を差し替えます

キャレットの前の **行の先頭**を見ます。合えばその先頭(とトリガーの文字)を消してコマンド
を回します。

```
"> " を打つ   →   "&gt;" が消えて toggleQuote が回ります
```

段落の **最初の行でだけ**掛かります。<kbd>Shift</kbd>+<kbd>Enter</kbd> で行を下げた
次の行では掛かりません — すでに書いている文章の途中で書式が飛び出す場所を防ぎます。

### `'word'` — 単語ひとつに被せます

キャレットの前の **単語ひとつ**を見ます。合えばその単語を選んでコマンドを回し、
キャレットを元の場所に戻します。文字は消えません — マークを被せる規則はこちらです。

その単語が **すでにこの翼のマークをまとっていれば飛ばします。** 同じ場所で二度掛かる
ことはありません。

### 共通の規則

- キャレットが **畳まれているときだけ**動きます。範囲を選んでスペースを打っても掛かり
  ません。
- 普通の段落でだけ動きます — 物体を抱えたラッパー段落では掛かりません。
- 翼の配列の順序どおりに調べ、**最初に成功した規則**が勝ちます。
- コマンドが `null` を答えると(= やることがない)**元に戻して次の規則に移ります。**
  自動変換が失敗した痕跡が文書に残りません。

---

## `attach` — 画面に手を触れる

文書を直すのではなく **画面で起きること**を聞かなければならないときがあります — 表の
セルをドラッグで選ぶ、コードに色を付ける、折りたたみの三角を押す。

```ts
import type { Attach } from 'nabi-note'

const attachNote: Attach = (host) => {
  const onClick = (ev: MouseEvent): void => { /* … */ }
  host.root.addEventListener('click', onClick)
  return () => host.root.removeEventListener('click', onClick)   // 解除関数を返します
}
```

`host` が渡すものは三つです。

| | |
|---|---|
| `host.root` | 編集面の要素です |
| `host.nabi` | エディタです。文書を直すことは **コマンドで**行います |
| `host.pathOfKey(id)` | 画面の `data-key` を文書の経路に変換します |

`mountSurface` が登録された翼すべての `attach` を一緒に付け、外すときに返された解除関数
を呼びます。**DOM を知るコードが住む唯一の場所**です — コマンド・`toHtml`・`repair` の
中で `document` に触ってはいけません。

::: tip `data-key` で文書を探します
エディタ用の組み立て(`getEditorHtml()`)はノードごとに `data-key` を付けます。押された
要素からいちばん近い `[data-key]` を探し `host.pathOfKey()` に渡せば、文書の中の場所が
出てきます。
:::

---

## 貼り付けと初期 HTML

貼り付け・`setHtml()`・保存値の読み込みは **すべて同じ扉**を通ります。翼がここでやること
は `claim` ひとつです — [インラインのドキュメントの `claim`](./inline#claim) に
書かれています。

```
貼り付け  ─┐
setHtml  ─┼→ パース → 翼の claim → コアの既定タグ対応 → repair → cocoon → 文書
初期 HTML ─┘
```

`claim` がなければ **そのタグは殻が剥がされ、中の文字だけが残ります。** 他人のエディタ
からコピーした見慣れないマークアップが文書にそのまま刺さらないのは、この規則のおかげ
です。

JSON で入ってくる道(`setJson()`)はタグではなくノードなので、`claim` ではなく `repair`
が門番です。

---

## 次のドキュメント

- [UI と動作](../custom/ui) — ツールバーのボタンと状況行
- [インラインマーク](../custom/inline) · [ブロックと段落属性](../custom/block)

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
