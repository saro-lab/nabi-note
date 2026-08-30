---
title: Kutumia CDN
description: Mfano wa kuunganisha NABI NOTE ya kivinjari bila zana ya build.
---

<script setup>
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
</script>

# Kutumia CDN

Kwenye ukurasa tuli ambako ni vigumu kusakinisha kifurushi, unaweza kupakia bundle ya kivinjari na CSS ya NABI NOTE kutoka CDN. Mfano hapa chini husoma toleo la kifurushi wakati wa build ili kutengeneza anwani, kisha huunda kihariri kupitia global object `NabiNote`.

<CdnDemo />

## Mambo ya kuangalia katika NABI NOTE

- Katika msimbo wa usambazaji, tumia toleo lilelile lisilobadilika kwa CSS na JavaScript ya kivinjari. Anwani isiyo na toleo kama `latest` inaweza kubadilisha tabia siku toleo jipya linapotolewa.
- Bundle ya kivinjari hutoa API ya msingi kama `window.NabiNote`. Hakuna bundle tofauti za jumla za `nabi-note/ssr`, `nabi-note/viewer`, na `nabi-note/diff`.
- Kuhifadhi faili na historia ya ndani katika mfano hufanya kazi kwenye kivinjari cha mtumiaji. Ikiwa unahitaji hifadhi ya seva au ulandanishi wa akaunti, tuma matokeo ya `getJson()` kwenye API ya programu.
- Unapoongeza upakiaji, usiunganishe wing `upload` pekee; unganisha pia kazi halisi ya kutuma na wings za picha au kiungo zinazohitajika. Seva ya upakiaji ndiyo inayowajibika kuthibitisha faili.
- Bundle ya kivinjari huunganisha HTML parser ndani yake. Kwa hiyo `setHtml()`, kufungua faili ya HTML, na kubandika HTML havihitaji chaguo tofauti la parser au API ya faragha.

CDN hutofautiana tu katika namna ya kupakia. Muundo wa kuhifadhi na uthibitishaji wa ingizo ni sawa na usakinishaji wa npm, kwa hiyo soma pia [matumizi ya msingi](/sw/guide/getting-started).
