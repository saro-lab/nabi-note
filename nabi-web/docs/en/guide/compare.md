---
title: Comparison
description: Compare two documents side by side and apply selected earlier content to the current document.
---

<script setup>
import CompareDemo from '../../.vitepress/ui/CompareDemo.vue'
</script>

# Comparison

Compare two saved documents side by side to see what changed. The comparison can open without an editor; connect a callback to apply selected earlier content to the current document.

## Apply selected earlier content

The earlier document is on the left and the current document on the right. Click **&gt;&gt;** beside a change to apply the earlier content of that paragraph or line group to the current document. Selection is not character by character. You can also restore content deleted from the current document or remove newly added content.

Try restoring only the meeting time or the items to bring below. Expand **Current document updated by the callback** to inspect the result. **Start over** restores the original example.

<CompareDemo />

## Standalone comparison

Import from `nabi-note/diff`. Pass saved NABI TREE JSON or HTML strings as `before` and `after`. Build the registry with the same wings as the editor that created the documents so tables, lists, images, and other content can be read and displayed intact.

```ts
import { makeRegistry, wings } from 'nabi-note'
import { mountDiff } from 'nabi-note/diff'
import 'nabi-note/nabi.css'

const registry = makeRegistry(wings().allBasic().build())
const diff = mountDiff({
  root: document.querySelector('#comparison')!,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'en',
})

diff.update(nextPreviousDocument, nextCurrentDocument)

diff.unmount()
```

By default, only changes and their surrounding context appear. Use the fold button to expand the full documents and the previous/next buttons to navigate changes. With no changes, the complete documents appear. Omitting `onMerge` makes the comparison read-only.

## Connect click merge with a callback

Clicking a button passes a proposed result to `onMerge`. Connecting the callback alone does not save the document automatically. The host must accept the proposal and call `update()` to change the comparison result.

```ts
const diff = mountDiff({
  root,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'en',
  onMerge(proposal) {
    if (proposal.signal.aborted) return
    const accepted = diff.update(proposal.before, proposal.result, proposal.revision)
    if (!accepted) return
    currentDocument = proposal.result
  },
  onError(error) {
    showError(error)
  },
})
```

`proposal.result` is NABI TREE JSON containing only the selected change. `before` and `after` are the documents at click time; `changeId` identifies the selected change and `revision` the comparison state. Pass this `revision` as the third argument to `update()`: if the comparison has already changed, it returns `false` without applying the proposal.

Duplicate clicks are blocked while an asynchronous callback is pending. Updating with other documents or unmounting the comparison aborts `signal`. A service saving to a server should check both this signal and the server document version to avoid overwriting a newer document with a stale result.

## Open comparison from the editor

Connect the `diff` wing and `mountDiffWing()` to open comparison from the toolbar. The baseline is the last loaded document. Ordinary editing and undo do not change it.

```ts
import { createNabiWith, mountToolbar, wings } from 'nabi-note'
import { mountDiffWing } from 'nabi-note/diff'

const { nabi, registry } = createNabiWith(wings().allBasic().use('diff'))
const comparison = mountDiffWing({
  nabi,
  registry,
  surface: content,
  locale: 'en',
  merge: true,
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  onHost(wing) {
    if (wing === 'diff') comparison.open()
  },
})
```

With `merge: true`, selected earlier content is applied to the editor. This change is undoable and preserves the baseline. Changes in the original editor while comparison is open trigger recalculation. Omitting `merge` retains the read-only comparison.

Call `toolbar.unmount()` and `comparison.unmount()` when removing the view. To include the editing-start version and automatically combine both sides' changes, use [Merge](./merge).
