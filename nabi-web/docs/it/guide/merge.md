---
title: Unione
description: Combina la versione iniziale, la tua e quella salvata nel frattempo, poi modifica e risolvi i conflitti rimasti.
---

<script setup>
import MergeDemo from '../../.vitepress/ui/MergeDemo.vue'
</script>

# Unione

Se durante la tua modifica vengono salvati altri cambiamenti, combina le due parti usando la versione iniziale come base. Tutto ciò che può essere unito automaticamente viene subito applicato; restano in conflitto solo le sovrapposizioni. È una vista indipendente di `nabi-note/merge`, non una wing.

| Sinistra | Centro | Destra |
| --- | --- | --- |
| Versione all’inizio della modifica | Il tuo documento attuale con l’unione automatica | Versione salvata durante la tua modifica |
| Sola lettura | Modificabile direttamente | Sola lettura |

Al centro puoi modificare testo, formattazione, tabelle, elenchi e immagini come in un normale editor. Le wing fornite determinano le funzionalità. Marcatori e stato dei conflitti non entrano nel contenuto salvato.

## Esempio completamente automatico

Hai spostato la riunione alle **11:00**, e un’altra persona ha cambiato il luogo nella **sala riunioni al terzo piano**. Sono paragrafi diversi, quindi il risultato centrale contiene entrambe le modifiche.

Senza conflitti rimasti puoi premere subito **Conferma**, oppure rifinire prima il testo centrale. Il documento finale mostrato sotto è il risultato effettivo ricevuto dal callback di conferma.

<MergeDemo />

## Esempio parzialmente automatico

Questa volta hai cambiato l’orario alle **11:00**, l’altra persona alle **14:00**. Modifiche diverse dello stesso paragrafo lasciano l’orario in conflitto. Il tuo cambio dei responsabili in **Jimin e Seoyeon** e il nuovo luogo, **sala riunioni al terzo piano**, sono applicati automaticamente.

Risolvi il conflitto in uno di questi modi:

- A sinistra **&gt;&gt;**: adotta il contenuto corrispondente della versione iniziale.
- A destra **&lt;&lt;**: adotta quello della nuova versione salvata.
- **Risolvi con il contenuto attuale**: mantieni o modifica il centro e segna come risolto.

Cambia la frase dell’orario al centro e premi **Risolvi con il contenuto attuale**. Puoi confermare solo dopo aver risolto tutti i conflitti.

<MergeDemo partial />

Modificare di nuovo una zona risolta ne conserva lo stato. Annullare la risoluzione annulla anche lo stato; ripetere lo ripristina. Eliminare o modificare testo non risolve automaticamente un conflitto aperto.

## Regole per unione automatica e conflitti

Si confrontano le modifiche dal documento iniziale al tuo e dallo stesso documento iniziale alla nuova versione. Le modifiche di una sola parte o identiche nelle due parti sono applicate automaticamente, così come quelle di paragrafi o righe diversi.

Come nell’unione testuale di Git, le sovrapposizioni si valutano per paragrafi e righe. Anche parole diverse modificate sulla stessa riga restano in conflitto. Inserimenti diversi nella stessa posizione o modifiche a contenuto eliminato dall’altra parte richiedono una decisione.

Se entrambe le parti modificano diversamente un blocco strutturato come tabella, elenco o area flottante, l’intera struttura è in conflitto. Celle ed elementi non vengono mescolati arbitrariamente: scegli il contenuto o modifica il centro. Neppure spostamenti e modifiche sovrapposti dalla posizione incerta vengono applicati automaticamente.

## Collegare una vista di unione indipendente

Passa NABI TREE JSON salvato o stringhe HTML in `base`, `local` e `incoming`. Usa le stesse wing e opzioni dell’editor originale. `mountMerge()` crea editor centrale, barra, entrambe le fonti, controlli dei conflitti e pulsante di conferma.

```ts
import { wings } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'
import 'nabi-note/nabi.css'

const merge = mountMerge({
  root: document.querySelector('#merge')!,
  base: editingStartedDocument,
  local: myEditedDocument,
  incoming: latestDocument,
  wings: wings().allBasic().build(),
  locale: 'it',
  incomingVersion: latestVersion,
  async onConfirm({ json, html, incomingVersion, signal }) {
    return saveDocument({ json, html, expectedVersion: incomingVersion, signal })
  },
  onError(error) {
    showError(error)
  },
})
```

`onConfirm` riceve JSON, HTML pubblicabile, revisione di modifica e `incomingVersion` del risultato attuale interamente risolto. Restituire `false` non completa la conferma. Durante la Promise, modifica, scelta dei conflitti e conferme duplicate sono bloccate. Smontare annulla il `signal` del risultato. La composizione IME coreana deve terminare prima di confermare.

Collega azioni proprie, come selettore di immagini o caricamenti, come in un editor normale. `toolbarOptions` riceve pannelli e azioni dell’host; `surfaceOptions` le opzioni della superficie di modifica.

`incomingVersion` restituisce invariato il valore del servizio. Al salvataggio il servizio deve confrontarlo con l’ultima versione del server. Se durante l’unione viene salvata un’altra versione, recupera l’ultimo documento e avvia una nuova unione senza sovrascriverlo con un risultato vecchio.

Puoi leggere lo stato o richiedere conferma anche dall’esterno della vista.

```ts
const stop = merge.session.onChange((state) => {
  updateRemainingCount(state.unresolvedCount)
})

const canConfirm = merge.session.getState().canConfirm
const confirmed = await merge.confirm()

stop()
merge.unmount()
```

Leggi il risultato con `merge.nabi.getJson()` e `merge.nabi.getHtml()`. Non salvare il DOM di modifica o `getEditorHtml()`. Per applicare solo contenuto precedente scelto tra due versioni, usa l’unione tramite clic in [Confronto](./compare).

## Confermare dopo i caricamenti

Collega la wing `upload` e `mountUpload()` per pulsante file, incolla e trascinamento. `sendUpload` invia file al server e restituisce `{ uri }`. Vedi [Caricamento file](../wing/etc/upload) per l’esempio completo di connessione e avanzamento.

Usa `merge.session.hold()` per sospendere conferma e selezione dei conflitti durante operazioni asincrone, come caricamenti, non ancora inserite nel documento. Chiama la funzione restituita al completamento, annullamento o smontaggio. Rilascia **dopo l’inserimento nel documento**, non subito dopo l’invio al server, affinché il file sia incluso nel risultato finale.

```ts
import { mountUpload, wings, type UploadMount } from 'nabi-note'
import { mountMerge } from 'nabi-note/merge'

let upload: UploadMount | undefined
let releaseUpload: (() => void) | undefined

const merge = mountMerge({
  root,
  base,
  local,
  incoming,
  wings: wings().allBasic().use('upload').build(),
  locale: 'it',
  incomingVersion: latestVersion,
  toolbarOptions: { onFiles: (files) => upload?.take(files) },
  surfaceOptions: { fileSink: (files) => upload?.take(files) },
  onConfirm: ({ json, html, incomingVersion, signal }) =>
    saveDocument({ json, html, expectedVersion: incomingVersion, signal }),
})

upload = mountUpload({
  nabi: merge.nabi,
  root: merge.content,
  locale: 'it',
  uploader: sendUpload,
  onStart() {
    releaseUpload = merge.session.hold()
  },
  onDone() {
    releaseUpload?.()
    releaseUpload = undefined
  },
})

function dispose() {
  upload?.unmount()
  releaseUpload?.()
  merge.unmount()
}
```

`merge.content` è il DOM centrale; `merge.surface` e `merge.toolbar` sono già montati. Non creare un’altra superficie o barra nello stesso punto. Smonta prima i caricamenti e gli indicatori aggiuntivi, poi chiama `merge.unmount()`.
