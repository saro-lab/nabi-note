---
title: Jerin alama
description: Yana jera abubuwa da yawa ba tare da wani tsari ba.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Jerin alama

Jeri ne da ke lissafa abubuwa da yawa ba tare da wani tsari ba. A sakin layi fanko, rubuta `-` sannan a danna Space, ko a kunna shi daga sandar kayan aiki. Haka kuma za ka iya haɗa sakin layin da aka zaɓa su zama jeri lokaci guda.

A cikin jeri, Tab yana ƙara matakin shiga, Shift+Tab kuma yana rage shi. Enter yana ƙirƙirar abu na gaba; idan aka sake danna Enter a abu fanko, jeri yana ƙarewa.

<WingDemo path="/wing/block/bullet-list" />

```ts
const selected = wings().use('ul').build()
```
