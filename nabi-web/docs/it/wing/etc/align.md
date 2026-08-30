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

<WingDemo path="/wing/etc/align" />

```ts
const selected = wings().use('align').build()
```
