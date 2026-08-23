---
title: Build your own wing
description: If a format is missing, build a wing — fill in one contract and the core does the rest.
---

# Build your own wing

A wing is **one object**. There is no class to extend and no registration ceremony — putting
it in the array you hand to `createNabiWith` *is* the registration.

Bold, tables and upload are built by filling in the very same fields listed here. A wing you
write yourself runs under **exactly the same conditions** as a built-in one — there is no
shortcut reserved for the core.

---

## The smallest wing

An inline mark that knows `<kbd>`.

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',                                                   // this wing's name — this is the `w` in the stored value
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),   // the way out
  }),
  // puts its hand up as the owner of `<kbd>` in incoming HTML
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

Now `<kbd>` stays in the document. It survives pasting, `setHtml()`, saving and loading again.

```
registered      <p>Press: <kbd>Ctrl</kbd>+<kbd>S</kbd></p>   →   unchanged
not registered  <p>Press: <kbd>Ctrl</kbd></p>               →   <p>Press: Ctrl</p>
```

**The two fields face opposite directions.** `toHtml` is the way out and `claim` is the way in.
Leave `claim` out and it draws fine but **cannot be read back** — the shell is stripped the
moment you save and load.

`simpleMark` is a shortcut for marks without attributes. For a mark carrying a value there is
`valueMark`, for a lump `boxObject`, for a list family `listFamily` — and beyond those you write
the `Wing` object by hand.

---

## Wings are constants

**Most wings are already finished constants** — `boldWing` and `headingWing` go straight into
the array. Only the two that need options have a factory function.

```ts
makeImageWing({ allowLocalUrls: true })
makeUploadWing({ allowLocalUrls: true })
```

To swap out only "the part that attaches", spread the constant — you are changing one field
rather than building a new wing, which is the simpler of the two.

```ts
const wing = { ...codeWing, attach: makeCodeAttach({ highlight: myHighlighter }) }
```

---

## Registration and order

```ts
const { nabi, registry } = createNabiWith([boldWing, italicWing, kbdWing])
```

**Array order is scan order.** When deciding who owns a piece of markup (`claim`), the core
asks in this order and the first wing to answer takes it. If nobody takes it, the shell is
stripped.

In the toolbar the **group (`button.group`) comes first**. Group order is nailed down, and this
array order only decides the standing order *within* a group.

### It dies right where you register it

`createNabiWith` **throws immediately** on a wing that breaks the contract. It never blows up
late.

| What it catches | Example |
|---|---|
| A reserved word used as the name | `w: 'p'` · `w: 'br'` |
| The same name registered twice | `boldWing` twice |
| A node-erecting wing with no `toHtml` | `place: 'mark'` with no way to draw it |
| A command name breaking the rule | it must be verb+object camel case (`insertTable`) |
| A required partner missing | upload needs `img` or `a` alongside (`requiresAnyOf`) |

---

## Commands are pure functions

Every path that changes the document goes through a single command. A command **knows nothing
of the DOM or the screen.**

```ts
import { boxObject, insertLump, type Command, type Wing } from 'nabi-note'

const insertStamp: Command = (doc, sel, args, env) => {
  // it comes from outside, so check it — if it does not fit, do nothing
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
    label: { en: 'Stamp' },
    action: { kind: 'command', command: 'insertStamp', args: { text: 'OK' } },
  },
}
```

| Argument | What it is |
|---|---|
| `doc` | The document as it stands (an array of blocks). **Do not change it — answer with a new one** |
| `sel` | The selection as it stands |
| `args` | Whatever the button or the context toolbar passed in. **It comes from outside, so it has to be checked** |
| `env` | Kind knowledge — what holds what, and what is a lump |

The answer is `{ doc, selection }` or **`null`**. **Answer `null` when nothing changes** — then
`applyCommand` answers `false` and no undo point piles up. The document you answer with is
tidied once more by `cocoon`, so no command can leave behind a document that breaks the rules.

The calling side always goes by name.

```ts
nabi.applyCommand('insertStamp', { text: 'OK' })   // boolean
```

---

## Every field you can fill in

`Wing` has thirty-one fields and **only two are required** (`w` and `place`).

### What it is

| Field | Meaning |
|---|---|
| `w` | This wing's name. It becomes the `w` in the stored value. Reserved words (`p`, `br`) are not allowed |
| `place` | `'mark'` over characters · `'void'` a lump with no inside · `'container'` a lump with text inside · `'attr'` a paragraph attribute · `'tool'` a tool leaving no trace in the document |
| `basic` | **Does it run as it is, with no wiring?** Left out it is `false` — what it does not know, it does not take. `wings().allBasic()` gathers only the ones carrying this mark, and **a custom wing is measured the same way**. `allBasic()` walks the official catalogue, though, so a wing handed in directly through `.use(object)` is loaded regardless of this value |
| `holds` | How it holds its inside — `'blocks'` or `'inline'` |
| `singleParagraph` | The inside is fixed at **one** paragraph (a table cell) |
| `boolAttrs` | Names of boolean attributes whose only value is `1` |
| `allows` | The wing names allowed inside. Left out, everything |
| `noAlign` | **Objects only.** Carry it and the **wrapper paragraph wearing this object takes no alignment** — the alignment buttons hide in the toolbar, the command refuses as a no-change, and a value already baked into an old stored document is stripped as it passes through the cocoon. The code box is the first user: `pre` inherits `text-align`, so instead of the box moving, **the code lines shift**. Put it on a mark, a tool or a paragraph attribute and **registration dies** |
| `requiresAnyOf` | One of these must be registered alongside |
| `parts` | Buttonless structure brought along — a table's rows and cells, a details summary |

### Values

| Field | Meaning |
|---|---|
| `attrKey` · `attrValues` | The field name a paragraph attribute writes to, and the values it accepts |
| `currentValue` | Is it on right now — the toolbar and the context toolbar paint their slots from this answer |

### The ways in and out

| Field | Meaning |
|---|---|
| `toHtml` · `partHtml` | The way out |
| `toMd` | The way out into markdown. **Optional — leave it out and the node falls back to `toHtml`** (underline, YouTube and Details are the sort with no place in markdown, and this is what "md with HTML mixed in" actually is) |
| `partMd` | The markdown share of that wing's `parts` |
| `ioFilter` | This wing **brings the paste, save and open of its own format along with it** (the `.nabi` file is that spot). A filter is not a wing but knowledge attached to one, so anything the host plugs in through `ioFilters` stands ahead of it — see [Plugging in an IO filter](#plugging-in-an-io-filter) below |
| `claim` | Decides who owns this tag in incoming HTML |
| `repair` · `partRepair` | Tidies this node at the JSON door. Answer `null` and it is stripped, shell and all |

### Hands and keys

| Field | Meaning |
|---|---|
| `commands` | The commands this wing lays on |
| `onKey` | Intercepts keys first while the caret is inside this wing's node |
| `escapeKeys` | Keys that make the next character typed leave this mark |
| `doubleKeys` | `{ key name: command name }` — tap that key **twice within 350ms** and the command runs. The word looks like `escapeKeys` but means something else: that one is "leave the mark and keep writing", this one is "one command from one gesture". Its priority is **the lowest**, so it takes its turn after every other job on that key has passed. At registration it **checks for key collisions and for the command's existence**, so two wings claiming the same key, or a name pointing at no command, kills registration |
| `inputRules` | Automatic conversion driven by typing alone |
| `attach` | For when the screen has to be touched — a table's cell drag, code's colouring |

### Looks

| Field | Meaning |
|---|---|
| `button` · `buttons` | One toolbar button, or several |
| `context` | The context toolbar declaration |
| `styles` | The CSS this wing carries |

---

## Plugging in an IO filter

**An IO filter is not a wing.** It stands only at the doors the document goes through — paste,
save and open — takes charge of one format, and raises no node of its own in the document. The
contract is a single `IoFilter`.

| Field | Meaning |
|---|---|
| `id` · `label` | The filter's name, and the name shown in the panel. A colliding `id` **dies right where you register it** |
| `paste` | Looks at the clipboard (`PasteData`) and offers a candidate. `null` if it is not its own, and `build()` digs only once the person picks that slot |
| `save` | `{ extension, write, lossy?, mime? }` — `write` gets a `DocSource` and takes whichever of `json()`, `html()` and `md()` it needs. `lossy` is what puts "(lossy)" on the save panel |
| `read` | Takes a name and a string and reads it into a nabi tree. **`null` if it is not its own**, and it passes to the next filter |

**All three doors are optional** — a filter that only knows paste, or only reads, is fine. The
places to plug one in are `ioFilters` on `mountSurface` and `mountFile`,
`createNabiWith(wings, { ioFilters })`, and the `ioFilter` field in the table above, and
**whoever stands first wins** — mount → host → wing → built-in (`nabi`, `html`, `html-open`,
`markdown`). The open list comes from `readExtensions(filters)`, which **cannot count a filter
with no save slot** (the built-in `.html` is such a spot, so the default store adds it by hand to
make four).

Markdown alone a filter cannot make on its own — which characters a node is written as is known by
**the wing** carrying `toMd` and `partMd` above. Leave them out and the node falls back to
`toHtml`, mixed into the md as HTML; and the md parser too raises **only the syntax a registered
wing can take**.

---

## `w` — naming it

`w` is **a string that repeats on every node of the stored value**. Shorter is better — that is
why the built-in wings are as short as `b`, `hl` and `tf`. But a collision with someone else's
name kills registration, so give one you write yourself a name long enough not to collide, even
if it runs a little longer.

It need not match the HTML tag name — the tag on the way out is decided by `toHtml`.

::: warning Renaming it later
The `w` in the stored value *is* that name, so renaming it means **documents you already saved
can no longer be read.** If you must, keep accepting the old name through `claim` alongside for
a moving period.
:::

---

## Next

- [Inline marks](./custom/inline) — `claim` · `toHtml` · `escapeKeys`
- [Blocks and paragraph attributes](./custom/block) — `place` · `holds` · `allows` · `parts` · `attrKey`
- [Keys, input rules, paste](./custom/input) — `onKey` · `inputRules` · `attach`
- [UI and actions](./custom/ui) — `button` · `context` · `styles`, and asking the person

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
