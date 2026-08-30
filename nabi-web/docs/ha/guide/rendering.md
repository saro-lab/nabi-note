---
title: Tsarin SSR
description: Samar da HTML lafiya daga NABI TREE da aka adana a sabar sannan a ci gaba da shi a edita.
---

# Tsarin SSR

A sabar, kada a loda surface da UI na burauza; yi amfani da `nabi-note/ssr` kaɗai. Bayan an tantance NABI TREE JSON da aka adana, za a iya mayar da shi HTML na wallafawa ko HTML na edita mai iya hydrate.

## Samar da HTML na wallafawa

```ts
import { makeRegistry, renderStoredHtml, wings } from 'nabi-note/ssr'

const registry = makeRegistry(wings().allBasic().build())
const html = renderStoredHtml(storedJson, registry)

if (html === null) throw new Error('Ba a iya karanta takardar da aka adana ba.')
```

`renderStoredHtml()` yana bincika tare da gyara JSON da aka bayar, sannan ya dawo da HTML don wallafawa. Idan `null` ne, registry na yanzu ba zai iya karanta wannan input ba. A shafin wallafawa, a haɗa CSS na package da class `.nabi-content`.

```html
<link rel="stylesheet" href="/assets/nabi.css">
<article class="nabi-content">...</article>
```

Sai a ƙara `attachViewer()` daga `nabi-note/viewer` a burauza idan ana buƙatar daidaita tebur ko canza launin code. CSS kaɗai ya isa ga allon wallafawa mai sauƙi.

## Ci gaba da editan da aka zana tun da farko

Idan kana son nuna edita daga allon farko, yi amfani da `renderStoredEditorHtml()` a sabar kuma a ba surface na burauza `hydrate: true`.

```ts
// server
const initialEditorHtml = renderStoredEditorHtml(storedJson, registry)

// browser
const { nabi, registry } = createNabiWith(wings().allBasic(), { doc: storedJson })
const surface = mountSurface({ nabi, registry, root: content, hydrate: true })
```

Sabar da burauza dole su yi amfani da takarda iri ɗaya, fuka-fuki cikin tsari iri ɗaya, da zaɓuɓɓuka iri ɗaya masu shafar HTML. A saka fitarwar sabar kai tsaye a matsayin ɗa na content root, kuma kada a riga an saka `contenteditable` a root. Idan tsarin bai dace ba, surface zai zana sabon HTML na edita.

## Idan toolbar ma an zana shi tun da farko

`renderToolbarHtml()` da `renderViewToolsHtml()` suna iya samar da siffar toolbar a sabar tun da farko. Idan an mount a burauza da registry, harshe, da tsarin group iri ɗaya, zai haɗa aiki da maballan da suke akwai. Ba a goyan bayan saka host DOM na kai-tsaye a cikin toolbar root ba.

A SSR, kada a yi amfani da API da ke buƙatar `Document`, kamar `injectSheets()`. A link CSS ɗin `nabi-note/nabi.css` da aka gina ko a saka shi cikin bundle.
