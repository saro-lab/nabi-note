---
title: Hoto
description: Yana saka adireshin hoto kuma yana daidaita faɗi da matsayi.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Hoto

Yana saka adireshin hoto kuma yana daidaita faɗi da matsayi. Ta asali ana yarda da `http:`, `https:`, ko hanyar shafin iri ɗaya kawai; sabon hoto yana farawa a tsakiya da faɗin 60%.

Ana adana faɗi ne kawai a cikin matakan da aka ƙayyade, kuma ana adana daidaitawa a sakin layin da ya kewaye hoton. Don amfani da samfotin `blob:` da `data:image/...`, dole ne ka yarda da URL na gida a bayyane a wing ɗin hoto da haɗawar edita bi da bi. Ba a yarda da URL ɗin bayanan SVG ba.

<WingDemo path="/wing/block/image" />

```ts
const selected = wings().use('img', {
  allowLocalUrls: false,
}).build()
```

Wannan wing yana saka adireshi a cikin daftari kawai; ba ya aika fayil. Domin tura fayil zuwa sabar, haɗa [wing ɗin loda fayil](/ha/wing/etc/upload).

## Haɗa zaɓin hoto

Yi amfani da `panels.img` a cikin `mountToolbar()` don maye gurbin taga shigar da URL ta maɓallin hoto da zaɓin hotuna na sabis ɗinka. Makullai su ne sunayen guraben toolbar; kayan aikin da ba a ambata ba suna riƙe tagoginsu na asali.

`mode: 'modal'` yana buɗe taga a kan bango mai ɗan nuna abin da ke bayansa, wanda ya rufe dukan shafin. `mode: 'inline'` yana buɗewa kusa da maɓallin kayan aiki a kwamfuta, kuma yana cika allo a waya. Faɗin wurin nuni da `--nabi-mobile-breakpoint` ne ke tantance yanayin waya; idan aka tsallake wannan iyaka yayin da panel na `inline` yake buɗe, zai rufe.

Duk yanayin biyu suna samar da `root` marar komai kawai, ba tare da take, filayen shigarwa ko maɓallai ba. Saka HTML ko UI ɗinka a cikin `render`, haɗa maɓallin rufewa da `close()`, kuma haɗa zaɓin hoto da `insertImage(url, 'pointer')`. Saitunan da ake da su a tsarin aiki (`img: renderer`) suna riƙe yadda suke nunawa.

```ts
import { mountToolbar } from 'nabi-note'

const toolbar = mountToolbar({
  nabi,
  registry,
  root: toolbarRoot,
  surface: content,
  panels: {
    img: {
      mode: 'inline',
      render: ({ root, signal, close, insertImage }) =>
        mountMyImagePicker(root, {
          signal,
          onClose: close,
          onSelect: (url: string) => insertImage(url, 'pointer'),
        }),
    },
  },
})
```

`mountMyImagePicker` aiki ne da za ka aiwatar a cikin sabis ɗinka. Yana gina UI ɗinka a cikin `root` da aka bayar a lokaci guda, sannan ya mayar da aikin tsaftacewa. Haɗa `signal` da ayyukan da ba sa kammalawa nan take, kamar ɗauko jerin hotuna ko loda fayil, sannan ka miƙa URL na hoton da aka zaɓa zuwa `onSelect`. Wannan API ba ya aika fayiloli; ƙa’idodin URL na hotuna da ake da su suna ci gaba da aiki.

`insertImage(src, by?)` daidai yake da `run('insertImage', { src }, by)`, har da ƙimar da yake mayarwa da ƙa’idodin dawo da zaɓi. Idan ba a ba da `by` ba, ana amfani da `'keyboard'`. Kada ka mai da `render` aikin `async`.

Rufe taga ko cire toolbar yana soke `signal` kuma ya kira aikin tsaftacewa. `run()` yana rufe taga kuma ya aiwatar da umarni sau ɗaya a zaɓin da aka adana lokacin buɗewa. Idan an riga an rufe taga ko abubuwan da ke cikin takardar sun canza bayan buɗewa, yana mayar da `false` ba tare da aiwatar da umarnin ba.

## Tsarin CSS

Ana yi wa hoto ado da `.nabi-content img`. Ka bar faɗi da daidaitawar da aka adana yadda suke, kuma ka canza kamanni kawai, kamar iyaka ko inuwa.

```css
.article-body img {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
}

.dark .article-body img { box-shadow: 0 8px 24px rgb(0 0 0 / 35%); }
```

Ka bar dokokin asali game da `max-inline-size`, `block-size`, faɗi, da daidaitawa. Girman hoto ƙima ce da aka adana a daftari; idan CSS ya tilasta masa ƙima kafaffe, zai iya saɓa da faɗin da marubuci ya zaɓa.
