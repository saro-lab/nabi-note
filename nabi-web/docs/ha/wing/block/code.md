---
title: Lamba
description: Yana ɗaukar lamba mai layuka da yawa da bayanin harshe don haskaka tsarin rubutu.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Lamba

Yana sanya lamba mai layuka da yawa dabam da rubutu na yau da kullum. A sakin layi fanko, rubuta alamar baya uku sannan ka danna Space ko Enter, ko ka sauya ta daga sandar kayan aiki. Idan ka ƙara sunan harshe kamar `ts` bayan alamar baya, ana kuma adana wannan sunan.

Sunan harshe ganewa ne da ake amfani da shi wajen haskaka tsarin rubutu; za ka iya rubuta sunan da kanka ko da bai cikin jerin da aka yi rajista ba. Domin a kiyaye abun lamba da shigar layi, tubalin lamba ba ya amfani da daidaitawar sakin layi.

<WingDemo path="/wing/block/code" />

```ts
const selected = wings().use('code').build()
```

## Haɗa mai haskaka lamba

Idan an yi rajistar tubalin lamba, editan yana amfani da launi na asali. Don yin launi a shafin da aka wallafa ma, haɗa `nabi-note/viewer`. Viewer yana nemo `pre > code`, sannan ya karanta ƙimar `data-nabi-lang` na iyaye a matsayin sunan harshe. Idan babu ƙimar, yana duba ajin `language-...` na sinadarin `code`.

```ts
import { attachViewer } from 'nabi-note/viewer'

const viewer = attachViewer(article, {
  locale: 'ko',
})

// Bayan canza HTML da aka wallafa
viewer.refresh()

// Lokacin rufe allo
viewer.unmount()
```

Idan babu wani mai haskakawa dabam, ko bai iya sarrafa harshen ba, mai raba alama na ciki wanda ba shi da dogaro zai yi launi a madadinsa. span na alama da mai haskakawa ya saka suna wanzuwa a allo kawai; ba sa shiga JSON da aka adana ko asalin HTML da aka wallafa. `refresh()` da `unmount()` suna cire waɗannan span su sake haɗawa da lambar asali ta yanzu.

### Yadda gidan yanar NABI ke haɗa Shiki

Gidan yanar NABI yana loda mai haskakawa a hankali domin a ware Shiki daga allon farko da kundin SSR. `loadCodeHighlighting()` a `nabi-web/docs/.vitepress/src/highlight.ts` yana ƙirƙirar Shiki core, sannan yana kawo nahawun harshe ɗaya kawai idan ana bukatar wannan harshe a lamba. Ga irin wannan haɗawar da ake amfani da ita a shafin da aka wallafa.

```ts
import { attachViewer } from 'nabi-note/viewer'
import { loadCodeHighlighting } from '../src/highlight'

const highlighting = await loadCodeHighlighting()
const viewer = attachViewer(article, {
  locale: 'ko',
  highlight: highlighting?.highlight,
})

const stop = highlighting?.onGrammarLoaded(() => viewer.refresh())

// Lokacin rufe allo
stop?.()
viewer.unmount()
```

Da farko idan aka haɗu da wani harshe, sauke nahawunsa yana farawa, kuma a wannan lokacin za a ga mai raba alama na ciki ko rubutu mara tsari. Idan nahawun ya iso, `onGrammarLoaded()` yana kira `viewer.refresh()` ya sake yin launi. Saboda haka ana sauke harsunan da ake bukata kawai, kuma nahawun da ya iso a makare yana bayyana ba tare da sauya shafi ba.

Bangaren edita ma yana amfani da aikin `highlight` iri ɗaya. Demos na gidan yanar NABI suna maye gurbin `attach` na `codeWing` na asali kawai da `makeCodeAttach({ highlight, version })`. `version` ƙima ce da take canzawa duk lokacin da nahawu ya iso, don a sake yin launin lambar da aka riga aka zana. Sabis mai zaman kansa zai iya fara aiwatar da haɗawar shafin wallafa kawai, sannan ya ƙara wannan hanya idan ana bukatar launin Shiki yayin gyarawa.

## Tsarin CSS

Ana yi wa tubalin lamba ado da `.nabi-content pre`, lambar kuma da `.nabi-content pre > code`. Kada ka canza `white-space`, domin yana shafar layukan lamba da gyarawa. Za ka iya sauya launin alama da zaɓaɓɓen `[data-nabi-token]`.

```css
.nabi-content [data-nabi-token="keyword"] { color: #7b4fd0; }
.nabi-content [data-nabi-token="string"] { color: #a2543a; }
```
