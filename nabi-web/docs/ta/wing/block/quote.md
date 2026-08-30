---
title: மேற்கோள்
description: மேற்கோள் உரை அல்லது தனி சூழலை பல பத்திகளாக இணைக்கவும்.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# மேற்கோள்

மேற்கோள் உரை அல்லது தனி சூழலை பல பத்திகளாக இணைக்கிறது. வெற்றுப் பத்தியில் `>` க்குப் பின்னர் Space ஐ அழுத்தவும், அல்லது தேர்ந்தெடுத்த பத்திகளை கருவிப்பட்டையில் மேற்கோளாக மாற்றவும்.

மேற்கோளில் சாதாரணப் பத்திகளுடன் பட்டியல், படம் போன்ற தொகுதிகளையும் சேர்க்கலாம். அதே வரம்பை மீண்டும் மாற்றினால் வெளிப்புறப் பத்திகளாகப் பிரியும்.

<WingDemo path="/wing/block/quote" />

```ts
const selected = wings().use('quote').build()
```

## CSS பாணிகள்

மேற்கோளின் எல்லை மற்றும் இடைவெளியை `.nabi-content blockquote` மூலம் மாற்றலாம்.

```css
.article-body blockquote {
  margin-inline: 0;
  padding: .25rem 1rem;
  border-inline-start: 4px solid var(--nabi-accent);
  color: var(--nabi-muted);
  background: color-mix(in srgb, var(--nabi-soft) 72%, transparent);
}
```

`blockquote` உள்ள பத்தி அமைப்பை அப்படியே வைத்துக்கொண்டு, வெளிப்புற இடைவெளி, எல்லை, நிறம் போன்ற தோற்றத்தை மட்டும் மாற்றுங்கள்.
