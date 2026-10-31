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

## Kubandika URL

Ikiwa maudhui yote yanayobandikwa, baada ya kuondoa nafasi tupu mwanzoni na mwishoni, ni URL halali ya `http://` au `https://`, yanaingizwa mara moja kama kiungo. URL zilizo ndani ya sentensi, maandishi yenye URL kadhaa, na njia za jamaa hufuata utaratibu wa kubandika uliopo. Katika vizuizi vya msimbo na vihariri visivyo na wing ya kiungo, maudhui hubaki maandishi. Data halali ya ndani ya ubao wa kunakili iliyonakiliwa kutoka kwa kihariri hupewa kipaumbele ili kuhifadhi umbizo lake la asili.

Tumia callback ya `onPasteUrl` katika `mountSurface()` kuchagua maandishi yanayoonyeshwa kwenye kiungo.

| Hoja | Thamani |
| --- | --- |
| `url` | URL nzima baada ya kuondoa nafasi tupu mwanzoni na mwishoni |
| `isSameOrigin` | Ikiwa itifaki, mwenyeji na port ya URL zinalingana na origin ya hati iliyo na kihariri |
| `path` | Njia inayoanza na `/`, ikijumuisha query na fragment. Mfano: `/posts/1?a=2#top` |

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

Mfuatano wa maandishi unaorudishwa ukiwa na herufi zisizo nafasi tupu huwa maandishi yanayoonyeshwa. Ikiwa callback haipo, inarudisha thamani tupu au isiyo mfuatano wa maandishi, au inashindwa, URL iliyobandikwa hubaki kuwa maandishi yanayoonyeshwa. Mifuatano inayorudishwa haitafsiriwi kamwe kama HTML na haibadilishi anwani ya kiungo.

Callback pia inakubali vitendaji vya `async` na Promise. Kiungo cha URL huingizwa mara moja wakati jibu linasubiriwa; matokeo halali yanayofika baadaye hubadilisha tu maandishi yanayoonyeshwa kwenye kiungo hicho. Matokeo yaliyochelewa hupuuzwa ikiwa kiungo kimehaririwa au kufutwa, hati mpya imepakiwa, au surface imeondolewa.

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
