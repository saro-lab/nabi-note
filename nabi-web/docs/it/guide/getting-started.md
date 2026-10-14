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

L'intervallo predefinito fra pressioni consecutive di Enter per uscire da un contenitore di blocchi è 180ms. La doppia pressione di Esc e Shift mantiene 350ms. Impostare esplicitamente `doubleEnterMs` in `mountSurface()` cambia sia l'intervallo di Enter sia quello del doppio Esc.

Ogni editor necessita di radici del contenuto e della barra degli strumenti proprie e non sovrapposte. In una pagina con più editor, assegna a ogni barra la propria superficie editor tramite `surface`, così focus e scorciatoie non si mescolano.

## Configurare la barra degli strumenti

La barra predefinita raggruppa titoli, formattazione del testo, allineamento, elenchi, inserimento e strumenti del documento, in quest'ordine, con separatori verticali. Sul desktop tutti gli strumenti occupano più righe; sui dispositivi mobili quelli rapidi e il pulsante di tutti gli strumenti occupano una riga. Le proprietà di tabelle, immagini e aree flottanti compaiono sotto e restano utilizzabili insieme agli strumenti del testo.

`groups` cambia l'ordine dei gruppi e `quick` quello degli strumenti rapidi mobili. Per esempio, un editor che inserisce spesso immagini può portare il gruppo `media` all'inizio.

```ts
import { TOOLBAR_GROUPS, mountToolbar } from 'nabi-note'

const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  locale: 'it',
  groups: ['media', ...TOOLBAR_GROUPS.filter((group) => group !== 'media')],
  quick: ['b', 'i', 'tc', 'img'],
})
```

Gli strumenti rapidi rispettano l'ordine specificato senza separatori. All'interno di un gruppo vale l'ordine di registrazione delle ali. Nel pre-rendering SSR della barra, passa lo stesso ordine di gruppi al server e al browser. [Temi CSS](./style#soglia-della-modalita-mobile) spiega la disposizione in base alla larghezza dello schermo.

Collega `mountHints()` per scegliere gli strumenti da tastiera premendo Shift due volte. Tab cambia gruppo e le frecce percorrono le icone dello stesso gruppo. Desktop e schermo intero usano la barra visibile; sui dispositivi mobili si usa la tavolozza di tutti gli strumenti.

Pannelli immagini, campi URL e selettori di file ricordano la selezione all'apertura. Se sposti solo il cursore, l'inserimento avviene nella posizione originale; se modifichi o sostituisci il documento, l'input viene annullato con un avviso. Anche se Annulla ripristina un contenuto identico, la vecchia selezione non viene riutilizzata.

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
