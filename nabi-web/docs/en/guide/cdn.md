---
title: Using CDN
description: Load the browser build of NABI NOTE without a build tool.
---

<script setup>
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
</script>

# Using CDN

For a static page where installing a package is impractical, load the browser build and its CSS from a CDN. The demo below reads the package version while the site is built and creates an editor through the global `NabiNote` object.

<CdnDemo />

## Notes for NABI NOTE

- In deployed code, pin CSS and browser JavaScript to the same version. A URL without a version, such as `latest`, can change behavior when a new release is published.
- The browser bundle exposes the root API through `window.NabiNote`. `nabi-note/ssr`, `nabi-note/viewer`, and `nabi-note/diff` are not separate global bundles.
- File saving and local history in this demo run in the user's browser. Send `getJson()` output to your application API for server storage or account sync.
- Upload requires the `upload` wing, a real upload function, and the necessary image or link wing. Your upload server is responsible for file validation.
- The browser build wires its HTML parser internally. `setHtml()`, opening an HTML file, and pasting HTML do not need a parser option or a private API.

CDN loading changes only how the library is loaded. Its storage format and input validation are the same as the npm package; see [Basic usage](/en/guide/getting-started) as well.
