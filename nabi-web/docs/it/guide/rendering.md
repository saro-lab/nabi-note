---
title: Configurazione SSR
description: Renderizza in sicurezza documenti NABI TREE archiviati in HTML sul server e idrata un editor nel browser.
---

# Configurazione SSR

Sul server importa solo `nabi-note/ssr`, non le superfici del browser né l'interfaccia. Convalida il JSON NABI TREE archiviato e lo trasforma in HTML pubblicato oppure in HTML dell'editor idratabile.

## Renderizza HTML pubblicato

```ts
import { makeRegistry, renderStoredHtml, wings } from 'nabi-note/ssr'

const registry = makeRegistry(wings().allBasic().build())
const html = renderStoredHtml(storedJson, registry)

if (html === null) throw new Error('Impossibile leggere il documento archiviato.')
```

`renderStoredHtml()` convalida e normalizza il suo input JSON, quindi restituisce HTML pubblicato. `null` indica che il registry corrente non riesce a leggere quell'input. Includi il CSS del pacchetto e `.nabi-content` nella pagina pubblicata.

```html
<link rel="stylesheet" href="/assets/nabi.css">
<article class="nabi-content">...</article>
```

Aggiungi `attachViewer()` da `nabi-note/viewer` nel browser solo per l'ordinamento interattivo delle tabelle o l'evidenziazione del codice. Il normale contenuto pubblicato necessita soltanto del CSS.

## Idrata il markup dell'editor prerenderizzato

Per mostrare un editor già al primo rendering, renderizzalo con `renderStoredEditorHtml()` sul server e passa `hydrate: true` alla superficie nel browser.

```ts
// server
const initialEditorHtml = renderStoredEditorHtml(storedJson, registry)

// browser
const { nabi, registry } = createNabiWith(wings().allBasic(), { doc: storedJson })
const surface = mountSurface({ nabi, registry, root: content, hydrate: true })
```

Server e browser devono usare lo stesso documento, dichiarazioni delle wing nello stesso ordine e opzioni che influenzano l'HTML. Inserisci l'output del server senza modificarlo come figli diretti della radice del contenuto e non preimpostare `contenteditable` su quella radice. Se la struttura è diversa, la superficie renderizza un nuovo HTML dell'editor.

## Prerenderizza anche la barra degli strumenti

`renderToolbarHtml()` e `renderViewToolsHtml()` possono prerenderizzare i controlli della barra sul server. Il mount nel browser collega tali controlli quando registry, lingua e ordine dei gruppi coincidono. Il DOM arbitrario dell'host dentro una radice della barra non è supportato.

Non usare API del browser come `injectSheets()` durante SSR. Collega il file `nabi-note/nabi.css` generato oppure includilo nel bundle CSS.
