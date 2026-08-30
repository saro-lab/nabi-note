---
title: Ondoa Uumbizaji
description: Ondoa uumbizaji wa maandishi na aya kutoka kwenye chaguo.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Ondoa Uumbizaji

Ondoa uumbizaji wa maandishi kutoka eneo lililochaguliwa kwa mkupuo. Alama chaguomsingi zilizosajiliwa kama herufi nzito, rangi na aina ya herufi, pamoja na sifa za aya kama kichwa, mpangilio na herufi kubwa ya mwanzo, hujumuishwa. Kubonyeza Esc mara mbili haraka hufanya kitendo kilekile.

Haitoi miundo ya hati kama orodha, majedwali, nukuu au picha na kuigeuza kuwa maandishi ya kawaida. Mpangilio wa nje wa picha na video, pamoja na viungo vya viambatisho vilivyoundwa na upakiaji, hubaki kama ulivyo.

<WingDemo path="/wing/etc/clear-format" />

```ts
const selected = wings()
  .use('b')
  .use('i')
  .use('clearFormat')
  .build()
```

Wing za uumbizaji unazotaka kuondoa lazima pia zichaguliwe, vinginevyo uumbizaji wake hauwezi kuondolewa.
