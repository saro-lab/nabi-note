---
title: Confronto
description: Confronta due documenti affiancati e applica al documento attuale il contenuto precedente selezionato.
---

<script setup>
import CompareDemo from '../../.vitepress/ui/CompareDemo.vue'
</script>

# Confronto

Affianca due documenti salvati per vedere le modifiche. Il confronto può aprirsi senza editor; collega un callback per applicare il contenuto precedente selezionato al documento attuale.

## Applicare contenuto precedente selezionato

A sinistra c’è il documento precedente, a destra quello attuale. **&gt;&gt;** accanto a una modifica applica il contenuto precedente del relativo paragrafo o gruppo di righe. La selezione non avviene carattere per carattere. Puoi anche ripristinare contenuto eliminato o rimuovere quello appena aggiunto.

Prova a ripristinare solo l’orario o gli oggetti da portare. Apri **Documento attuale aggiornato dal callback** per vedere il risultato. **Ricomincia** ripristina l’esempio iniziale.

<CompareDemo />

## Confronto indipendente

Importa da `nabi-note/diff`. Passa NABI TREE JSON salvato o stringhe HTML in `before` e `after`. Costruisci il registry con le stesse wing dell’editor originale per leggere e mostrare integralmente tabelle, elenchi, immagini e altri contenuti.

```ts
import { makeRegistry, wings } from 'nabi-note'
import { mountDiff } from 'nabi-note/diff'
import 'nabi-note/nabi.css'

const registry = makeRegistry(wings().allBasic().build())
const diff = mountDiff({
  root: document.querySelector('#comparison')!,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'it',
})

diff.update(nextPreviousDocument, nextCurrentDocument)

diff.unmount()
```

Per impostazione predefinita appaiono solo modifiche e contesto. Il pulsante di compressione espande i documenti completi; precedente/successivo scorrono le modifiche. Senza modifiche appare tutto il documento. Omettendo `onMerge` il confronto è in sola lettura.

## Collegare l’unione tramite clic a un callback

Il clic passa una proposta di risultato a `onMerge`. Collegare il callback non salva automaticamente il documento. Il servizio deve accettare la proposta e chiamare `update()` per aggiornare il confronto.

```ts
const diff = mountDiff({
  root,
  before: previousDocument,
  after: currentDocument,
  registry,
  locale: 'it',
  onMerge(proposal) {
    if (proposal.signal.aborted) return
    const accepted = diff.update(proposal.before, proposal.result, proposal.revision)
    if (!accepted) return
    currentDocument = proposal.result
  },
  onError(error) {
    showError(error)
  },
})
```

`proposal.result` è NABI TREE JSON con la sola modifica selezionata. `before` e `after` sono i documenti al momento del clic; `changeId` identifica la modifica, `revision` lo stato del confronto. Passa questa `revision` come terzo argomento di `update()`: se il confronto è già cambiato, restituisce `false` senza applicare la proposta.

I clic duplicati sono bloccati durante il callback asincrono. Aggiornare con altri documenti o smontare la vista annulla `signal`. Per salvare sul server, controlla sia il segnale sia la versione del documento, evitando di sovrascrivere contenuti nuovi con risultati obsoleti.

## Aprire il confronto dall’editor

Collega la wing `diff` e `mountDiffWing()` per aprire il confronto dalla barra. Il riferimento è l’ultimo documento caricato. Modifiche ordinarie e annullamento non cambiano il riferimento.

```ts
import { createNabiWith, mountToolbar, wings } from 'nabi-note'
import { mountDiffWing } from 'nabi-note/diff'

const { nabi, registry } = createNabiWith(wings().allBasic().use('diff'))
const comparison = mountDiffWing({
  nabi,
  registry,
  surface: content,
  locale: 'it',
  merge: true,
})
const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  onHost(wing) {
    if (wing === 'diff') comparison.open()
  },
})
```

Con `merge: true`, il contenuto precedente scelto viene applicato all’editor. L’operazione è annullabile e conserva il riferimento. Se l’editor originale cambia a vista aperta, il confronto viene ricalcolato. Omettere `merge` mantiene la sola lettura.

Quando rimuovi la vista, chiama `toolbar.unmount()` e `comparison.unmount()`. Per includere la versione iniziale e combinare automaticamente le modifiche di entrambe le parti, usa [Unione](./merge).
