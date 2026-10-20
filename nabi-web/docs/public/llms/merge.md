# Three-way merge

Part of the 1.5.1 package contract. The web merge guide and its automatic/partial merge examples are available in every documentation locale; controls, messages, and sample content use the page language.

Use `nabi-note/merge` independently of the diff wing. It compares an editing-start base with the local edit and the newly saved incoming document. The UI is base on the left, an editable result in the middle, and incoming on the right.

## Inputs and automatic merging

```ts
import { makeRegistry, wings } from 'nabi-note';
import { mergeDocs } from 'nabi-note/merge';

const registry = makeRegistry(wings().allBasic().build());
const model = mergeDocs(base, local, incoming, registry, { allowLocalUrls: false });
if (!model) throw new Error('Invalid or incompatible merge documents');
```

Inputs are stored NABI TREE JSON or HTML strings. JSON merging is DOM-free; HTML requires global `DOMParser`. Use the same registry and wing options that own all input documents. Invalid input returns `null`; JSON containing unregistered node types or requiring destructive schema repair is rejected instead of silently dropping content. Internal IDs are not matching keys.

`DocMerge` contains normalized `base`, `local`, `incoming`, `result`, and `conflicts`. Automatic merging happens before the result is exposed:

- A change made on only one side is applied.
- Identical changes on both sides are applied once.
- Changes to separate paragraphs or explicit lines are combined.
- Different changes to the same line, different insertions at the same position, or delete/edit overlap remain conflicts.
- Tables, lists, floats, and other structural blocks are atomic. Concurrent different edits to their contents or attributes conflict as a whole.
- Repeated text or overlapping moves that cannot be located safely are kept conservative and may produce `reason: 'ambiguous'` conflicts.

Line boundaries are stored paragraph boundaries and explicit breaks, not visual wrapping from viewport width. Different words changed on the same line can conflict. Automatic merge keeps inline marks, owned attributes, and structural content; conflict colors and controls are never inserted into stored content. An unresolved region initially contains the local version.

Each `MergeConflict` has `id`, source fragments `base`, `local`, and `incoming`, base/incoming/result unit ranges, and `reason: 'overlap' | 'ambiguous'`. A `MergeUnit` identifies a logical line or atomic block, with `node`, `boundary`, `paragraph`, `start`, and `end`. Unit offsets are not DOM paths or character offsets into the whole document.

## Editable session

```ts
import { createMergeSession } from 'nabi-note/merge';

const session = createMergeSession({
  base,
  local,
  incoming,
  wings: wings().allBasic().build(),
  locale: 'en',
});

const state = session.getState();
const stop = session.onChange(next => showCount(next.unresolvedCount));
session.resolve(conflictId, 'incoming');

const json = session.nabi.getJson();
const html = session.nabi.getHtml();
stop();
session.dispose();
```

`MergeSessionOptions` accepts `base`, `local`, `incoming`, `wings` (a wing array or builder), optional `locale`, `allowLocalUrls`, and `editorOptions` excluding `doc`. Invalid input throws a `TypeError` when creating a session or mount.

The session exposes `nabi`, `registry`, the initial `model`, `getState()`, `getChanges()`, `applyChange()`, `resolve()`, `onChange()`, `hold()`, and `dispose()`. `MergeState` contains a monotonic `revision`, conflict states, `unresolvedCount`, `canApply`, and `canConfirm`. Each conflict state adds `status: 'unresolved' | 'base' | 'incoming' | 'current'` and `ambiguous`. Its result range follows edits in the middle document. `hold()` temporarily prevents resolution/confirmation and returns an idempotent release callback; release every acquired hold.

`canApply` is false while disposed, held, or locked. Use it to disable source selection even if conflicts remain.

### Apply one changed line

```ts
const changes = session.getChanges('incoming');
const chosen = changes[1];
if (chosen) session.applyChange(chosen);
```

`getChanges('base' | 'incoming')` compares that source against the current result, including changes outside unresolved conflicts. Each `MergeChange` has `id`, `source`, `revision`, `sourceStart`, `sourceEnd`, `resultStart`, `resultEnd`, `kind` (`insert`, `delete`, or `replace`), `conflictIds`, and `ambiguous`. Offsets identify logical merge units, not visual wrapped rows. Adjacent ordinary lines have separate actions, including explicit breaks within one paragraph. Structural blocks remain whole. Paragraph-wide attribute changes and ambiguous repeated/moved content can require grouped actions.

`applyChange(change)` applies only that current source fragment as one undo step. It verifies the revision and all proposal fields; stale, altered, ambiguous, held, locked, or disposed actions return `false`. Re-read changes after any edit, resolution, undo, or redo. A partially adopted conflict remains unresolved until its source fragment is complete or the host resolves the current content. Other changes and conflicts are preserved. Stored JSON and HTML never include comparison markup.

Resolution values:

- `base`: replace the region with the editing-start version.
- `incoming`: replace the region with the incoming version.
- `current`: accept the current region after keeping or editing it.

Typing or deleting a conflict region alone does not resolve it. A resolved region stays resolved through subsequent editing. Undo/redo restores document changes and conflict resolution together, including a status-only `current` resolution. Selecting a pane does not replace the entire document or reset editor history.

If an edit crosses a conflict boundary and the source range is no longer safe, the conflict is marked ambiguous and source replacement is disabled. The user can finish editing and accept `current`. Invalid IDs, disposed sessions, or unavailable operations return `false` from `resolve()`.

The result is an ordinary editor using the supplied wings. The session does not enforce a reduced set of formatting or structural commands. Input, paste, tables, lists, images, and other editor capabilities remain available when assembled. Store `nabi.getJson()` or `nabi.getHtml()`, never surface DOM or `getEditorHtml()`.

## Mounted merge UI

```ts
import { mountMerge } from 'nabi-note/merge';
import 'nabi-note/nabi.css';

const merge = mountMerge({
  root,
  base,
  local,
  incoming,
  wings: wings().allBasic().build(),
  locale: 'en',
  incomingVersion: serverVersion,
  async onConfirm({ json, html, incomingVersion, signal }) {
    return saveIfVersionMatches({ json, html, incomingVersion, signal });
  },
  onError(error) {
    report(error);
  },
});

await merge.confirm();
merge.unmount();
```

`mountMerge()` owns the panes, middle editing surface, toolbar, conflict controls, remaining count, and confirmation button. It returns `nabi`, `registry`, `session`, `content: HTMLElement`, `surface: Surface`, `toolbar: Toolbar`, `confirm(): Promise<boolean>`, and idempotent `unmount()`. `content` is the middle editing root; the surface and toolbar are already mounted. It is not a wing and does not replace an existing host editor's document.

`toolbarOptions` accepts toolbar configuration except package-owned roots, editor, registry, surface, locale, and translator. Use it for custom panels and host commands. `surfaceOptions` accepts surface configuration except the package-owned root, editor, registry, locale, and `allowLocalUrls`. The mount injects the required core, registered-wing, and `MERGE_CSS` styles with lifecycle cleanup. `MERGE_CSS` is also exported for host style assembly.

All safely mergeable edits are already applied when mounted. With no conflicts, confirmation is available without any resolution action. Source panes show numbered logical lines, colored changes, and inline text differences. Each changed line has its own arrow in the gutter connecting it to the editable result: left arrows restore base content and right arrows accept incoming content. This also permits revising automatically merged changes. Clicking a conflict row selects it for the current-content resolution control. The panes scroll together, and narrow layouts retain the three-column comparison. Fullscreen fills the viewport and all three panes use the remaining height. Confirmation is disabled until all conflicts are resolved and editing/confirmation is ready.

`onConfirm` receives a `MergeResult` containing `{ json, html, revision, incomingVersion?, signal }`. `incomingVersion` is the optional string or number supplied by the host; the package does not fetch or verify server versions. The callback returns `void`, `boolean`, or a Promise of either. `false` rejects confirmation; thrown/rejected errors are reported via `onError`. Pending confirmation temporarily locks editing/resolution and prevents duplicate submission. Unmounting aborts its signal. A successfully confirmed revision cannot be submitted again until the result changes. Active IME composition prevents confirmation and source replacement until composition ends.

The host must check its server revision when persisting. An abort signal does not undo a server write. If the server changed again, keep the result and start a fresh merge against the newly fetched version rather than overwriting it. The component does not automatically save, close the host page, or advance a server version.

Call `unmount()` when removing the host. For a headless session, unsubscribe listeners and call `dispose()`.

## Uploads and asynchronous work

Register `upload` alongside the document wings, then connect toolbar `onFiles` and surface `fileSink` to an upload mount. Use the returned `content` root for upload or progress mounts instead of mounting another editing surface.

```ts
import { mountUpload, wings, type UploadMount } from 'nabi-note';
import { mountMerge } from 'nabi-note/merge';

let upload: UploadMount | undefined;
let releaseUpload: (() => void) | undefined;
const merge = mountMerge({
  root,
  base,
  local,
  incoming,
  wings: wings().allBasic().use('upload').build(),
  incomingVersion: serverVersion,
  toolbarOptions: { onFiles: files => upload?.take(files) },
  surfaceOptions: { fileSink: files => upload?.take(files) },
  onConfirm: ({ json, html, incomingVersion, signal }) =>
    saveIfVersionMatches({ json, html, incomingVersion, signal }),
});

upload = mountUpload({
  nabi: merge.nabi,
  root: merge.content,
  uploader: sendUpload,
  onStart() {
    releaseUpload = merge.session.hold();
  },
  onDone() {
    releaseUpload?.();
    releaseUpload = undefined;
  },
});

function dispose() {
  upload?.unmount();
  releaseUpload?.();
  merge.unmount();
}
```

`sendUpload` implements the normal uploader contract and returns `{ uri }` or `null`; see `quickstart-npm.md` and `io-security.md`. Acquire the hold in `onStart` and release in `onDone`, after insertion or cancellation, rather than immediately after the network response. Upload `unmount()` does not invoke `onDone`, so host teardown releases the hold explicitly. Release holds in failure paths too. A hold blocks conflict resolution and confirmation while asynchronous work remains; it does not itself lock all editing. `mountUpload()` owns its upload editing lock.

Host-created upload views and other auxiliary mounts are not owned by `mountMerge()`. Dispose them first, then unmount the merge. Do not separately remount or replace the package-owned surface or toolbar.
