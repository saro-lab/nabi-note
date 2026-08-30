---
title: Custom wings
description: The contract and implementation sequence for adding a durable document feature.
---

# Custom wings

A custom wing is more than a toolbar button. It is a declarative extension that keeps a saved document structure, commands, HTML and Markdown conversion, import rules, and view behavior together. The registry validates it before an editor exists, preventing invalid structures from entering documents.

## Start with the narrowest factory

Most formatting does not need a full declaration. Use `simpleMark()` for a valueless inline mark, `valueMark()` for a mark with a limited value set, `boxObject()` for a childless block, and `listFamily()` for a list.

```ts
import { createNabiWith, simpleMark, wings } from 'nabi-note'

const exStrong = simpleMark({
  w: 'exStrong',
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
})

const { nabi, registry } = createNabiWith(wings().allBasic().use(exStrong))
```

## Build several kinds of wing

Each example below has a different stored shape. Register one first and inspect `getJson()` and `getHtml()`. Add commands and buttons only after the structure works.

### 1. Valueless inline mark: emphasis

Use `simpleMark()` when a feature only wraps text. This stores `exStrong` and renders it as `<strong>`.

```ts
import { simpleMark } from 'nabi-note'

export const exStrong = simpleMark({
  w: 'exStrong',
  clearable: true,
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
  styles: '.nabi-content strong { font-weight: 700; }',
})
```

With `clearable: true`, Clear formatting removes this mark too. Before you add a button, apply it with `nabi.applyCommand()` or another custom command. The same `.nabi-content strong` selector styles editor and published content.

### 2. Inline mark with a value: status tone

Use `valueMark()` for color, size, or state chosen from an allowed set. The value is stored in `a.v`; values outside the list are removed during `repair()`.

```ts
import { valueMark } from 'nabi-note'

export const exTone = valueMark({
  w: 'exTone',
  key: 'v',
  values: ['quiet', 'loud'],
  clearable: true,
  toHtml: (node, children, ctx) =>
    ctx.element('span', children(), { 'data-ex-tone': String(node.a?.v ?? '') }),
  styles: `
    .nabi-content [data-ex-tone="quiet"] { opacity: .65; }
    .nabi-content [data-ex-tone="loud"] { color: var(--nabi-accent); font-weight: 700; }
  `,
})
```

Its saved form is `{ "w": "exTone", "a": { "v": "loud" }, "ch": ["Important"] }`. CSS targets the saved value, so it changes published content too. Do not casually remove values from an existing list: previously saved documents may lose them when read.

### 3. Childless block: divider

Use `boxObject()` for a standalone object with no children, such as an image, video, or divider.

```ts
import { boxObject } from 'nabi-note'

export const exDivider = boxObject({
  w: 'exDivider',
  toHtml: (_node, _children, ctx) => ctx.element('hr', ''),
  styles: '.nabi-content hr { border-color: var(--nabi-line); }',
})
```

For an object with values such as a URL or width, declare validation in `attrs` and put required values in `requires`. Reject an unverifiable value with `null` rather than silently substituting a default.

### 4. Block with several paragraphs: callout

For a block that holds document content, declare a `container`. `holds: 'blocks'` permits paragraph, list, and object-block children.

```ts
import type { Wing } from 'nabi-note'

export const exCallout: Wing = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      padding: 1rem;
    }
  `,
}
```

This declaration alone does not create a way to wrap selected paragraphs. Add a pure command in `commands` and a `button` that invokes it before exposing the feature in the editor UI.

### 5. A matched list and item pair

Use `listFamily()` where a list and item must always occur together.

```ts
import { listFamily } from 'nabi-note'

export const exList = listFamily({
  w: 'exList',
  item: 'exListItem',
  toHtml: (_node, children, ctx) => ctx.element('ul', children(), { class: 'ex-list' }),
  itemHtml: (_node, children, ctx) => ctx.element('li', children()),
  styles: '.nabi-content .ex-list { border-inline-start: 2px solid var(--nabi-line); }',
})
```

`listFamily()` repairs a block inside the list by wrapping it in an item. Add `itemDecl` and `repairItem` for an item-level value such as a checked state.

### Register in one ordered selection

Use the same declarations in the same order on the server as in the browser.

```ts
const selected = wings()
  .allBasic()
  .use(exStrong)
  .use(exTone)
  .use(exDivider)
  .use(exCallout)
  .use(exList)

const { nabi, registry } = createNabiWith(selected, { locale: 'en' })
```

## Define names and document structure

Names that enter a document must match `ex[A-Z0-9]...`. A name such as `exCallout` prevents a future official wing from changing the meaning of saved content.

`place` determines the stored shape: `mark` wraps inline content, `void` is a childless block, `container` holds children, `attr` changes paragraph attributes, and `tool` creates no document node. A `container` needs `holds: 'blocks' | 'inline'` and `toHtml()`.

```ts
const exNote = {
  w: 'exNote',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
} as const
```

`attrs`, `boolAttrs`, `allows`, `requiresAnyOf`, and `parts` declare structural constraints. A `parts` declaration also needs `partHtml` for each part. Use `attrKey` and `attrValues` to constrain a value-selecting wing.

## Every declaration option

Declare only what the wing needs. A factory already supplies some fields for you.

| Area | Options | Purpose |
| --- | --- | --- |
| Base | `w`, `place`, `basic`, `styles` | Name, structural kind, basic-catalog membership, default CSS |
| Structure | `holds`, `singleParagraph`, `attrs`, `boolAttrs` | Child kind, Enter behavior, allowed attributes, boolean attributes |
| Structure | `parts`, `allows`, `noAlign`, `requiresAnyOf` | Internal parts, allowed children, alignment exclusion, wing dependency |
| Values | `attrKey`, `attrValues`, `currentValue` | Stored value key and list, current-value detection |
| Commands and input | `commands`, `onKey`, `escapeKeys`, `doubleKeys`, `inputRules` | Commands, key handling, Escape/double-key behavior, autoformat rules |
| Surface behavior | `attach` | DOM behavior and cleanup for a surface |
| Conversion | `toHtml`, `partHtml`, `toMd`, `partMd` | HTML and Markdown output |
| Import and repair | `claim`, `ioFilter`, `repair`, `partRepair` | HTML import, file handling, JSON validation and repair |
| UI | `button`, `buttons`, `context` | Toolbar and context UI declarations |
| Clear formatting | `clearable` | Whether Clear formatting removes it |

`w` and `place` are always required. Node-producing `mark`, `void`, and `container` wings also require `toHtml()`. A container needs `holds`; every declared part needs its matching `partHtml`.

## Keep HTML, Markdown, and JSON together

`toHtml()` renders a saved node to HTML, while `toMd()` exports Markdown. Without a Markdown builder, generated HTML is retained so information is not lost. Use `claim()` to recognize only your own HTML element and validated attributes when importing.

`repair()` runs when JSON is loaded and again after commands. Return a corrected node for an invalid attribute, or `null` for a node that cannot be retained. Build HTML with `ctx.element()`, `ctx.escape()`, and `ctx.url()`; never concatenate tags, attributes, or URLs around those checks.

## Keep commands separate from view behavior

A command is a pure function of document and selection that returns the next document and a selection inside it. It never reads or changes the DOM, and returns `null` when it cannot make a valid change. Name commands in lower camel case beginning with a verb, such as `insertNote`.

Put DOM-only behavior, such as table drag selection, in `attach(host)`. Immediately register cleanup for every listener or changed attribute with `host.onDispose()` so failed setup is still cleaned up. Do not modify composing text DOM or the surface's selection mapping.

Declare toolbar and context controls with `button`, `buttons`, and `context`; duplicating their command rules in application UI can make UI and document model diverge.

## CSS styles

Put a wing's required baseline CSS in `styles`. Built-in wing styles are already included in `nabi-note/nabi.css`. A browser assembling selected registry styles can use `collectSheets()` and `injectSheets()`; SSR should link the CSS file instead.

Use the same classes and data attributes for editing and published content, but do not change editing `[data-key]` structure, `display`, or `white-space`. CSS must change appearance only, not caret mapping.

```ts
const exCallout = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      padding: 1rem;
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      border-radius: var(--nabi-radius);
    }
  `,
} as const
```

Target only classes or data attributes created by `toHtml()`. Keep service-specific changes narrower, for example `.article-body .ex-callout`.

## Verify the whole contract

Verify that a saved JSON document reloads to the same structure and HTML. Test that the registry rejects invalid names, duplicate commands, missing builders, and unsatisfied dependencies. Cover invalid HTML import and `repair()` input, command selection handling, SSR output, and a styled published view.

For complete types and factory arguments, check the installed declarations and the [English API reference](https://nabi.saro.me/llms/api-reference.md).
