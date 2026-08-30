---
title: Kiungo
description: Unganisha anwani salama za wavuti na uonyeshe attachments zilizopakiwa.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Kiungo

Chagua maandishi kisha uambatishe anwani. Ukiandika anwani bila kuchagua maandishi, anwani yenyewe huingizwa kama maandishi ya kiungo. Kuandika anwani ya `http://` au `https://` kisha kubonyeza Space au Enter pia huibadilisha kuwa kiungo.

Viungo huhifadhi `http:`, `https:`, na njia za tovuti hiyohiyo zinazoanza kwa `.` au `/` pekee. Anwani ambazo chanzo chake hakiwezi kutambulika wazi, kama `javascript:` au `//example.com`, hukataliwa. Viungo vya viambatisho vinavyoundwa na upakiaji pia huhifadhi maelezo ya faili, na haviwezi kuundwa mwenyewe kama viungo vya kawaida.

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

## Mitindo ya CSS

Tia mtindo viungo vya kawaida kwa `.nabi-content a`, na viungo vya viambatisho kivyake kwa `.nabi-content a[data-nabi-file]`.

```css
.article-body a:not([data-nabi-file]) {
  color: var(--nabi-accent);
  text-decoration-thickness: .08em;
  text-underline-offset: .16em;
}

.article-body a[data-nabi-file] {
  display: inline-flex;
  gap: .35em;
  padding: .25em .55em;
  background: var(--nabi-soft);
}
```

Sehemu za `::before` na `::after` za kiungo cha kiambatisho hutumika kuonyesha ikoni na kiendelezi cha faili, hivyo kwa kawaida ni bora kutobadilisha wala kuondoa `content` yake.
