---
title: Mahaɗi
description: Haɗa adireshin yanar gizo masu aminci kuma nuna abin da aka ɗora a haɗe.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Mahaɗi

Zaɓi rubutu sannan ka haɗa adireshi da shi. Idan ka shigar da adireshi ba tare da zaɓin rubutu ba, adireshin da kansa zai zama rubutun mahaɗin. Shigar da adireshin `http://` ko `https://` sannan a danna Space ko Enter shi ma yana mai da shi mahaɗi.

Mahaɗi yana adana `http:`, `https:`, da hanyar shafi iri ɗaya da ta fara da `.` ko `/` kawai. Ana ƙin adireshin da ba a iya gane asalinsa a sarari, kamar `javascript:` ko `//example.com`. Mahaɗin abin da aka ɗora yana kuma adana bayanin fayil, kuma ba za a iya ƙirƙirarsa da hannu kamar mahaɗi na yau da kullum ba.

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

## Salon CSS

Ana iya yi wa mahaɗin yau da kullum salo da `.nabi-content a`, sannan a yi wa mahaɗin fayil da aka haɗa salo dabam da `.nabi-content a[data-nabi-file]`.

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

Ana amfani da `::before` da `::after` na mahaɗin fayil don nuna alamar fayil da tsawo, saboda haka yawanci yana da kyau kada a canja ko a cire `content` ɗinsu.
