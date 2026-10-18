---
title: Merge
description: Combine the editing-start version, your version, and the version saved in the meantime, then edit remaining conflicts to resolve them.
---

<script setup>
import MergeDemo from '../../.vitepress/ui/MergeDemo.vue'
</script>

# Merge

If other changes were saved while you were editing, combine both sides using the version you started editing as the base. All safely mergeable changes are applied immediately; only overlapping changes remain conflicts. Merge is a standalone view from `nabi-note/merge`, not a wing.

| Left | Middle | Right |
| --- | --- | --- |
| Version when editing started | Your current document with automatic merging applied | Version saved while you were editing |
| Read-only | Directly editable | Read-only |

In the middle, edit text, formatting, tables, lists, images, and more as in a normal editor. The supplied wings determine the available features. Conflict markers and resolution status are not mixed into the saved content.

## An example that merges entirely automatically

You changed the meeting time to **11 AM**, and someone else changed the location to the **third-floor meeting room**. These changes affect separate paragraphs, so both appear in the middle result.

With no remaining conflicts, you can click **Confirm** immediately. You can also refine the middle text before confirming. The final document shown below is the actual result received by the confirmation callback.

<MergeDemo />

## An example that merges only partly automatically

This time you changed the meeting time to **11 AM**, and someone else changed it to **2 PM**. Different edits to the same paragraph leave the time in conflict. Your change of organizers to **Jimin and Seoyeon** and the other person's location change to the **third-floor meeting room** are applied automatically.

Resolve a conflict using one of these actions:

- Left **&gt;&gt;**: use the corresponding content from the editing-start version.
- Right **&lt;&lt;**: use the corresponding content from the newly saved version.
- **Resolve with current content**: keep or edit the middle content, then mark it resolved.

Change the time sentence in the middle as you wish, then click **Resolve with current content**. Confirmation becomes available only when all remaining conflicts are resolved.

<MergeDemo partial />

Editing a resolved region keeps its resolved status. Undoing a resolution also undoes its status; redo restores it. Simply deleting or editing text does not automatically resolve an unresolved conflict.

## Automatic merging and conflict rules

Compare changes from the editing-start document to your document and from that same starting document to the new version. One-sided changes and identical changes on both sides are applied automatically. Changes to separate paragraphs or lines are also combined.

Like Git text merging, overlaps are determined by paragraphs and lines. Even different words changed on the same line remain a conflict rather than being mixed automatically. Different insertions at the same position and edits to content deleted by the other side also require your decision.

If both sides make different edits to a structured block such as a table, list, or float, the whole structure conflicts. Cells and list items are not mixed arbitrarily; select the content or edit it in the middle. Overlapping moves and edits that cannot be located reliably are not applied automatically either.

## Connect a standalone merge view

Pass saved NABI TREE JSON or HTML strings as `base`, `local`, and `incoming`. Use the same wings and options as the editor that created the documents. `mountMerge()` creates the middle editor and toolbar, both source panes, conflict controls, and confirmation button together.

```ts
import { wings } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'
import 'nabi-note/nabi.css'

const merge = mountMerge({
  root: document.querySelector('#merge')!,
  base: editingStartedDocument,
  local: myEditedDocument,
  incoming: latestDocument,
  wings: wings().allBasic().build(),
  locale: 'en',
  incomingVersion: latestVersion,
  async onConfirm({ json, html, incomingVersion, signal }) {
    return saveDocument({ json, html, expectedVersion: incomingVersion, signal })
  },
  onError(error) {
    showError(error)
  },
})
```

`onConfirm` receives the fully resolved current result's JSON, published HTML, editing revision, and `incomingVersion`. Returning `false` leaves confirmation incomplete. While its Promise is pending, result editing, conflict selection, and duplicate confirmation are temporarily blocked. Unmounting aborts the result's `signal`. During Korean IME composition, confirmation waits until composition ends.

Connect separate actions such as your service's image picker or uploads as with a normal editor. Pass toolbar panels and host actions through `toolbarOptions`, and editing-surface options through `surfaceOptions`.

`incomingVersion` returns the value supplied by the host unchanged. The service must compare it with the latest server version when saving. If another version was saved during merging, fetch the latest document and start a new merge instead of overwriting it with a stale result.

You can also read state or request confirmation from outside the view.

```ts
const stop = merge.session.onChange((state) => {
  updateRemainingCount(state.unresolvedCount)
})

const canConfirm = merge.session.getState().canConfirm
const confirmed = await merge.confirm()

stop()
merge.unmount()
```

Read the current result with `merge.nabi.getJson()` and `merge.nabi.getHtml()`. Do not save the editing DOM or `getEditorHtml()`. To apply only selected earlier content between two versions, use click merge in [Comparison](./compare).

## Confirm after uploads finish

Connect the `upload` wing and `mountUpload()` for the file button, paste, and drag and drop. `sendUpload` sends files to your server and returns `{ uri }`. See [File upload](../wing/etc/upload) for a complete server-connection and progress-display example.

Use `merge.session.hold()` to defer confirmation and conflict selection during asynchronous work, such as uploads, that has not yet reached the document. Call the returned function on completion, cancellation, or teardown to release the hold. Release **after insertion into the document**, not immediately after the server upload, so the file is included in the final result.

```ts
import { mountUpload, wings, type UploadMount } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'

let upload: UploadMount | undefined
let releaseUpload: (() => void) | undefined

const merge = mountMerge({
  root,
  base,
  local,
  incoming,
  wings: wings().allBasic().use('upload').build(),
  locale: 'en',
  incomingVersion: latestVersion,
  toolbarOptions: { onFiles: (files) => upload?.take(files) },
  surfaceOptions: { fileSink: (files) => upload?.take(files) },
  onConfirm: ({ json, html, incomingVersion, signal }) =>
    saveDocument({ json, html, expectedVersion: incomingVersion, signal }),
})

upload = mountUpload({
  nabi: merge.nabi,
  root: merge.content,
  locale: 'en',
  uploader: sendUpload,
  onStart() {
    releaseUpload = merge.session.hold()
  },
  onDone() {
    releaseUpload?.()
    releaseUpload = undefined
  },
})

function dispose() {
  upload?.unmount()
  releaseUpload?.()
  merge.unmount()
}
```

`merge.content` is the middle editing DOM; `merge.surface` and `merge.toolbar` are the already mounted editing surface and toolbar. Do not mount another surface or toolbar there. Dispose any additional upload or progress mounts first, then call `merge.unmount()`.
