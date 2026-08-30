---
title: AI vibe coding
description: Help coding agents use NABI NOTE accurately by grounding them in its current public API and documentation boundaries.
---

# AI vibe coding

NABI NOTE provides [`llms.txt`](/llms.txt) for AI and automation tools. Rather than asking an agent to guess the entire library, start with that index and have it read only the documents needed for the task.

## Prompt to start with

Fill in the framework and features you need.

```text
Build an editor with NABI NOTE (nabi-note).
First read https://nabi.saro.me/llms.txt, then read only the documents needed for this task.

Environment: Vue 3 + TypeScript
Features: basic formatting, tables, images, and uploads
Stored source: NABI TREE JSON
Publishing: render stored JSON to HTML on the server

Use only public exports and APIs that exist in the installed types.
After implementation, run type checking and a build, then report changed files and verification results.
```

If the agent cannot open URLs, include `llms.txt` and the relevant linked documents in the conversation.

## Point it to only what it needs

`llms.txt` is a compact index. Giving an agent just the relevant pages is usually more useful than sending every document at once.

- npm assembly: [`quickstart-npm.md`](https://nabi.saro.me/llms/quickstart-npm.md)
- CDN setup: [`quickstart-cdn.md`](https://nabi.saro.me/llms/quickstart-cdn.md)
- wing selection: [`wings.md`](https://nabi.saro.me/llms/wings.md)
- stored JSON, HTML, and change events: [`document-model.md`](https://nabi.saro.me/llms/document-model.md)
- HTML import, paste, and upload boundaries: [`io-security.md`](https://nabi.saro.me/llms/io-security.md)
- custom wings and server rendering: [`custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md), [`ssr.md`](https://nabi.saro.me/llms/ssr.md)
- viewer, diff, styles, and drop caps: [`viewer-diff.md`](https://nabi.saro.me/llms/viewer-diff.md), [`styling.md`](https://nabi.saro.me/llms/styling.md)
- exact imports and types: [`api-reference.md`](https://nabi.saro.me/llms/api-reference.md)

## Include product requirements

An agent cannot infer storage, security policy, or upload behavior from the editing screen alone. State the real framework, included and excluded wings, whether JSON and HTML are stored, the upload endpoint's request and response contract, file limits, and whether published pages need SSR, viewer behavior, or diffing.

For anything not yet decided, ask the agent to explain the options and their impact before implementing a choice.

## Review the result

Review generated code like any other code. In particular, verify that it:

- loads `nabi-note/nabi.css` for both editing and published content;
- uses the same `registry` for selected wings and every mount;
- stores `getJson()`, never `getEditorHtml()`;
- does not write directly to an editing `.nabi-content` element's `innerHTML`;
- unmounts every mount when the screen closes;
- validates MIME type, size, authorization, and storage location on the upload server;
- uses matching wing order and HTML-affecting options on server and browser;
- confirms actual export names through type checking, tests, and a build.

IME and caret behavior, and save-and-load paths, need real verification even when the page appears to work once. Test composition input on mobile as well as saved-document restoration.

## Prefer the installed version

When a project already has `nabi-note` installed, its `package.json` exports and type declarations are more directly relevant than a website built for another release. Ask the agent to check that version difference before it writes code.
