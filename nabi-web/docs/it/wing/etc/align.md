---
title: Allineamento
description: Cambia l'allineamento orizzontale di paragrafi e blocchi oggetto.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Allineamento

Allinea a sinistra, al centro o a destra il paragrafo corrente oppure i paragrafi nell'intervallo selezionato. Gli oggetti contenuti in un paragrafo, come immagini, video e tabelle, vengono allineati attraverso il paragrafo che li racchiude.

L'allineamento viene salvato come attributo del paragrafo, non come formattazione del testo. I blocchi di codice sono esclusi dall'allineamento perché lì il rientro ha un significato proprio.

In una cella, l'allineamento si applica al paragrafo interno o all'immagine in corrispondenza del cursore. Selezionando più celle mediante trascinamento, si applica a tutti i loro paragrafi e immagini allineabili. Se la selezione contiene allineamenti diversi, nessun pulsante di allineamento risulta selezionato.

Per allineare la tabella stessa, premi **Seleziona tabella** nei suoi strumenti contestuali oppure posiziona il cursore prima o dopo la tabella nel paragrafo che la contiene, poi usa i pulsanti di allineamento della barra principale. La posizione a sinistra o a destra di un'area flottante si modifica nei suoi strumenti contestuali, anziché con i pulsanti di allineamento.

<WingDemo path="/wing/etc/align" />

```ts
const selected = wings().use('align').build()
```

Per applicare un comando alla selezione corrente, usa `l` per sinistra, `c` per centro e `r` per destra.

```ts
nabi.applyCommand('setAlign', { value: 'c' })
```
