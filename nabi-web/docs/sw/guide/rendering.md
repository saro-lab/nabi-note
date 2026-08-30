---
title: Usanidi wa SSR
description: Render hati za NABI TREE zilizohifadhiwa kwa usalama kuwa HTML kwenye seva na hydrate kihariri kwenye kivinjari.
---

# Usanidi wa SSR

Kwenye seva, import `nabi-note/ssr` pekee, si surface za kivinjari wala UI. Huthibitisha NABI TREE JSON iliyohifadhiwa na kuibadilisha kuwa HTML ya kuchapishwa au HTML ya kihariri inayoweza kuhydrate.

## Render HTML ya kuchapishwa

```ts
import { makeRegistry, renderStoredHtml, wings } from 'nabi-note/ssr'

const registry = makeRegistry(wings().allBasic().build())
const html = renderStoredHtml(storedJson, registry)

if (html === null) throw new Error('Hati iliyohifadhiwa haikuweza kusomwa.')
```

`renderStoredHtml()` huthibitisha na kusawazisha JSON yake ya ingizo, kisha hurejesha HTML ya kuchapishwa. `null` humaanisha registry ya sasa haiwezi kusoma ingizo hilo. Jumuisha CSS ya kifurushi na `.nabi-content` kwenye ukurasa wa kuchapishwa.

```html
<link rel="stylesheet" href="/assets/nabi.css">
<article class="nabi-content">...</article>
```

Ongeza `attachViewer()` kutoka `nabi-note/viewer` kwenye kivinjari kwa upangaji wa jedwali unaoingiliana au kuangazia code pekee. Maudhui ya kawaida yaliyochapishwa yanahitaji CSS tu.

## Hydrate markup ya kihariri iliyotolewa mapema

Ili kuonyesha kihariri kuanzia paint ya kwanza, kitoe kwa `renderStoredEditorHtml()` kwenye seva na upe surface ya kivinjari `hydrate: true`.

```ts
// server
const initialEditorHtml = renderStoredEditorHtml(storedJson, registry)

// browser
const { nabi, registry } = createNabiWith(wings().allBasic(), { doc: storedJson })
const surface = mountSurface({ nabi, registry, root: content, hydrate: true })
```

Seva na kivinjari lazima vitumie hati ileile, matamko ya wing kwa mpangilio uleule, na options zinazoathiri HTML. Ingiza output ya seva bila kuibadili kama watoto wa moja kwa moja wa content root, na usiweke `contenteditable` mapema kwenye root hiyo. Muundo ukitofautiana, surface hutoa HTML mpya ya kihariri.

## Toa toolbar mapema pia

`renderToolbarHtml()` na `renderViewToolsHtml()` zinaweza kutoa controls za toolbar mapema kwenye seva. Mount kwenye kivinjari huunganisha controls hizo registry, locale na mpangilio wa group vinapolingana. Host DOM ya kiholela ndani ya toolbar root haitumiki.

Usitumie API za kivinjari kama `injectSheets()` wakati wa SSR. Unganisha faili ya `nabi-note/nabi.css` iliyojengwa au ijumuishe katika CSS bundle yako.
