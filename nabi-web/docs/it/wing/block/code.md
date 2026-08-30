---
title: Codice
description: Memorizza codice su più righe insieme alla lingua usata per l'evidenziazione della sintassi.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Codice

Inserisci il codice su più righe separatamente dal testo normale. In un paragrafo vuoto digita tre accenti gravi e premi Spazio o Invio, oppure passa a un blocco di codice dalla barra degli strumenti. Se aggiungi dopo gli accenti gravi un nome di linguaggio, come `ts`, viene salvato anche quel nome.

Il nome del linguaggio è un identificatore usato per l'evidenziazione della sintassi e possono essere digitati manualmente anche nomi al di fuori dell'elenco registrato. Poiché il contenuto del codice e il rientro devono essere preservati, i blocchi di codice non accettano l'allineamento del paragrafo.

<WingDemo path="/wing/block/code" />

```ts
const selected = wings().use('code').build()
```

## Collegare un evidenziatore di codice

La registrazione del blocco di codice usa la colorazione predefinita nell'editor. Per colorare il codice anche nella vista pubblicata, collega `nabi-note/viewer`. Il viewer trova `pre > code` e legge il valore `data-nabi-lang` dell'elemento padre come nome del linguaggio. Se quel valore manca, controlla la classe `language-...` dell'elemento `code`.

```ts
import { attachViewer } from 'nabi-note/viewer'

const viewer = attachViewer(article, {
  locale: 'it',
})

// Dopo aver sostituito l'HTML pubblicato
viewer.refresh()

// Alla chiusura della schermata
viewer.unmount()
```

Se non esiste un evidenziatore separato oppure non riesce a gestire il linguaggio, al suo posto colora il tokenizer incorporato senza dipendenze. Gli span dei token inseriti dall'evidenziatore esistono solo sullo schermo e non vengono riscritti nel JSON salvato né nell'HTML pubblicato originale. `refresh()` e `unmount()` rimuovono quegli span e si ricollegano dal codice originale corrente.

### Come il sito NABI collega Shiki

Il sito NABI carica dinamicamente l'evidenziatore affinché Shiki non entri nella prima schermata né nel bundle SSR. `loadCodeHighlighting()` in `nabi-web/docs/.vitepress/src/highlight.ts` crea il core di Shiki, poi recupera la grammatica di un linguaggio solo quando il codice in quel linguaggio serve davvero. L'esempio seguente usa lo stesso collegamento nella vista pubblicata.

```ts
import { attachViewer } from 'nabi-note/viewer'
import { loadCodeHighlighting } from '../src/highlight'

const highlighting = await loadCodeHighlighting()
const viewer = attachViewer(article, {
  locale: 'it',
  highlight: highlighting?.highlight,
})

const stop = highlighting?.onGrammarLoaded(() => viewer.refresh())

// Alla chiusura della schermata
stop?.()
viewer.unmount()
```

Quando un linguaggio appare per la prima volta, inizia il download della grammatica. Fino ad allora il blocco viene mostrato con il tokenizer incorporato o come testo semplice. Quando la grammatica arriva, `onGrammarLoaded()` chiama `viewer.refresh()` e colora di nuovo il blocco. In questo modo vengono scaricati solo i linguaggi necessari e una grammatica arrivata tardi viene applicata senza un'altra navigazione di pagina.

Anche il lato editor usa la stessa funzione `highlight`. La demo del sito NABI sostituisce solo l'`attach` del `codeWing` predefinito con `makeCodeAttach({ highlight, version })`. `version` cambia ogni volta che arriva una grammatica e agisce come segnale per ricolorare il codice già disegnato. Un servizio indipendente può prima implementare il collegamento della vista pubblicata, quindi aggiungere questo approccio solo se la colorazione Shiki serve anche durante la modifica.

## Stili CSS

Personalizza i blocchi di codice con `.nabi-content pre` e il codice con `.nabi-content pre > code`. Non modificare `white-space`, perché influenza le interruzioni di riga e la modifica del codice. I colori dei token possono essere cambiati con i selettori `[data-nabi-token]`.

```css
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
```
