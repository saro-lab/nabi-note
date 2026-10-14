---
title: Mpangilio
description: Badilisha mpangilio wa mlalo wa aya na blokii za vitu.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Mpangilio

Panga aya ya sasa, au aya zilizo katika eneo lililochaguliwa, kushoto, katikati, au kulia. Vitu vilivyomo ndani ya aya, kama picha, video na majedwali, hupangwa kupitia aya inayovizunguka.

Mpangilio huhifadhiwa kama sifa ya aya, si uumbizaji wa maandishi. Blokii za msimbo hazijumuishwi katika mpangilio kwa sababu ujongezaji wenyewe una maana humo.

Ndani ya seli, upangaji hutumika kwa aya au picha ilipo kishale. Kuchagua seli kadhaa kwa kuburuta huutumia kwa aya na picha zote zinazoweza kupangwa ndani yake. Uteuzi ukiwa na mipangilio tofauti, hakuna kitufe cha kupanga kinachoonyeshwa kuwa kimechaguliwa.

Ili kupanga jedwali lenyewe, bofya **Chagua jedwali** katika zana zake za muktadha, au weka kishale kabla au baada ya jedwali ndani ya aya inayolizunguka, kisha tumia vitufe vya kupanga vya upau mkuu. Badilisha nafasi ya kushoto au kulia ya eneo linaloelea katika zana zake za muktadha badala ya vitufe vya kupanga.

<WingDemo path="/wing/etc/align" />

```ts
const selected = wings().use('align').build()
```

Kutumia amri kwenye uteuzi wa sasa, tumia `l` kwa kushoto, `c` kwa katikati na `r` kwa kulia.

```ts
nabi.applyCommand('setAlign', { value: 'c' })
```
