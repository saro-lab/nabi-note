---
title: వివరాలు
description: సారాంశం, శరీర వచనాన్ని సమూహపరచి మొదట తెరిచి ఉండాలా నిల్వ చేయండి.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# వివరాలు

చిన్న సారాంశం, శరీర వచనాన్ని ఒక బ్లాక్‌లో సమూహపరుస్తుంది. టూల్‌బార్ నుంచి సృష్టించినప్పుడు మొదట సారాంశాన్ని నమోదు చేసి, దాని కింద వచనాన్ని కొనసాగిస్తారు.

త్రిభుజంతో నిర్ణయించిన తెరిచిన స్థితి పత్రంలో నిల్వై, ప్రచురిత వీక్షణలో ప్రారంభ స్థితిగా ఉంటుంది. సవరించేటప్పుడు కూడా త్రిభుజాన్ని నొక్కి బ్లాక్‌ను తెరవవచ్చు, మూయవచ్చు.

పట్టిక గడిలో లేదా మరో బ్లాక్‌లో ఉన్నా, సంబంధిత మడత బ్లాక్ మాత్రమే తెరుచుకుంటుంది లేదా మూసుకుంటుంది. మూస్తున్న విషయభాగంలో కర్సర్ లేదా ఎంపిక ఉంటే దాన్ని బయటకు తరలిస్తుంది; మరో చోట ఉన్న ఎంపిక అలాగే ఉంటుంది.

<WingDemo path="/wing/block/details" />

```ts
const selected = wings().use('details').build()
```

## CSS శైలులు

వివరాల బ్లాక్‌కు `.nabi-content details`, శీర్షికకు `.nabi-content details > summary`తో శైలి ఇవ్వండి.

```css
.article-body details {
  padding: .75rem 1rem;
  border: 1px solid var(--nabi-line);
  border-radius: var(--nabi-radius);
  background: var(--nabi-soft);
}

.article-body details > summary { cursor: pointer; font-weight: 700; }
.article-body details[open] > summary { margin-block-end: .75rem; }
```

`open` లక్షణం రచయిత భద్రపరిచిన ప్రారంభ తెరిచి ఉన్న స్థితి. CSSతో ఈ స్థితికి శైలి ఇవ్వవచ్చు, కానీ స్థితినే బలవంతం చేయకపోవడం మంచిది.
