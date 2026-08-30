---
title: Utilizzo di base
description: Crea un editor NABI NOTE per browser, quindi salva e ripristina i suoi documenti.
---

# Utilizzo di base

Questa guida tratta un editor renderizzato sul client (CSR) nel browser: scegli le wing, monta l'editor e la sua interfaccia, quindi salva e ripristina JSON NABI TREE.

## Installa e aggiungi il markup di base

```bash
npm install nabi-note
```

Carica lo stesso foglio di stile sia per l'editor sia per il contenuto pubblicato. Non aggiungere tu `contenteditable`: se ne occupa `mountSurface()`.

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi">
  <div id="toolbar" class="nabi-toolbar"></div>
  <div id="content" class="nabi-content"></div>
</div>
```

## Monta un editor

`allBasic()` seleziona le wing ufficiali che funzionano senza collegamenti specifici dell'applicazione. Aggiungi le wing collegate a servizi, come upload, archiviazione file o confronto dei documenti, secondo le rispettive guide.

```ts
import { createNabiWith, mountSurface, mountToolbar, wings } from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const toolbarRoot = document.querySelector<HTMLElement>('#toolbar')!

const { nabi, registry } = createNabiWith(wings().allBasic(), {
  locale: 'it',
  onError: (error) => console.error(error),
  undoLimit: 200,
  typingMergeMs: 1000,
})

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  locale: 'it',
  placeholder: 'Scrivi qualcosa.',
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'it',
})
```

`locale` controlla il testo della barra degli strumenti e di aiuto; passa lo stesso valore a ogni mount dell'interfaccia. `placeholder` viene mostrato soltanto quando l'editor è vuoto. `onError` riceve errori isolati da comandi e callback. `undoLimit` è il numero di voci di annullamento (200 per impostazione predefinita). `typingMergeMs` è l'intervallo che unisce digitazioni consecutive in un solo passaggio di annullamento; impostalo a `0` per mantenere ogni inserimento separato.

Ogni editor necessita di radici del contenuto e della barra degli strumenti proprie e non sovrapposte. In una pagina con più editor, assegna a ogni barra la propria superficie editor tramite `surface`, così focus e scorciatoie non si mescolano.

## Scegli le wing

Usa `use()` e `drop()` per mantenere solo le funzionalità necessarie. La pagina di ciascuna wing documenta le opzioni accettate.

```ts
const selected = wings()
  .allBasic()
  .drop('youtube')
  .use('upload')

const { nabi, registry } = createNabiWith(selected, { locale: 'it' })
```

Per un bundle più piccolo, passa soltanto le wing richieste, ad esempio `boldWing` e `imageWing`, come array. Nomi sconosciuti, opzioni non valide e dipendenze mancanti generano subito un errore durante la creazione dell'editor.

## Salva e carica

Salva l'output di `getJson()` come JSON NABI TREE quando il documento sarà modificato nuovamente. `getHtml()` è destinato all'output pubblicato. Non archiviare mai il risultato riservato all'editor di `getEditorHtml()`.

```ts
const json = nabi.getJson()
await saveToServer(json)

const saved = await loadFromServer()
if (!nabi.setJson(saved)) showError('Impossibile leggere il documento salvato.')

const publishedHtml = nabi.getHtml()
```

Usa `setHtml()` per importare HTML esterno. L'editor nel browser fornisce già il proprio parser HTML, quindi non è necessaria un'opzione parser. `setJson()` e `setHtml()` restituiscono `false` per input non vuoti non validi e lasciano invariato il documento corrente.

```ts
nabi.setHtml('<p>Documento importato</p>')
```

JSON e HTML sono entrambi input non attendibili. NABI NOTE li legge attraverso le wing registrate e le relative regole consentite, ma ciò non sostituisce l'autorizzazione degli upload né la politica di sicurezza del tuo servizio.

## API comuni

| Attività | API |
| --- | --- |
| Creare un editor | `createNabiWith`, `wings` |
| Montare la superficie e la barra | `mountSurface`, `mountToolbar` |
| Salvare e ripristinare | `getJson`, `setJson`, `getHtml`, `setHtml` |
| Osservare le modifiche | `nabi.onChange(listener)` |
| Annullare e ripetere | `nabi.undo()`, `nabi.redo()` |
| Renderizzare HTML su un server | `renderStoredHtml` da `nabi-note/ssr` |
| Aggiungere comportamento alla pagina pubblicata | `attachViewer` da `nabi-note/viewer` |
| Confrontare documenti | `diffDocs` da `nabi-note/diff` |

Per i tipi esatti e tutti gli argomenti, controlla prima le dichiarazioni del pacchetto installato. Gli strumenti di automazione possono usare anche il [riferimento API in inglese](https://nabi.saro.me/llms/api-reference.md).

## Smonta i mount

Smonta nell'ordine inverso di creazione. Non modificare direttamente l'`innerHTML` della radice di modifica; modifica i documenti tramite API pubbliche come `setJson()`, `setHtml()` o `applyCommand()`.

```ts
function dispose() {
  toolbar.unmount()
  surface.unmount()
}
```
