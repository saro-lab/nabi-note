---
title: Elenco puntato
description: Crea un elenco senza numerazione.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Elenco puntato

Crea un elenco di elementi senza un ordine preciso. In un paragrafo vuoto, digita `-` seguito da Spazio oppure attivalo dalla barra degli strumenti. Puoi anche trasformare in elenco più paragrafi selezionati contemporaneamente.

All'interno dell'elenco, usa Tab per rientrare di un livello e Maiusc+Tab per ridurre il rientro. Enter crea l'elemento successivo; premendo di nuovo Enter su un elemento vuoto puoi terminare l'elenco. Shift+Enter inserisce un'interruzione di riga nell'elemento senza dividerlo.

Gli elenchi nelle celle seguono le stesse regole di input. In un elenco, Tab aumenta il rientro invece di passare a un'altra cella.

<WingDemo path="/wing/block/bullet-list" />

```ts
const selected = wings().use('ul').build()
```
