---
title: Keys, input rules, paste
description: Intercept keys with onKey, build formatting out of typing alone with inputRules, and touch the screen with attach.
---

# Keys, input rules, paste

A wing has three doors onto what a person does — **keys** (`onKey`), **typing**
(`inputRules`), and **the screen** (`attach`).

---

## The road a key travels

Press <kbd>Enter</kbd> once and it is offered around in this order. Whoever takes it first ends
the journey.

```
① Toolbar shortcuts    heard anywhere (things like Ctrl+B)
② Input rules          inputRules — Enter and Space only
③ The wing's onKey     to the owner of wherever the caret sits
④ Lump aiming          backspace at the very start of a paragraph → select the lump before it whole
⑤ Core rules           splitting paragraphs, deleting, walking the caret
⑥ The browser          only if nobody above took it
```

---

## `onKey` — intercepting a key

```ts
import type { OnKey } from 'nabi-note'

const noteKeys: OnKey = (intent, doc, sel, env, owner) => {
  if (intent.key !== 'backspace') return null      // not my business — hand it back to the core
  if (sel.focus.offset !== 0) return null
  const first = [...owner.path, 0]
  if (first.length !== sel.focus.path.length) return null
  if (!first.every((v, i) => v === sel.focus.path[i])) return null
  return toggleNote(doc, sel, {}, env)             // backspace at the very start of the first slot — unwrap the note
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

| Argument | What it is |
|---|---|
| `intent` | `{ key, dir? }` — which key |
| `doc` · `sel` · `env` | the same three a command receives |
| `owner` | `{ path, node }` — **the node I was picked as the owner of** |

The answer is the same `{ doc, selection }` a command returns, or **`null`**. `null` means "not
taking it", so the core carries on — whenever your conditions are not met, you must answer
`null`.

### Which keys arrive

| `intent.key` | When |
|---|---|
| `'enter'` | <kbd>Enter</kbd> **and** <kbd>Shift</kbd>+<kbd>Enter</kbd>, both |
| `'tab'` · `'shiftTab'` | <kbd>Tab</kbd> · <kbd>Shift</kbd>+<kbd>Tab</kbd> |
| `'backspace'` · `'delete'` | the two deletions |
| `'arrow'` | arrows. The direction is `intent.dir` (`'left'`·`'right'`·`'up'`·`'down'`) |

Character keys never arrive. The browser types characters and the core writes them down.

### There is exactly one owner

Walk **up** the caret's path; the first node that is not a paragraph, and the wing that owns that
node, is the owner.

```
caret at path [1, 0, 0]                     owner candidate
  [1, 0, 0]  →  p        a paragraph, so skipped
  [1, 0]     →  note     ← the owner
  [1]        →  p (wrapper)  never reached
```

So **the innermost container wins** — inside a list inside a table, <kbd>Tab</kbd> goes to the
list. A part (`parts`) can be the owner too, and when it is, `owner.node` is the part's node
while the `onKey` that runs belongs to the wing that declared it. That is why the convention is
to branch on `owner.node.w` first, to see which one was picked.

A mark can never be the owner — the reason is on the [inline page](./inline).

---

## `inputRules` — building formatting out of typing alone

This is what turns `# ` into a heading and `> ` into a quote.

```ts
inputRules: [
  { trigger: 'space', pattern: /^>$/, run: () => ({ name: 'toggleQuote' }) },
]
```

| Field | |
|---|---|
| `trigger` | `'space'` or `'enter'` — measured at the **moment** that key is struck |
| `pattern` | a regular expression. `run` receives the match |
| `run` | `{ name, args? }` — the command to run |
| `scope` | `'block'` (the default) or `'word'` |

### `'block'` — replacing the start of a line

It looks at the **start of the line** in front of the caret. On a match it deletes that prefix
(and the trigger character) and runs the command.

```
type "> "   →   the "&gt;" is deleted and toggleQuote runs
```

It only fires on the **first line** of a paragraph. On a line you reached with
<kbd>Shift</kbd>+<kbd>Enter</kbd> it does not fire — that keeps formatting from erupting in the
middle of prose you are already writing.

### `'word'` — laying a mark over a single word

It looks at the **single word** in front of the caret. On a match it selects that word, runs the
command, and puts the caret back where it was. No text is deleted — this is the shape for rules
that lay a mark.

If that word **already carries this wing's mark, the rule is skipped.** It cannot fire twice in
the same place.

### Rules they share

- It only runs while the caret is **collapsed**. Hitting space with a range selected does
  nothing.
- It only runs in an ordinary paragraph — never in a wrapper paragraph holding a lump.
- Rules are measured in the wings' array order, and the **first rule that succeeds** wins.
- If the command answers `null` (nothing to do) it **rolls back and moves on to the next rule.**
  A failed input rule leaves no trace in the document.

---

## `attach` — touching the screen

Sometimes the job is not to change the document but to listen to **what happens on screen** —
drag-selecting table cells, painting code, clicking the details triangle.

```ts
import type { Attach } from 'nabi-note'

const attachNote: Attach = (host) => {
  const onClick = (ev: MouseEvent): void => { /* … */ }
  host.root.addEventListener('click', onClick)
  return () => host.root.removeEventListener('click', onClick)   // answer with a teardown function
}
```

`host` gives you three things.

| | |
|---|---|
| `host.root` | the editing surface's element |
| `host.nabi` | the editor. Changing the document is done **through commands** |
| `host.pathOfKey(id)` | turns a `data-key` on screen into a path into the document |

`mountSurface` attaches every registered wing's `attach` along with itself, and calls the
teardown functions you returned when it comes down. This is **the one and only house where code
that knows the DOM lives** — never touch `document` inside a command, `toHtml`, or `repair`.

::: tip Finding the document through `data-key`
The editor build (`getEditorHtml()`) tags every node with a `data-key`. Find the nearest
`[data-key]` from the element that was clicked and hand it to `host.pathOfKey()` to get the
place inside the document.
:::

---

## Paste and initial HTML

Pasting, `setHtml()`, and loading a stored value all go through **the same door**. The wing's
only job here is `claim` — it is written up under [`claim` on the inline page](./inline#claim).

```
paste       ─┐
setHtml     ─┼→ parse → the wings' claim → the core's default tag handling → repair → cocoon → document
initial HTML ─┘
```

Without a `claim`, **that tag has its shell stripped and only the text inside survives.** This
rule is why unfamiliar markup copied out of somebody else's editor does not get lodged in the
document as-is.

The way in through JSON (`setJson()`) carries nodes rather than tags, so the gatekeeper there is
`repair`, not `claim`.

---

## Next

- [UI and actions](../custom/ui) — toolbar buttons and the context toolbar
- [Writing an inline mark](../custom/inline) · [Blocks and paragraph attributes](../custom/block)

<script setup lang="ts">
import { useTranslate } from '../../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
