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

## Manna URL

Idan duk abin da aka manna, bayan cire fararen sarari a farko da ƙarshe, ingantaccen URL ne na `http://` ko `https://`, ana saka shi nan take a matsayin mahaɗi. URL da ke cikin jimloli, rubutu mai URL fiye da ɗaya, da hanyoyin dangi suna bin tsarin manna da ake amfani da shi. A cikin tubalan lamba da editocin da ba su da wing na mahaɗi, abin da aka manna yana nan a matsayin rubutu. Ana ba ingantattun bayanan allo na cikin gida da aka kwafa daga edita fifiko don kiyaye tsarin su na asali.

Yi amfani da callback na `onPasteUrl` a cikin `mountSurface()` don zaɓar rubutun da mahaɗin zai nuna.

| Argument | Ƙima |
| --- | --- |
| `url` | Cikakken URL bayan cire fararen sarari a farko da ƙarshe |
| `isSameOrigin` | Ko protocol, host da port na URL sun yi daidai da origin na takardar da ke ɗauke da edita |
| `path` | Hanyar da ta fara da `/`, tare da query da fragment. Misali: `/posts/1?a=2#top` |

```ts
const surface = mountSurface({
  nabi,
  registry,
  root: document.querySelector<HTMLElement>('#editor')!,
  onPasteUrl(url, isSameOrigin, path) {
    if (isSameOrigin && path === '/guide') return 'NABI NOTE'
    return url
  },
})
```

Idan string ɗin da aka dawo da shi yana da haruffa waɗanda ba fararen sarari kawai ba ne, shi ne zai zama rubutun da ake nunawa. Idan callback babu shi, ya dawo da ƙima marar komai ko wadda ba string ba, ko ya gaza, URL ɗin da aka manna zai ci gaba da zama rubutun da ake nunawa. Ba a taɓa fassara string ɗin da aka dawo da shi a matsayin HTML ba, kuma ba ya canza adireshin mahaɗin.

Callback yana kuma goyon bayan ayyukan `async` da Promise. Ana saka mahaɗin URL nan take yayin jiran amsa; ingantaccen sakamakon da ya zo daga baya yana canza rubutun wannan mahaɗin kawai. Ana yin watsi da sakamakon da ya makara idan an gyara ko an goge mahaɗin, an loda sabuwar takarda, ko an cire surface.

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
