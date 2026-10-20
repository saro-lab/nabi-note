---
title: "Nota a piè di pagina"
description: "Collega spiegazioni aggiuntive con numeri nel testo e un elenco alla fine del documento."
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Nota a piè di pagina

Collega spiegazioni aggiuntive con numeri nel testo e un elenco alla fine del documento.

Inserisci il contenuto con il pulsante delle note nella barra degli strumenti per aggiungere una nota al cursore. Se del testo è selezionato, la nota viene inserita alla fine della selezione senza sostituirlo. I numeri non vengono salvati, ma assegnati automaticamente nell’ordine del documento.

Fai clic su un numero nel testo per modificarne il contenuto nella riga delle proprietà. Usa lo strumento di eliminazione oppure premi due volte Backspace o Delete accanto alla nota per selezionarla e poi eliminarla. L’elenco sottostante è di sola lettura e scompare quando non ci sono note.

Nell’anteprima e nelle pagine pubblicate con il viewer collegato, passa il puntatore su un numero, fai clic o toccalo per leggere il contenuto. È accettata una sola riga di testo semplice, mostrata in un carattere senza grazie con dimensione pari a 0,875 volte quella di base del corpo. L’HTML viene mostrato letteralmente.

<WingDemo path="/wing/inline/footnote" />

```ts
const selected = wings().use('fn').build()
```
