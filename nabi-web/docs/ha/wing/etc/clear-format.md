---
title: Share tsari
description: Yana cire tsarin rubutu da tsarin sakin layi daga yankin da aka zaɓa.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Share tsari

Yana cire tsarin rubutu daga yankin da aka zaɓa gaba ɗaya. Alamomin asali da aka yi rajista kamar kauri, launi, da nau'in rubutu, da siffofin sakin layi kamar take, daidaitawa, da babban harafin farko suna ciki. Haka kuma za ka iya yin wannan ta danna Esc sau biyu a jere.

Ba ya mayar da tsarin daftari kamar jeri, tebur, ambato, ko hoto zuwa rubutu marar tsari. Daidaitawar waje ta hoto da bidiyo, da mahaɗin abin da aka haɗa ta loda fayil, suna nan yadda suke.

<WingDemo path="/wing/etc/clear-format" />

```ts
const selected = wings()
  .use('b')
  .use('i')
  .use('clearFormat')
  .build()
```

Dole ne ka zaɓi wing ɗin tsarin da za a share tare domin a iya share wannan tsarin.
