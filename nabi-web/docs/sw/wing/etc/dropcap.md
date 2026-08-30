---
title: Herufi Kubwa ya Mwanzo
description: Anzisha maandishi ya mwili kwa herufi ya kwanza kubwa.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Herufi Kubwa ya Mwanzo

Weka herufi ya kwanza ya aya kwa ukubwa zaidi na uruhusu mistari inayofuata ipite kandokando yake. Huu ni uumbizaji wa kiwango cha aya, kwa hiyo hautumiki kwa sehemu tu ya neno lililochaguliwa.

Mwonekano uliochapishwa na mwonekano wa kuhariri huhifadhi umbo lilelile. Wakati wa kuhariri, herufi ya kwanza hufungwa katika elementi halisi ili nafasi za kielekezi na kufuta zisihame; elementi hiyo haijumuishwi kwenye maudhui ya hati yaliyohifadhiwa.

<WingDemo path="/wing/etc/dropcap" />

```ts
const selected = wings().use('dc').build()
```

## Mitindo ya CSS

Mwonekano uliochapishwa na wa kuhariri hutumia viteuzi tofauti kwa herufi ya kwanza. Mwonekano uliochapishwa hutumia `[data-nabi-dropcap="1"]::first-letter`, huku wa kuhariri ukitumia elementi halisi `[data-nabi-dropcap-letter]`. Unapobadilisha thamani zinazoonekana kama rangi, fonti au ukubwa, andika viteuzi vyote viwili pamoja ili uhariri na toleo lililochapishwa vionekane sawa.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  color: var(--nabi-accent);
  font-family: var(--nabi-font-serif);
}
```

Ukibadilisha ukubwa na urefu wa mstari, tumia thamani zilezile kwa viteuzi vyote viwili.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  font-size: 5.5em;
  line-height: .85;
}
```

Herufi kubwa za mwanzo hukokotoa mtiririko wa mistari kuzunguka herufi ya kwanza, hivyo kubadilisha upande mmoja tu au kufanya thamani ziwe kubwa sana kunaweza kuharibu umbo la WYSIWYG. Bado epuka kuongeza kanuni mpya ya `::first-letter` kwenye kihariri. Katika kihariri, tia mtindo tu kwenye `[data-nabi-dropcap-letter]` iliyopo.
