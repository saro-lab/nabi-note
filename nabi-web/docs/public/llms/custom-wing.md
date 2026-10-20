# Custom wing contract

A wing is a declarative module. It may add a document word, pure commands, HTML/Markdown mapping, import logic, UI declarations, input rules, and one DOM attachment. The registry validates the declaration before an editor is created.

## Small factories

Use the narrowest factory when possible:

```ts
const exStrong = simpleMark({
  w: 'exStrong',
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
});

const exTone = valueMark({
  w: 'exTone',
  key: 'v',
  values: ['quiet', 'loud'],
  toHtml: (node, children, ctx) =>
    ctx.element('span', children(), { 'data-ex-tone': String(node.a?.v ?? '') }),
});

const exRule = boxObject({
  w: 'exRule',
  toHtml: (_node, _children, ctx) => ctx.element('hr', ''),
});

const exList = listFamily({
  w: 'exList',
  item: 'exItem',
  toHtml: (_node, children, ctx) => ctx.element('ul', children()),
  itemHtml: (_node, children, ctx) => ctx.element('li', children()),
});
```

The factory signatures are listed in `api-reference.md`. They return complete `Wing` values.

## Full shape

Required fields are `w` and `place`. A node-producing `mark|void|container` wing also needs `toHtml`. A container needs `holds`.

```ts
interface Wing {
  readonly w: string;
  readonly place: 'mark' | 'void' | 'container' | 'attr' | 'tool';

  readonly basic?: boolean;
  readonly holds?: 'blocks' | 'inline';
  readonly singleParagraph?: boolean;
  readonly isolating?: boolean;
  readonly attrs?: readonly string[];
  readonly boolAttrs?: readonly string[];
  readonly clearable?: boolean;
  readonly parts?: Readonly<Record<string, StructureDecl>>;
  readonly allows?: readonly string[];
  readonly noAlign?: boolean;
  readonly requiresAnyOf?: readonly string[];

  readonly attrKey?: string;
  readonly attrValues?: readonly (string | number)[];
  readonly currentValue?: (node: ElementNode) => string | undefined;

  readonly commands?: Readonly<Record<string, Command>>;
  readonly scopedCommands?: readonly string[];
  readonly onKey?: OnKey;
  readonly escapeKeys?: readonly string[];
  readonly doubleKeys?: Readonly<Record<string, string>>;
  readonly inputRules?: readonly InputRule[];
  readonly attach?: Attach;

  readonly toHtml?: HtmlBuilder;
  readonly partHtml?: Readonly<Record<string, HtmlBuilder>>;
  readonly toMd?: MdBuilder;
  readonly partMd?: MdBuilders;
  readonly claim?: (
    el: ParseElement,
    inner: (block: boolean) => NabiNode[],
  ) => NabiNode[] | null;
  readonly ioFilter?: IoFilter;
  readonly repair?: (node: ElementNode) => ElementNode | null;
  readonly partRepair?: Readonly<Record<string, (node: ElementNode) => ElementNode>>;

  readonly button?: WingButton;
  readonly buttons?: readonly WingButton[];
  readonly context?: WingContext;
  readonly styles?: string;
}
```

## Structure rules

Prompt `WingField` and UI `PromptField` accept `kind: 'text' | 'url' | 'textarea'`. A textarea prompt spans the toolbar width and wraps across four visible lines on desktop or six on mobile, shrinking to fit the visible space above the keyboard. `singleLine: true` replaces actual line breaks with spaces on input while retaining visual wrapping. Enter confirms; Shift+Enter inserts a line break only when `singleLine` is absent or false. Enter during IME composition never submits.

Prompt actions, prompt context controls, and `PromptOptions` accept `submitOnOutside: true`. This removes the confirmation button and submits valid values when a pointer press outside closes the prompt. Enter also submits. Escape and programmatic closure cancel; invalid values close without submission. Built-in footnote insert/edit prompts enable this option.

- `mark`: inline wrapper around text/content.
- `void`: block object with no children. A custom wing cannot declare an inline terminal; that capability is internal to the official `fn` footnote wing.
- `container`: block object; declare `holds: 'blocks'|'inline'`.
- `attr`: changes a paragraph attribute; current core keys are only `h`, `a`, and `dc`.
- `tool`: creates no document node.
- `parts` belongs only to a container. Every part needs a matching `partHtml`.
- `singleParagraph` makes Enter insert a line rather than split structure.
- `isolating` protects a block holder's editing boundary while allowing multiple paragraphs. It is available on a block container or a block-holding `StructureDecl` part. Backspace/Delete do not join its content with a neighboring scope.
- `boolAttrs` retain numeric `1` only.
- `allows` names the only child types. Disallowed wrappers are peeled while recoverable text remains.
- `noAlign` is valid only on `void` or `container` objects.
- `requiresAnyOf` requires at least one named wing at registration.

Names become durable document vocabulary. Every custom wing, part, and declared attribute name must match the complete pattern `^ex[A-Z0-9][A-Za-z0-9]*$`, for example `exNote` or `ex2Column`. This prevents a future official word from reinterpreting stored content. Official names are accepted only from package-owned declarations and their same-name object spread clones.

`clearable: true` is valid only on a mark or paragraph-attribute wing. It declares that `clearFormat` removes that capability. Boolean attributes must also appear in the owning type's `attrs` list. `holds` must be exactly `blocks` or `inline`, and `singleParagraph` is valid only on a block holder.

## Pure commands

```ts
const setFlag: Command = (doc, selection, args, env) => {
  if (args.enabled !== true && args.enabled !== false) return null;
  return {
    doc: nextDoc,
    selection: nextSelection,
  };
};
```

- Inputs are readonly and may be shared.
- `args` is untrusted.
- Return `null` for no valid change.
- Returned selection must exist in the returned document.
- Use document helpers such as `insertLump`, `removeLump`, `toggleWrap`, and `topNodeAt`.
- Do not access the DOM from a command.
- Command names must be lower camel case with at least a verb and object, such as `insertNote`.
- Two wings may not own the same command.

### Commands scoped to a block container

A `container` with `holds: 'blocks'` may declare `scopedCommands` containing wing command names. When both selection endpoints are inside the same nearest declaring container, the registry runs those commands on that container's child document with relative selection paths, then restores the outer document and absolute selection paths. If only one endpoint is inside, or they are in different scopes, the command is rejected. Outside such a container, the original command runs unchanged. Core commands cannot be scoped this way.

Names must follow the command naming rule. Missing commands are ignored so an optional image or table wing is not required just because its insertion command is listed. Only list commands whose arguments and results use the supplied child document; do not list commands expecting absolute document paths or whole-document replacement. Block-holding `StructureDecl` parts can also declare `scopedCommands`. The built-in float and table cells use this for block insertion/conversion and upload commits.

For example, this isolated note keeps image insertion in its own child document while allowing multiple paragraphs:

```ts
import { createNabiWith, imageWing, type Wing } from 'nabi-note';

const exNote: Wing = {
  w: 'exNote',
  place: 'container',
  holds: 'blocks',
  isolating: true,
  scopedCommands: ['insertImage'],
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { 'data-ex-note': '1' }),
  claim: (el, inner) =>
    el.tag === 'aside' && el.attrs['data-ex-note'] === '1'
      ? [{ w: 'exNote', ch: inner(true) }]
      : null,
};

const { nabi } = createNabiWith([exNote, imageWing], {
  doc: [{ w: 'p', ch: [{ w: 'exNote', ch: [{ w: 'p', ch: ['A note.'] }] }] }],
});
const start = { path: [0, 0, 0], offset: 0 };
nabi.select({ anchor: start, focus: start });
nabi.applyCommand('insertImage', { src: '/images/reference.png' });
```

The image becomes a sibling of the note's inner paragraph. Register the same custom wing when loading its JSON or HTML in another editor or renderer. `isolating` controls editing boundaries and `scopedCommands` controls only the named wing commands; neither replaces the other.

## HTML and import

Use `HtmlContext.element`, `wrap`, `escape`, `url`, and `src`. They enforce tag/attribute grammar, escaping, editor keys, fillers, and URL policy.

`claim(el, inner)` receives the parsed element and may return imported nodes. Return `null` when the element is not yours. Claims run in wing order; the first non-null answer wins. Validate every claimed attribute.

`repair` also runs on JSON input and after commands. Return a corrected node, or `null` to reject it. A rejected mark is peeled so text remains; a rejected block object is removed.

When `toMd` is absent, Markdown export falls back to the wing's generated HTML. This is preferred to losing unsupported content.

## Input and DOM attachment

`inputRules` declare `space` or `enter` triggers and return a command name plus args. Registered rules are the only autoformat rules.

`onKey` runs when the selection is owned by the wing. Return a command outcome or `null`.

Inside an isolating holder, a `null` result passes to the next ancestor wing up to that holder. Each wing is visited once. This lets list/code indentation handle Tab before the cell's navigation handler. `KeyIntent.shift` distinguishes Shift+Enter from Enter.

`attach(host)` is the only wing-level DOM lifecycle hook. It receives the surface root, editor, `pathOfKey()`, and the cleanup registration hook `onDispose()`; return a detach function. Use it for behavior that cannot be expressed as a pure command, such as table drag selection or code paint. Avoid changing composing DOM.

```ts
interface AttachHost {
  readonly root: HTMLElement;
  readonly nabi: Nabi;
  doc(): NabiDoc;
  readonly env: EditEnv;
  pathOfKey(id: string): readonly number[] | null;
  onDispose(dispose: () => void): void;
}

type Attach = (host: AttachHost) => () => void;
```

Call `host.onDispose()` immediately after every direct side effect and before later setup can throw. The returned detach function remains supported for a successful attachment. If `attach()` throws, the surface rolls back cleanup that was already registered with `onDispose()`. A direct side effect that a trusted attachment does not register cannot be observed or rolled back automatically. `onDispose()` is valid only during the synchronous `attach()` call.

## UI declaration

`button` or `buttons` declares toolbar controls. Actions are:

- `command`, `mark`, `menu`, `grid`, `prompt`, `file`, or `host`.

`context.controls` may declare button, toggle, select, range, text, prompt, or lightbox controls. Generic UI reads these declarations; application code should not duplicate their argument rules.

The legacy `shortcut` field remains compatibility metadata. It accepts one uppercase Latin letter, one digit, or an up/down arrow label, and duplicates are rejected. It no longer renders a badge or binds a letter after double-Shift. The Tools palette uses group and icon navigation instead. An accelerator must be `mod+<lowercase letter>` and must be unique. A `doubleKeys` key must be unique and point to an existing command.

Set `basic: true` only when the official wing runs without host wiring. `allBasic()` uses this flag while scanning the official catalog; custom wings enter through `use(customWing)` and are not auto-discovered.

## Registry output and failures

`makeRegistry()` derives:

- schema/edit environment;
- HTML and Markdown builder maps;
- commands;
- import claims;
- input rules and attachments;
- escape and double-key maps;
- ordered IO filters;
- `ownerOf(type)` and `wingOf(name)`.

Registration throws for reserved/duplicate names, missing builders, invalid container/part declarations, invalid paragraph attributes, dependency failures, unknown `allows` types, duplicate command/shortcut/accelerator/filter/double-key claims, and double keys pointing to missing commands.

Failing at registration is intentional. Do not catch and continue with a partial registry.

## Icon declarations

`WingButton`, `WingChoice`, and icon-capable context controls support `icon?: string` for a packaged default asset ID (for example `marks-b`). File URLs belong in CSS variables, not this field. Existing trusted `svg` declarations are retained; a CSS theme override takes precedence. The renderer derives stable CSS keys from slot, wing, control, and choice identifiers. See `icons.md` for the naming and escaping rules. Text choices and swatches keep their existing rendering.
