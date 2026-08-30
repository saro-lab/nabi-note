---
title: పెద్ద తొలి అక్షరం
description: శరీర వచనాన్ని పెద్ద తొలి అక్షరంతో ప్రారంభించండి.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# పెద్ద తొలి అక్షరం

పేరా మొదటి అక్షరాన్ని పెద్ద పరిమాణంలో ఉంచి, తదుపరి పంక్తులు దాని పక్కగా ప్రవహించేలా చేయండి. ఇది పేరా-స్థాయి ఆకృతీకరణ కాబట్టి ఎంచుకున్న పదంలోని కొంత భాగానికే వర్తించదు.

ప్రచురిత, సవరణ వీక్షణలు ఒకే ఆకారాన్ని ఉంచుతాయి. సవరించేటప్పుడు కర్సర్, తొలగింపు స్థానాలు జారకుండా మొదటి అక్షరం నిజమైన ఎలిమెంట్‌లో చుట్టబడుతుంది; ఆ ఎలిమెంట్ నిల్వ పత్ర కంటెంట్‌లో ఉండదు.

<WingDemo path="/wing/etc/dropcap" />

```ts
const selected = wings().use('dc').build()
```

## CSS శైలులు

ప్రచురిత, సవరణ వీక్షణలు మొదటి అక్షరానికి వేర్వేరు సెలెక్టర్లను వాడతాయి. ప్రచురిత వీక్షణ `[data-nabi-dropcap="1"]::first-letter`ను, సవరణ వీక్షణ నిజమైన `[data-nabi-dropcap-letter]` ఎలిమెంట్‌ను వాడుతుంది. రంగు, ఫాంట్, పరిమాణం వంటి కనిపించే విలువలను మార్చేటప్పుడు రెండు సెలెక్టర్లను కలిపి రాయండి, అప్పుడు రెండు అవుట్‌పుట్‌లు ఒకేలా కనిపిస్తాయి.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  color: var(--nabi-accent);
  font-family: var(--nabi-font-serif);
}
```

పరిమాణం, పంక్తి ఎత్తు మార్చితే రెండు సెలెక్టర్లకు ఒకే విలువలను వర్తింపజేయండి.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  font-size: 5.5em;
  line-height: .85;
}
```

పెద్ద తొలి అక్షరాలు మొదటి అక్షరం చుట్టూ పంక్తి ప్రవాహాన్ని లెక్కిస్తాయి; ఒక వైపు మాత్రమే మార్చడం లేదా విలువలను అతిగా పెంచడం WYSIWYG ఆకారాన్ని చెడగొడుతుంది. ఎడిటర్‌కు కొత్త `::first-letter` నియమాన్ని చేర్చవద్దు. ఎడిటర్‌లో ఉన్న `[data-nabi-dropcap-letter]`కే శైలి ఇవ్వండి.
