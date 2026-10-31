---
title: Link
description: Connect safe web addresses and show uploaded attachments.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Link

Select text and attach an address to it. If you enter an address without selecting text, the address itself is inserted as the link text. Typing an `http://` or `https://` address and then pressing Space or Enter also turns it into a link.

Links only store `http:`, `https:`, and same-site paths that begin with `.` or `/`. Addresses whose origin cannot be clearly identified, such as `javascript:` or `//example.com`, are rejected. Attachment links created by uploads also store file information, and cannot be created manually like ordinary links.

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

## Pasting URLs

If the entire pasted content, excluding surrounding whitespace, is a valid `http://` or `https://` URL, it is inserted as a link immediately. URLs within sentences, text containing multiple URLs, and relative paths follow the existing paste behavior. Code blocks and editors without the link wing keep the content as text. Valid internal clipboard data copied from the editor takes priority to preserve its original formatting.

Use the `onPasteUrl` callback in `mountSurface()` to choose the link's display text.

| Argument | Value |
| --- | --- |
| `url` | The complete URL with surrounding whitespace removed |
| `isSameOrigin` | Whether the URL's protocol, host, and port match the origin of the document containing the editor |
| `path` | The path starting with `/`, including the query and fragment. Example: `/posts/1?a=2#top` |

```ts
const surface = mountSurface({
  nabi,
  registry,
  root: document.querySelector<HTMLElement>('#editor')!,
  onPasteUrl(url, isSameOrigin, path) {
    if (isSameOrigin && path === '/guide') return 'NABI NOTE'
    return url
  },
})
```

A returned string containing non-whitespace text becomes the display text. If the callback is absent, returns an empty or non-string value, or fails, the pasted URL remains the display text. Returned strings are never interpreted as HTML and do not change the link address.

The callback also supports `async` functions and promises. The URL link is inserted immediately while the response is pending; a valid result later changes only that link's display text. A late result is ignored if the link has been edited or deleted, a new document has been loaded, or the surface has been unmounted.

## CSS Styles

Style ordinary links with `.nabi-content a`, and attachment links separately with `.nabi-content a[data-nabi-file]`.

```css
.article-body a:not([data-nabi-file]) {
  color: var(--nabi-accent);
  text-decoration-thickness: .08em;
  text-underline-offset: .16em;
}

.article-body a[data-nabi-file] {
  display: inline-flex;
  gap: .35em;
  padding: .25em .55em;
  background: var(--nabi-soft);
}
```

The `::before` and `::after` parts of attachment links are used to show the file icon and extension, so it is usually best not to replace or remove their `content`.
