---
title: Wing personalizzate
description: Il contratto e la sequenza di implementazione per aggiungere una funzionalità di documento durevole.
---

# Wing personalizzate

Una wing personalizzata è più di un pulsante della barra. È un'estensione dichiarativa che tiene insieme struttura del documento salvato, comandi, conversione HTML e Markdown, regole di importazione e comportamento della vista. Il registry la convalida prima che esista un editor, impedendo a strutture non valide di entrare nei documenti.

## Parti dalla factory più limitata

La maggior parte della formattazione non richiede una dichiarazione completa. Usa `simpleMark()` per un mark inline senza valore, `valueMark()` per un mark con un insieme di valori limitato, `boxObject()` per un blocco senza figli e `listFamily()` per un elenco.

```ts
import { createNabiWith, simpleMark, wings } from 'nabi-note'

const exStrong = simpleMark({
  w: 'exStrong',
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
})

const { nabi, registry } = createNabiWith(wings().allBasic().use(exStrong))
```

## Crea diversi tipi di wing

Ogni esempio seguente ha una forma archiviata diversa. Registra prima una wing e ispeziona `getJson()` e `getHtml()`. Aggiungi comandi e pulsanti solo dopo che la struttura funziona.

### 1. Mark inline senza valore: enfasi

Usa `simpleMark()` quando una funzione avvolge soltanto testo. Questo archivia `exStrong` e lo renderizza come `<strong>`.

```ts
import { simpleMark } from 'nabi-note'

export const exStrong = simpleMark({
  w: 'exStrong',
  clearable: true,
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
  styles: '.nabi-content strong { font-weight: 700; }',
})
```

Con `clearable: true`, Cancella formattazione rimuove anche questo mark. Prima di aggiungere un pulsante, applicalo con `nabi.applyCommand()` o un altro comando personalizzato. Lo stesso selettore `.nabi-content strong` applica lo stile a editor e contenuto pubblicato.

### 2. Mark inline con valore: tonalità di stato

Usa `valueMark()` per un colore, una dimensione o uno stato scelto da un insieme consentito. Il valore viene archiviato in `a.v`; i valori fuori elenco vengono rimossi durante `repair()`.

```ts
import { valueMark } from 'nabi-note'

export const exTone = valueMark({
  w: 'exTone',
  key: 'v',
  values: ['quiet', 'loud'],
  clearable: true,
  toHtml: (node, children, ctx) =>
    ctx.element('span', children(), { 'data-ex-tone': String(node.a?.v ?? '') }),
  styles: `
    .nabi-content [data-ex-tone="quiet"] { opacity: .65; }
    .nabi-content [data-ex-tone="loud"] { color: var(--nabi-accent); font-weight: 700; }
  `,
})
```

La sua forma salvata è `{ "w": "exTone", "a": { "v": "loud" }, "ch": ["Important"] }`. Il CSS punta al valore archiviato, quindi modifica anche il contenuto pubblicato. Non rimuovere con leggerezza valori da un elenco esistente: i documenti salvati in precedenza potrebbero perderli alla lettura.

### 3. Blocco senza figli: separatore

Usa `boxObject()` per un oggetto autonomo senza figli, come immagine, video o separatore.

```ts
import { boxObject } from 'nabi-note'

export const exDivider = boxObject({
  w: 'exDivider',
  toHtml: (_node, _children, ctx) => ctx.element('hr', ''),
  styles: '.nabi-content hr { border-color: var(--nabi-line); }',
})
```

Per un oggetto con valori come URL o larghezza, dichiara la convalida in `attrs` e inserisci i valori richiesti in `requires`. Rifiuta un valore non verificabile con `null` invece di sostituire silenziosamente un valore predefinito.

### 4. Blocco con più paragrafi: richiamo

Per un blocco che contiene contenuto del documento, dichiara un `container`. `holds: 'blocks'` consente figli di tipo paragrafo, elenco e blocco-oggetto.

```ts
import type { Wing } from 'nabi-note'

export const exCallout: Wing = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      padding: 1rem;
    }
  `,
}
```

Questa dichiarazione da sola non crea un modo per avvolgere i paragrafi selezionati. Aggiungi un comando puro in `commands` e un `button` che lo invochi prima di esporre la funzione nell'interfaccia dell'editor.

### 5. Coppia corrispondente di elenco ed elemento

Usa `listFamily()` quando elenco ed elemento devono comparire sempre insieme.

```ts
import { listFamily } from 'nabi-note'

export const exList = listFamily({
  w: 'exList',
  item: 'exListItem',
  toHtml: (_node, children, ctx) => ctx.element('ul', children(), { class: 'ex-list' }),
  itemHtml: (_node, children, ctx) => ctx.element('li', children()),
  styles: '.nabi-content .ex-list { border-inline-start: 2px solid var(--nabi-line); }',
})
```

`listFamily()` ripara un blocco dentro l'elenco avvolgendolo in un elemento. Aggiungi `itemDecl` e `repairItem` per un valore a livello di elemento, come lo stato selezionato.

### Registra in un'unica selezione ordinata

Usa sul server le stesse dichiarazioni nello stesso ordine del browser.

```ts
const selected = wings()
  .allBasic()
  .use(exStrong)
  .use(exTone)
  .use(exDivider)
  .use(exCallout)
  .use(exList)

const { nabi, registry } = createNabiWith(selected, { locale: 'it' })
```

## Definisci nomi e struttura del documento

I nomi che entrano in un documento devono corrispondere a `ex[A-Z0-9]...`. Un nome come `exCallout` impedisce che una futura wing ufficiale cambi il significato del contenuto salvato.

`place` determina la forma archiviata: `mark` avvolge contenuto inline, `void` è un blocco senza figli, `container` contiene figli, `attr` cambia attributi del paragrafo e `tool` non crea nodi documento. Un `container` richiede `holds: 'blocks' | 'inline'` e `toHtml()`.

```ts
const exNote = {
  w: 'exNote',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
} as const
```

`attrs`, `boolAttrs`, `allows`, `requiresAnyOf` e `parts` dichiarano vincoli strutturali. Una dichiarazione `parts` richiede anche `partHtml` per ogni parte. Usa `attrKey` e `attrValues` per vincolare una wing che seleziona valori.

## Tutte le opzioni di dichiarazione

Dichiara soltanto ciò che serve alla wing. Una factory fornisce già alcuni campi.

| Area | Opzioni | Scopo |
| --- | --- | --- |
| Base | `w`, `place`, `basic`, `styles` | Nome, tipo strutturale, appartenenza al catalogo base, CSS predefinito |
| Struttura | `holds`, `singleParagraph`, `attrs`, `boolAttrs` | Tipo di figlio, comportamento di Invio, attributi consentiti, attributi booleani |
| Struttura | `parts`, `allows`, `noAlign`, `requiresAnyOf` | Parti interne, figli consentiti, esclusione dell'allineamento, dipendenza della wing |
| Valori | `attrKey`, `attrValues`, `currentValue` | Chiave e lista del valore archiviato, rilevamento del valore corrente |
| Comandi e input | `commands`, `onKey`, `escapeKeys`, `doubleKeys`, `inputRules` | Comandi, gestione tasti, comportamento Escape/doppio tasto, regole di autoformattazione |
| Comportamento della superficie | `attach` | Comportamento DOM e pulizia di una superficie |
| Conversione | `toHtml`, `partHtml`, `toMd`, `partMd` | Output HTML e Markdown |
| Importazione e riparazione | `claim`, `ioFilter`, `repair`, `partRepair` | Importazione HTML, gestione file, convalida e riparazione JSON |
| UI | `button`, `buttons`, `context` | Dichiarazioni dell'interfaccia della barra e del contesto |
| Cancella formattazione | `clearable` | Se Cancella formattazione la rimuove |

`w` e `place` sono sempre obbligatori. Le wing `mark`, `void` e `container` che producono nodi richiedono anche `toHtml()`. Un container necessita di `holds`; ogni parte dichiarata richiede il proprio `partHtml` corrispondente.

## Mantieni insieme HTML, Markdown e JSON

`toHtml()` renderizza in HTML un nodo salvato, mentre `toMd()` esporta Markdown. Senza un builder Markdown, l'HTML generato viene conservato per non perdere informazioni. Durante l'importazione usa `claim()` per riconoscere solo il tuo elemento HTML e gli attributi convalidati.

`repair()` viene eseguito al caricamento del JSON e di nuovo dopo i comandi. Restituisci un nodo corretto per un attributo non valido, oppure `null` per un nodo che non può essere mantenuto. Costruisci l'HTML con `ctx.element()`, `ctx.escape()` e `ctx.url()`; non concatenare mai tag, attributi o URL aggirando questi controlli.

## Separa i comandi dal comportamento della vista

Un comando è una funzione pura di documento e selezione che restituisce il documento successivo e una selezione al suo interno. Non legge né modifica mai il DOM e restituisce `null` quando non può effettuare una modifica valida. Dai ai comandi nomi lower camel case che iniziano con un verbo, come `insertNote`.

Inserisci in `attach(host)` il comportamento esclusivo del DOM, come la selezione trascinata delle tabelle. Registra subito la pulizia di ogni listener o attributo modificato con `host.onDispose()`, così anche una configurazione fallita viene ripulita. Non modificare il DOM del testo in composizione né la mappatura della selezione della superficie.

Dichiara i controlli della barra e del contesto con `button`, `buttons` e `context`; duplicarne le regole dei comandi nell'interfaccia dell'applicazione può far divergere UI e modello del documento.

## Stili CSS

Inserisci in `styles` il CSS di base richiesto da una wing. Gli stili delle wing integrate sono già inclusi in `nabi-note/nabi.css`. Un browser che assembla gli stili del registry selezionato può usare `collectSheets()` e `injectSheets()`; SSR dovrebbe invece collegare il file CSS.

Usa le stesse classi e attributi data per la modifica e il contenuto pubblicato, ma non modificare struttura, `display` o `white-space` di `[data-key]` in modifica. Il CSS deve cambiare soltanto l'aspetto, non la mappatura del cursore.

```ts
const exCallout = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      padding: 1rem;
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      border-radius: var(--nabi-radius);
    }
  `,
} as const
```

Indirizza solo classi o attributi data creati da `toHtml()`. Mantieni più ristrette le modifiche specifiche del servizio, ad esempio `.article-body .ex-callout`.

## Verifica l'intero contratto

Verifica che un documento JSON salvato venga ricaricato con la stessa struttura e lo stesso HTML. Verifica che il registry rifiuti nomi non validi, comandi duplicati, builder mancanti e dipendenze insoddisfatte. Copri l'importazione HTML non valida e l'input di `repair()`, la gestione della selezione dei comandi, l'output SSR e una vista pubblicata con stile.

Per i tipi completi e gli argomenti delle factory, controlla le dichiarazioni installate e il [riferimento API in inglese](https://nabi.saro.me/llms/api-reference.md).
