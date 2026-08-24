---
title: Build your own wing
description: A guide to writing NABI NOTE's Wing interface contract to build new custom formatting and features.
---

# Build your own wing

A wing is **one plain JavaScript object.** There's no class to extend and no separate
framework registration step — putting the object in the array you hand to `createNabiWith`
registers it immediately.

Every official wing that ships with NABI NOTE — bold, tables, file upload, all of them — is
written to the exact same `Wing` interface spec. A custom wing you write yourself runs in
**exactly the same environment and under the same conditions** as a built-in one.

---

## The simplest wing example

An inline mark wing that supports the `<kbd>` keyboard tag.

```ts
import { createNabiWith, mountSurface, simpleMark, type Wing } from 'nabi-note'
import 'nabi-note/nabi.css'

const kbdWing: Wing = {
  ...simpleMark({
    w: 'kbd',                                                   // this wing's unique id (the key stored in the nabi-tree)
    toHtml: (_node, children, ctx) => ctx.element('kbd', children()),   // HTML output function
  }),
  // detects <kbd> tags in incoming HTML and converts them into a nabi-tree node
  claim: (el, inner) => (el.tag === 'kbd' ? [{ w: 'kbd', ch: inner(false) }] : null),
}

const surface = document.querySelector<HTMLElement>('#editor')!
const { nabi, registry } = createNabiWith([kbdWing])
mountSurface({ nabi, registry, root: surface })
```

Now the editor preserves the `<kbd>` tag — the markup survives clipboard paste, `setHtml()`,
and saving and loading again.

```
registered:      <p>Shortcut: <kbd>Ctrl</kbd>+<kbd>S</kbd></p>   →   <kbd> tag preserved
not registered:  <p>Shortcut: <kbd>Ctrl</kbd></p>                →   <p>Shortcut: Ctrl</p> (converted to plain text)
```

`toHtml` is the serialization function that exports a nabi-tree node to HTML, and `claim` is
the deserialization rule that reads external HTML back into a nabi-tree node. Without
`claim`, HTML output still works, but on save-and-reload the tag is converted to plain text.

Use the `simpleMark()` helper for a mark with no attributes, `valueMark()` for a mark that
carries a value, `boxObject()` for a standalone lump, and `listFamily()` for a list
structure — all of them cut down on boilerplate.

---

## Wing modules and factory functions

**Most built-in wings are predefined, immutable constant objects** (`boldWing`,
`headingWing`, and so on). Only the wings that need extra configuration options are offered
as factory functions.

```ts
makeImageWing({ allowLocalUrls: true })
makeUploadWing({ allowLocalUrls: true })
```

To change only a specific built-in wing's behavior (a syntax highlighter, say), spread the
existing wing object and override just the fields you need.

```ts
const wing = { ...codeWing, attach: makeCodeAttach({ highlight: myHighlighter }) }
```

---

## Registration order and validation

```ts
const { nabi, registry } = createNabiWith([boldWing, italicWing, kbdWing])
```

**Array order is HTML scan priority.** When parsing external HTML (`claim`), wings are
checked in registration order, and whichever wing first claims ownership handles that tag. A
tag no wing claims has its tag stripped, keeping only the inner text.

Toolbar button placement is decided **by button group (`button.group`) order first**, and
only within the same group does wing registration order decide placement.

### Validation and exceptions (strict validation)

`createNabiWith` doesn't defer a runtime error when a wing that violates the spec is
registered — it **throws an exception immediately, at initialization time.**

| What's checked | Violation example |
|---|---|
| Using a reserved identifier | `w: 'p'`, `w: 'br'` |
| Registering a duplicate `w` identifier | Passing the same `boldWing` twice |
| Missing render function | `place: 'mark'` with no `toHtml` defined |
| Breaking the command naming convention | Not verb+noun camelCase (e.g. `insertTable`) |
| Missing a required dependent wing | An upload wing missing the image/link wing named in `requiresAnyOf` |

---

## Commands — pure functions

Every operation that changes the document runs through a command function. A command is a
**pure function that depends on neither the DOM API nor screen rendering.**

```ts
import { boxObject, insertLump, type Command, type Wing } from 'nabi-note'

const insertStamp: Command = (doc, sel, args, env) => {
  // validate the external argument's type
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

| Parameter | Description |
|---|---|
| `doc` | The current nabi-tree document array (treated as immutable — returns a new document rather than mutating it directly) |
| `sel` | The current caret and selection state (`{ anchor, focus }`) |
| `args` | The argument object passed from a toolbar button or the UI |
| `env` | Schema knowledge and environment context |

A command returns either the changed `{ doc, selection }` object or **`null`**. **If the
document doesn't change, it must return `null`.** When it returns `null`, `applyCommand`
returns `false` and no unnecessary undo-history entry is created. The returned document
passes through the `cocoon` (normalization) engine, so schema integrity is guaranteed.

The host calls a command by name.

```ts
nabi.applyCommand('insertStamp', { text: 'OK' })   // returns a boolean
```

---

## The `Wing` interface in full

The `Wing` interface has 31 properties in total, of which **2 are required** (`w`, `place`).

### 1. Basic identity and structure

| Property | Description |
|---|---|
| `w` | This wing's unique identifier (required; reserved words `p`, `br` excluded) |
| `place` | The wing's type (required: `'mark'` inline formatting, `'void'` an empty-bodied lump, `'container'` a container lump, `'attr'` a paragraph attribute, `'tool'` a tool not stored in the document) |
| `basic` | Whether the wing runs out of the box, with no additional backend/host wiring (`boolean`, default `false`). Used as the filter criterion when `wings().allBasic()` is called |
| `holds` | The child type a container allows inside it (`'blocks'` or `'inline'`) |
| `singleParagraph` | Whether the inside is fixed to a single paragraph (e.g. a table cell) |
| `boolAttrs` | Names of boolean attributes expressed only as `1` |
| `allows` | The list of child wing names allowed inside the container (if unspecified, all are allowed) |
| `noAlign` | Whether to block text alignment on the wrapper paragraph (`boolean`, lumps only). Used to keep `pre`-tag alignment from breaking in things like code blocks |
| `requiresAnyOf` | The list of dependent wings that must be registered alongside this one (at least one is required) |
| `parts` | Definitions for sub-components that belong to the wing (a table's rows/cells, a details block's summary, and so on) |

### 2. Attributes and state management

| Property | Description |
|---|---|
| `attrKey` · `attrValues` | The attribute key a paragraph-attribute wing uses, and its list of allowed values |
| `currentValue` | A function that returns the attribute value at the current caret position (used to show a toolbar button's active state) |

### 3. Serialization and I/O

| Property | Description |
|---|---|
| `toHtml` · `partHtml` | The serialization function that converts a nabi-tree node to HTML |
| `toMd` | The serialization function that converts a nabi-tree node to Markdown (optional — falls back to `toHtml` if not defined) |
| `partMd` | The Markdown serialization function for the wing's sub-components (`parts`) |
| `ioFilter` | A file I/O and clipboard filter the wing supports on its own |
| `claim` | The function that decides ownership of incoming HTML markup and converts it into a nabi-tree node |
| `repair` · `partRepair` | The function that validates and corrects a node's integrity on JSON load (returning `null` removes the node) |

### 4. Input and event control

| Property | Description |
|---|---|
| `commands` | The map of command functions the wing provides |
| `onKey` | A handler that intercepts keyboard input while the caret is inside this wing's node |
| `escapeKeys` | The list of keys that trigger leaving this mark's formatting on the next character typed |
| `doubleKeys` | A mapping of commands to run when a key is pressed twice within 350ms (`{ key name: command name }`, e.g. Esc Esc → clear formatting) |
| `inputRules` | Formatting-conversion rules that run automatically based on typing patterns |
| `attach` | A hook for binding or controlling event listeners directly on a DOM element (table drag, code highlighting, and so on) |

### 5. UI and styling

| Property | Description |
|---|---|
| `button` · `buttons` | The button definition(s) rendered on the top toolbar |
| `context` | The context-toolbar definition that appears based on caret position |
| `styles` | The CSS stylesheet string the wing bundles |

---

## Extending with IO filters

**An IoFilter is an extension point that handles clipboard paste and file save/open
formats, without directly creating document nodes.**

| Field | Description |
|---|---|
| `id` · `label` | The filter's unique identifier and the label shown in the UI (a duplicate identifier throws an exception) |
| `paste` | A function that inspects clipboard data (`PasteData`) and returns paste candidates |
| `save` | The save configuration object (`{ extension, write, lossy?, mime? }`) |
| `read` | A function that takes a filename and text and parses them into a nabi-tree (returns `null` on no match) |

All three of an IO filter's methods are optional. It can be registered through a mount
option (`mountSurface`, `mountFile`), through `createNabiWith({ ioFilters })`, or through a
wing's own `ioFilter` property — and whichever filter is registered first takes priority.

---

## Naming an identifier (`w`)

`w` is **the identifier string stored repeatedly on every node in the nabi-tree.** Use a
short string to minimize serialization size (as with the built-in wings' `b`, `hl`, `tf`,
and so on).
To avoid colliding with an official wing, it's recommended that a custom wing use an `ex`
prefix (e.g. `exNote`, `exStamp`).

::: warning Careful when renaming an identifier
Since a stored document's `w` field maps directly to the identifier, renaming it can make a
previously saved document unrecognizable when loaded. If you need to migrate, write `claim`
to also handle the old identifier.
:::

---

## Next

- [Build an inline mark](./custom/inline) — `claim` · `toHtml` · `escapeKeys`
- [Build a block and paragraph attribute](./custom/block) — `place` · `holds` · `allows` · `parts` · `attrKey`
- [Keys, auto-conversion, and paste](./custom/input) — `onKey` · `inputRules` · `attach`
- [UI and interaction](./custom/ui) — `button` · `context` · `styles`, and wiring up user dialogs

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
