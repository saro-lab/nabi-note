---
title: AI Vibe Coding
description: A guide to adopting and building with NABI NOTE alongside an AI coding assistant, using llms.txt.
---

# AI Vibe Coding

**`llms.txt`** is a standard designed for websites to efficiently hand a project's structure
and usage over to AI agents (LLMs). Instead of HTML markup, it lays out a project's spec and
API as clean markdown that's easy for an AI to parse. The full spec is at
[llmstxt.org](https://llmstxt.org/).

The official NABI NOTE site fully supports `llms.txt` too. No need to copy documentation by
hand — **just hand the agent the URL below** and it explores the docs on its own and gets to
work.

```
https://nabi.saro.me/llms.txt
```

Cursor, Claude Code, OpenAI Codex, Windsurf, and other modern AI coding tools support the
llms.txt standard.

## Adopting it for the first time

When bringing NABI NOTE into a project for the first time, just spell out the features you
want, whether you support light/dark mode, and your deployment environment (SSR/CSR/CDN), and
the AI agent writes the optimal code.

### npm + server rendering (SSR) — Next.js, Nuxt, SvelteKit, and the like

```
We want to bring nabi-note into our site as the new editor. Use
https://nabi.saro.me/llms.txt as the manual. Our site has light/dark mode, so
match the editor's theme to it. Turn on every wing that ships by default.

Our service does server-side rendering with Nuxt. Wire it up by installing the
npm package and using SSR + hydrate, so the page renders on the server ahead
of time with no flash on first load.
```

### npm + client-only (CSR) — Vite, CRA, SPA environments

```
We want to bring nabi-note into our site as the new editor. Use
https://nabi.saro.me/llms.txt as the manual. Our site has light/dark mode, so
match the editor's theme to it. Turn on every wing that ships by default.

It's a Vite-based frontend SPA and we don't need server-side rendering.
Install it as an npm package and assemble it only in the browser client.
```

### CDN — static HTML environments

```
We want to bring nabi-note into our site as the new editor. Use
https://nabi.saro.me/llms.txt as the manual. Our site has light/dark mode, so
match the editor's theme to it. Turn on every wing that ships by default.

This page is static HTML with no build tool. Wire it up with `<script>` and
`<link>` tags.
```

::: tip Theme (light/dark) is handled automatically
`nabi.css` ships with a light default, a `.dark` class, and an explicit `.light` class all
built in. The editor's theme switches automatically along with the `class="dark"` toggle on
the page's root element. For custom brand colors, have the agent read `llms/styling.md` too.
:::

## Adding or customizing a feature

When adding or changing a feature on an editor that's already wired up, it's safer to **ask
for research and an implementation plan first** rather than jumping straight to code —
especially for anything that involves a backend API (like file uploads), where the
requirements need to be nailed down clearly.

### Example prompt — research and plan first

```
I want to wire up file uploads. Read https://nabi.saro.me/llms/wings.md and
https://nabi.saro.me/llms/api-reference.md, and first look into what the
backend API spec (endpoint, allowed extensions/size limits, response JSON
shape, etc.) and the frontend integration code need to look like to enable
the upload wing. Don't write any code yet — just lay out the requirements to
prepare and an implementation plan.
```

### Example prompt — a simple style change

```
Read https://nabi.saro.me/llms/styling.md and redefine the editor's accent
color and dark-theme background color as CSS variables to match our brand
colors.
```

::: tip A wing that breaks the contract throws right at registration
When having an agent write a new custom wing, have it read
[`llms/custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md) too. Common mistakes — a
reserved-word collision, a missing required method — aren't caught late at runtime; they're
**caught immediately as an exception at registration.**
:::

::: tip Register it in your project's rules file
Add the line below to your project's guide document (`CLAUDE.md`, `.cursorrules`,
`AGENT.md`, etc.), and from then on just asking "add ~ feature to the editor" is enough for
the AI to check `llms.txt` on its own.

```md
This project uses `nabi-note` as its WYSIWYG editor. Check
https://nabi.saro.me/llms.txt first before working on anything related to it.
```
:::

## Next

- [{{ t('menu_intro_index') }}](../intro) — NABI NOTE introduction and architecture
- [{{ t('menu_wing_custom') }}](../wing/custom) — guide to building custom wings

<script setup lang="ts">
import { useTranslate } from '../../.vitepress/src/langs.ts'

const { t } = useTranslate()
</script>
