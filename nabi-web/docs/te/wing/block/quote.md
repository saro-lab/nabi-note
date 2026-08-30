---
title: ఉల్లేఖనం
description: ఉల్లేఖించిన వచనాన్ని సమూహపరచండి లేదా అనేక పేరాల్లో సందర్భాన్ని వేరు చేయండి.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# ఉల్లేఖనం

ఉల్లేఖించిన వచనాన్ని సమూహపరచండి లేదా అనేక పేరాల్లో సందర్భాన్ని వేరు చేయండి. ఖాళీ పేరాలో `>` తర్వాత Space నొక్కండి, లేదా టూల్‌బార్ నుంచి ఎంచుకున్న పేరాలను ఉల్లేఖనంగా మార్చండి.

ఉల్లేఖనంలో సాధారణ పేరాలతోపాటు జాబితాలు, చిత్రాలు వంటి బ్లాక్‌లు ఉండవచ్చు. అదే పరిధిని మళ్లీ మార్చితే అది బయటి పేరాలుగా తిరిగి మారుతుంది.

<WingDemo path="/wing/block/quote" />

```ts
const selected = wings().use('quote').build()
```

## CSS శైలులు

అంచులు, ఖాళీలను మార్చి `.nabi-content blockquote`తో ఉల్లేఖనాలకు శైలి ఇవ్వండి.

```css
.article-body blockquote {
  margin-inline: 0;
  padding: .25rem 1rem;
  border-inline-start: 4px solid var(--nabi-accent);
  color: var(--nabi-muted);
  background: color-mix(in srgb, var(--nabi-soft) 72%, transparent);
}
```

`blockquote`లోని పేరా నిర్మాణాన్ని ఉంచి, బయటి ఖాళీ, అంచులు, రంగు వంటి రూపాన్ని మాత్రమే మార్చండి.
