---
title: Area flottante
description: Disponi testo, immagini e tabelle accanto al corpo del testo, lasciando scorrere i paragrafi successivi al loro fianco.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Area flottante

Posiziona una breve descrizione, un’immagine o una piccola tabella a sinistra o a destra e lascia scorrere il corpo del testo accanto. Puoi modificare il contenuto dell’area direttamente nello stesso editor. Il bordo tratteggiato appare solo durante la modifica; l’anteprima e la vista pubblicata mostrano soltanto contenuto e disposizione.

Posiziona il cursore nell’area dell’esempio seguente e usa gli strumenti delle proprietà per cambiarne il lato e la larghezza massima. Nell’anteprima puoi vedere il testo scorrere senza il bordo tratteggiato.

<WingDemo path="/wing/block/float" />

```ts
const selected = wings().allBasic().build()
```

Le aree flottanti sono incluse nelle ali di base. Se componi soltanto le ali necessarie, usa `wings().use('float')` o registra direttamente `floatWing`. Registra anche le ali per immagini, tabelle, elenchi e altri contenuti usati nell’area.

## Creare e posizionare

Posiziona il cursore nel corpo del testo e fai clic su **Area flottante** per creare un’area vuota. Le impostazioni predefinite sono lato destro e larghezza massima del 40%. Se prima selezioni più paragrafi, tutti i paragrafi toccati dalla selezione vengono racchiusi interamente in un’unica area. Non puoi avvolgere nuovamente un’area flottante esistente né crearne un’altra al suo interno.

```ts
nabi.applyCommand('insertFloat', { side: 'right', w: 40 })
```

Con il cursore nell’area, usa gli strumenti delle proprietà per scegliere sinistra o destra e la larghezza massima. Puoi scegliere 20%, 30%, 40% o 50%. Il valore è relativo alla larghezza del corpo del testo, non all’intero schermo; con contenuti brevi l’area effettiva può essere più stretta.

```ts
nabi.applyCommand('setFloatSide', { side: 'left' })
nabi.applyCommand('setFloatWidth', { w: 30 })
```

Incollare testo, immagini e tabelle, convertire blocchi e caricare file mantiene il contenuto nell’area. Eliminare una tabella interna rimuove solo quella tabella. Non puoi inserire o convertire blocchi interni quando la selezione comprende sia l’interno sia l’esterno dell’area.

Il pulsante **Sciogli area flottante**, accanto al valore della larghezza, restituisce il contenuto al corpo del testo senza eliminarlo. Creazione, cambiamenti di disposizione e rimozione dell’involucro supportano annullamento e ripristino.

```ts
nabi.applyCommand('unwrapFloat')
```

## Come scorre il testo intorno all’area

I paragrafi successivi scorrono accanto all’area e tornano alla larghezza completa del testo quando questa termina. Il titolo, la tabella, il blocco di codice, il divisore o la nuova area flottante successivi iniziano sotto l’area precedente.

Se la larghezza del testo è inferiore a `36rem`, l’area e il corpo del testo vengono disposti su una sola colonna. Anche la stampa usa una colonna, conservando il lato e la larghezza massima salvati. La vista di confronto dei documenti mantiene il lato e la larghezza massima di ogni area, ma mostra il blocco successivo separatamente sotto di essa per rendere più leggibili le modifiche.

## Salvare e caricare

Il JSON salva `a.side` e `a.w` del nodo `float` insieme ai blocchi interni. L’HTML usa gli attributi `data-nabi-float` e `data-nabi-float-width` su un `div` all’interno di un normale paragrafo oggetto.

```html
<div data-nabi-p>
  <div data-nabi-float="right" data-nabi-float-width="40">
    <p>Una descrizione da posizionare accanto al corpo del testo.</p>
  </div>
</div>
<p>Questo paragrafo prosegue accanto all’area.</p>
```

L’esportazione Markdown conserva l’area come HTML. Non vengono importati stili CSS `float` arbitrari, quindi usa JSON o HTML generato da NABI NOTE per salvare e ripristinare. Collega le stesse ali e lo stesso CSS nell’editor, in SSR, nell’anteprima e nella vista pubblicata per mantenere lato e larghezza.

## Stili CSS

Personalizza colori e spaziature dell’area con il selettore `[data-nabi-float]`. Il paragrafo esterno gestisce disposizione e larghezza massima, quindi non sovrascrivere direttamente `float`, `display` o la larghezza.

```css
.brand-note .nabi-content [data-nabi-float] {
  background: var(--nabi-soft);
  border-radius: var(--nabi-radius);
  padding: .75rem;
}
```
