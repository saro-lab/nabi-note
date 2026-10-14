---
title: Daidaitawa
description: Yana canza daidaitawar kwance ta sakin layi da tubalan abu.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Daidaitawa

Yana daidaita sakin layi na yanzu da sakin layin da kewayon zaɓi ya ratsa zuwa hagu, tsakiya, ko dama. Abubuwa da ke cikin sakin layi, kamar hoto, bidiyo, da tebur, ana daidaita su bisa sakin layin da ya kewaye abin.

Ana adana daidaitawa a matsayin sifa ta sakin layi, ba tsarin rubutu ba. An cire tubalan lamba daga daidaitawa domin shigar da layi tana da ma'ana a cikinsu.

A cikin sel, daidaitawa tana shafar sakin layi ko hoton da siginar rubutu take. Ja don zaɓar sel da yawa yana amfani da ita ga duk sakin layi da hotunan da za a iya daidaitawa a cikinsu. Idan zaɓin ya haɗa daidaitawa daban-daban, babu maɓallin daidaitawa da zai nuna an zaɓe shi.

Don daidaita tebur ɗin kansa, danna **Zaɓi tebur** a kayan aikinsa na mahalli, ko sa siginar rubutu kafin ko bayan tebur a cikin sakin layin da ya kewaye shi, sannan ka yi amfani da maɓallan daidaitawa na babbar sandar kayan aiki. Ana sauya matsayin hagu ko dama na yankin iyo a kayan aikinsa na mahalli maimakon maɓallan daidaitawa.

<WingDemo path="/wing/etc/align" />

```ts
const selected = wings().use('align').build()
```

Don amfani da umarni ga zaɓin yanzu, yi amfani da `l` don hagu, `c` don tsakiya, da `r` don dama.

```ts
nabi.applyCommand('setAlign', { value: 'c' })
```
