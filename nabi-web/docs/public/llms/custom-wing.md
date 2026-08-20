# Building a custom wing

A wing is one plain object. No subclassing, no separate registration step - putting it in the
array passed to `createNabiWith` **is** registering it. Built-in wings (bold, table, upload) are
built from the same 25 slots documented here - there is no shortcut path only the core gets to
use.

## The shortest wing

An inline mark the editor understands as `<kbd>`:

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',                                                       // this wing's name - becomes `w` in storage
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),  // outgoing shape
  }),
  // claim ownership of incoming <kbd> tags
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

`<kbd>` now survives paste, `setHtml()`, save, and reload.

```
Registered:      <p>Press: <kbd>Ctrl</kbd>+<kbd>S</kbd></p>   ->  unchanged
Not registered:  <p>Press: <kbd>Ctrl</kbd></p>                ->  <p>Press: Ctrl</p>
```

`toHtml` and `claim` face opposite directions - outgoing and incoming. Skip `claim` and the wing
still draws, but a save-then-reload strips the tag right back off, since nothing claims it coming
back in.

`simpleMark` is the shortcut for a mark with no attribute. A mark that carries a value uses
`valueMark`; an object uses `boxObject`; a list family uses `listFamily`. Anything else is a
hand-written `Wing` object.

## Wings are constants

Most built-in wings are already-finished constants - `boldWing`, `headingWing` - just put in an
array. Only two need an options factory:

```ts
makeImageWing({ allowLocalUrls: true })
makeUploadWing({ allowLocalUrls: true })
```

To change only how a wing attaches to the DOM (not its whole contract), spread the constant:

```ts
const wing = { ...codeWing, attach: makeCodeAttach({ highlight: myHighlighter }) }
```

## Registration and order

```ts
const { nabi, registry } = createNabiWith([boldWing, italicWing, kbdWing])
```

**Array order is scan order.** When deciding who owns a piece of markup (`claim`), the core asks
in this order and the first wing to answer wins. If nobody claims it, the markup is stripped back
to plain text.

In the toolbar, button groups come first (fixed order); within one group, wings sit in this same
array order.

### A broken contract throws at registration, not later

| Trips on | Example |
|---|---|
| Using a reserved word as the name | `w: 'p'` or `w: 'br'` |
| Registering the same name twice | `boldWing` twice |
| A node-producing wing with no `toHtml` | `place: 'mark'` but no way to draw it |
| A command name that breaks the convention | must be verb + object, camelCase (`insertTable`) |
| A missing dependency | upload requires `img` or `a` to also be registered (`requiresAnyOf`) |

## Commands are pure functions

Every path that changes the document goes through exactly one command. A command knows nothing
about the DOM or the screen.

```ts
import { boxObject, insertLump, type Command, type Wing } from 'nabi-note'

const insertStamp: Command = (doc, sel, args, env) => {
  // args comes from outside - validate it
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
    action: { kind: 'command', command: 'insertStamp', args: { text: 'confirmed' } },
  },
}
```

| Argument | What it is |
|---|---|
| `doc` | The current document (an array of blocks). **Return a new one, do not mutate** |
| `sel` | Current selection |
| `args` | Whatever a button or context row passed. **Comes from outside - validate it** |
| `env` | Type knowledge - what holds what, what is an object node |

Return `{ doc, selection }` or **`null`**. Return `null` when nothing changes, so
`applyCommand` returns `false` and no undo point is pushed. The returned document is passed
through `cocoon` once more for cleanup, so no command can leave a rule-breaking document behind.

Callers always use the name:

```ts
nabi.applyCommand('insertStamp', { text: 'confirmed' })   // boolean
```

## Every slot (25 total, 2 required: `w`, `place`)

### What it is

| Slot | Meaning |
|---|---|
| `w` | This wing's name - becomes `w` in storage. Reserved words (`p`, `br`) are not allowed |
| `place` | `'mark'` on text, `'void'` an object with no content, `'container'` an object holding text, `'attr'` a paragraph attribute, `'tool'` leaves no trace in the document |
| `holds` | How it holds its content - `'blocks'` or `'inline'` |
| `singleParagraph` | Content is fixed to exactly one paragraph (a table cell) |
| `boolAttrs` | Names of boolean attributes whose only value is `1` |
| `allows` | Which wing names may appear inside. Omitted means all |
| `requiresAnyOf` | At least one of these must also be registered |
| `parts` | Button-less structure carried alongside (a table's rows/cells, a details' summary) |

### Value

| Slot | Meaning |
|---|---|
| `attrKey` / `attrValues` | The attribute name and allowed values for a paragraph-attribute wing |
| `currentValue` | Is it active right now - the toolbar/context row paints its button from this |

### In and out

| Slot | Meaning |
|---|---|
| `toHtml` / `partHtml` | Outgoing shape |
| `claim` | Decides who owns this tag on the way in |
| `repair` / `partRepair` | Cleans up this node on JSON entry. Returning `null` strips the whole node |

### Hands and keys

| Slot | Meaning |
|---|---|
| `commands` | The commands this wing adds |
| `onKey` | Intercepts a key first when the caret is inside this wing's node |
| `escapeKeys` | Keys that make the next typed character break out of this mark |
| `inputRules` | Autoformatting triggered by typed characters alone |
| `attach` | DOM-level behavior - table cell drag, code coloring |

### Appearance

| Slot | Meaning |
|---|---|
| `button` / `buttons` | One or more toolbar buttons |
| `context` | Context-row declaration |
| `styles` | CSS this wing carries |

## Naming `w`

`w` is the string repeated on every node in storage - shorter is better, which is why built-in
wings use `b`, `hl`, `tf`. A name collision fails registration, so a custom wing should use a name
a touch longer but guaranteed not to collide.

It does not need to match an HTML tag name - the outgoing tag is whatever `toHtml` decides.

**Renaming later breaks every already-saved document**, since `w` in storage is the name. If a
rename is unavoidable, keep accepting the old name through `claim` during a migration window.

## See also

- `llms/wings.md` - the 29 built-in wings, for comparison
- `llms/api-reference.md` - `simpleMark`/`valueMark`/`boxObject`/`listFamily` signatures,
  `insertLump`/`removeLump`/`toggleWrap`/`topNodeAt`
- `llms/overview.md` - `soul`/`flutter`/`outputHtml`, and why a command never sees the DOM
