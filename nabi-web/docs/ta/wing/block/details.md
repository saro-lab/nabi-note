---
title: மடக்கு
description: சுருக்கத்தையும் உள்ளடக்கத்தையும் இணைத்து, ஆரம்ப விரிவாக்க நிலையைச் சேமிக்கவும்.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# மடக்கு

சிறிய சுருக்கத்தையும் உள்ளடக்கத்தையும் ஒரே தொகுதியாக இணைக்கிறது. கருவிப்பட்டையில் உருவாக்கும்போது முதலில் சுருக்கத்தை உள்ளிட்டு, அதன் கீழ் உள்ளடக்கத்தைத் தொடர்ந்து எழுதலாம்.

முக்கோணக் குறியால் தீர்மானித்த விரிவாக்க நிலை ஆவணத்தில் சேமிக்கப்பட்டு, வெளியிட்ட பக்கத்தின் ஆரம்ப நிலையாகும். திருத்தும்போது உள்ளடக்கத்தை மாற்றுவதற்காக உட்பகுதி விரிவாகவே இருக்கும்; ஆனால் சேமிக்கப்படும் நிலை மாற்றமின்றி இருக்கும்.

<WingDemo path="/wing/block/details" />

```ts
const selected = wings().use('details').build()
```

## CSS பாணிகள்

மடக்கு தொகுதியை `.nabi-content details` மூலமும், தலைப்பை `.nabi-content details > summary` மூலமும் வடிவமைக்கலாம்.

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

`open` பண்புக்கூறு ஆசிரியர் சேமித்த ஆரம்ப விரிவாக்க நிலையாகும். CSS இதை வடிவமைக்கலாம்; ஆனால் நிலையை வலுக்கட்டாயமாக மாற்றாமல் இருப்பது நல்லது.
