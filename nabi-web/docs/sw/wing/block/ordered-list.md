---
title: Orodha Yenye Namba
description: Unda orodha yenye namba kiotomatiki.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Orodha Yenye Namba

Huunda orodha yenye namba kwa vipengee ambavyo mpangilio wake ni muhimu. Katika aya tupu, andika namba na nukta kama `1.` kisha ubonyeze Space, au badilisha aya ulizochagua kwenye upau wa zana.

Namba zinazoonyeshwa hukokotolewa kutokana na nafasi ya kipengee, kwa hiyo huendelea kiotomatiki hata unapoongeza au kuingiza vipengee. Kipengele cha kuhifadhi namba ya kuanzia uliyoandika na kuhesabu kuanzia namba yoyote hakitolewi.

Enter huunda kipengee kinachofuata, na Shift+Enter huingiza tu mstari mpya ndani ya kipengee cha sasa. Tab na Shift+Tab huongeza na kupunguza ujongezaji; hata ndani ya seli, ujongezaji wa orodha hupewa kipaumbele kuliko kuhamia seli nyingine.

<WingDemo path="/wing/block/ordered-list" />

```ts
const selected = wings().use('ol').build()
```
