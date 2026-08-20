---
title: AI Vibe Coding
description: llms.txt
---

# AI Vibe Coding

**`llms.txt`** is a spec websites use to hand their content to AI agents (LLMs). Instead of
HTML, it lays out a project's structure and usage in markdown an agent can read directly. The
full spec is at [llmstxt.org](https://llmstxt.org/).

This site has that door open too. There is no address to memorize — as in the example below,
**hand an agent the address** and it follows the rest on its own.

```
https://nabi.saro.me/llms.txt
```

Cursor, Claude Code, OpenAI Codex, Windsurf, and others support the llms.txt standard.

## Adopting it for the first time

Bringing nabi-note into a site that does not use it yet, tell the agent in one go what you want
turned on, whether there is a light/dark mode, and how you are shipping it — the rest gets
assembled on its own. **Only the last sentence changes between the three cases below** — the
rest can stay as written.

### npm + server rendering (SSR) — rendered on a server (Node) on every request

This covers both a Node backend you run yourself and an SSR framework like Next.js, Nuxt, or
SvelteKit — either way, a document is rendered on Node and sent down on every request.

```
We want to bring in nabi-note as our new editor. Use https://nabi.saro.me/llms.txt
as the manual. Our site has a light/dark mode, so match the editor to it. Turn on
every wing that ships by default.

We render on the server with Nuxt, and we want the text already visible the
moment someone lands on the page. Install it with npm and wire it up with SSR
plus hydrate.
```

### npm + client-only assembly (CSR) — a bundler, but no server rendering needed

```
We want to bring in nabi-note as our new editor. Use https://nabi.saro.me/llms.txt
as the manual. Our site has a light/dark mode, so match the editor to it. Turn on
every wing that ships by default.

It's a frontend built with Vite, and we don't need server rendering. Install it
with npm and assemble it in the browser only.
```

### CDN — a static page with no build tool

```
We want to bring in nabi-note as our new editor. Use https://nabi.saro.me/llms.txt
as the manual. Our site has a light/dark mode, so match the editor to it. Turn on
every wing that ships by default.

This page is static HTML with no build tool. Wire it up with a <script> tag.
```

::: tip Light and dark need no extra instructions
`nabi.css` already ships the light defaults, the `.dark` override, and an explicit `.light`
override. Leave the page's `dark`/`light` class alone and the editor follows it automatically.
For a brand color change, have the agent read `llms/styling.md` too.
:::

The three prompts only differ in that last sentence — the agent finds and reads `llms/ssr.md`
(plus `llms/quickstart-npm.md`), `llms/quickstart-npm.md`, and `llms/quickstart-cdn.md`
respectively, and wires it up that way.

## Changing, adding, or removing a feature

Once nabi-note is already in place, changing or adding something is safer to ask for as
**research and a plan first, rather than straight to implementation** — especially for anything
that reaches the backend, where you need to know what to prepare before writing any code.

### Example — research and a plan first

```
I want to add uploads. Read https://nabi.saro.me/llms/wings.md and
https://nabi.saro.me/llms/api-reference.md, and find out what our backend
needs to support the upload wing (an endpoint to receive files, allowed
extensions and size limits, what a failure response should look like).
Don't implement it yet — just show me a plan for what to prepare.
```

The agent will find in `llms/wings.md` that `upload` is a tool wing that takes an `Uploader`,
confirm the actual signatures for `mountUpload`, `Uploader`, and `allowLocalUrls` in
`llms/api-reference.md`, and lay out a plan splitting what the backend needs to expose from what
the frontend decides on its own. Once you have reviewed and approved the plan, ask it to
implement.

### A simpler example — safe to ask for directly

A narrow change that needs no plan can be asked for outright.

```
Read https://nabi.saro.me/llms/styling.md and change just the accent color
and the dark-theme background to our brand colors.
```

::: tip A wing that breaks the contract throws right at registration
When having an agent build a new wing, have it read
[`llms/custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md) as well. Common mistakes —
using a reserved word as the name, or a node-producing wing with no `toHtml` — do not fail late;
they **throw the moment the wing is registered.** That document's "A broken contract throws at
registration, not later" section lists what trips it.
:::

::: tip Once it's in place, leave one line behind
After the first integration, there is no need to repeat the address every time. Add a line like
this to your project's rules file (`CLAUDE.md`, `.cursorrules`, etc.) and a request as short as
"do X with nabi-note" is enough for the agent to find the address on its own.

```md
This project uses `nabi-note` as its editor. Check
https://nabi.saro.me/llms.txt before working on anything related to it.
```
:::

## Next

- [{{ t('menu_intro_index') }}](../intro) — the words this documentation uses
- [{{ t('menu_wing_custom') }}](../wing/custom) — build a format that does not exist yet, as a
  human-readable document

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
