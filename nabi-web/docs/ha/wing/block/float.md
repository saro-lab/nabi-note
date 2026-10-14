---
title: Yanki mai iyo
description: Sanya rubutu, hotuna da tebur a gefen babban rubutu, don sakin layin da ke bi su gudana a gefensu.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Yanki mai iyo

Sanya taƙaitaccen bayani, hoto ko ƙaramin tebur a hagu ko dama, ka bar babban rubutu ya gudana a gefensa. Ana iya gyara abun cikin yankin kai tsaye a edita ɗaya. Iyaka mai tsinke-tsinken layi tana bayyana ne yayin gyarawa kawai; samfoti da shafin da aka wallafa suna nuna abun ciki da shimfiɗarsa kawai.

Sanya siginan cikin yankin misalin da ke ƙasa, sannan ka sauya gefensa da iyakar faɗinsa daga kayan saitunan. A samfoti, za ka ga yadda rubutu yake ci gaba ba tare da iyaka mai tsinke-tsinken layi ba.

<WingDemo path="/wing/block/float" />

```ts
const selected = wings().allBasic().build()
```

Yankuna masu iyo suna cikin fuka-fukan asali. Idan kana haɗa fuka-fukan da ake buƙata kawai, yi amfani da `wings().use('float')` ko ka yi rajistar `floatWing` kai tsaye. Haka kuma ka yi rajistar fuka-fukan hotuna, tebur, jerin abubuwa da sauran abubuwan da za a yi amfani da su cikin yankin.

## Ƙirƙira da sanyawa

Sanya siginan a babban rubutu sannan ka danna **Yanki mai iyo** don ƙirƙirar yanki marar komai. Saitin tsoho shi ne gefen dama da iyakar faɗi 40%. Idan ka zaɓi sakin layi da yawa kafin dannawa, duk sakin layin da zaɓin ya taɓa za su shiga gaba ɗaya cikin yanki guda. Ba za ka iya sake kewaye yankin mai iyo da yake akwai ko ƙirƙirar wani a cikinsa ba.

```ts
nabi.applyCommand('insertFloat', { side: 'right', w: 40 })
```

Idan siginan yana cikin yankin, yi amfani da kayan saitunan don zaɓar hagu ko dama da iyakar faɗi. Zaɓi 20%, 30%, 40% ko 50%. Ƙimar tana dogara ga faɗin babban rubutu, ba dukan allo ba; idan abun ciki ya yi kaɗan, ainihin yankin na iya zama mafi ƙunci.

```ts
nabi.applyCommand('setFloatSide', { side: 'left' })
nabi.applyCommand('setFloatWidth', { w: 30 })
```

Liƙa rubutu, hotuna da tebur, sauya tubali da ɗora fayil suna kasancewa a cikin yankin. Goge teburin ciki yana cire wannan teburin kawai. Ba za a iya saka ko sauya tubalan ciki ba idan zaɓi ya haɗa ciki da wajen yankin lokaci guda.

Maɓallin **Warware yankin mai iyo** da ke gefen ƙimar faɗi yana maida abun ciki zuwa babban rubutu ba tare da gogewa ba. Ƙirƙira, sauya shimfiɗa da cire kewaye duk suna goyon bayan soke aiki da maimaita shi.

```ts
nabi.applyCommand('unwrapFloat')
```

## Yadda rubutu ke gudana a gefen yankin

Sakin layin da ke bi suna gudana a gefen yankin, sannan su koma dukan faɗin babban rubutu idan yankin ya ƙare. Taken sashe, tebur, tubalin lambar kwamfuta, layin raba ko sabon yanki mai iyo na gaba yana farawa a ƙarƙashin yankin da ya gabata.

Idan faɗin babban rubutu ya yi ƙasa da `36rem`, ana shirya yankin da rubutu a ginshiƙi guda. Bugawa ma yana amfani da ginshiƙi guda, tare da kiyaye gefen da iyakar faɗin da aka adana. Shafin kwatanta takardu yana kiyaye gefe da iyakar faɗin kowane yanki, amma yana nuna tubali na gaba dabam a ƙasansa don sauƙaƙa karanta canje-canje.

## Adanawa da lodawa

JSON yana adana `a.side` da `a.w` na kumburin `float` tare da tubalan cikinsa. HTML yana amfani da siffofin `data-nabi-float` da `data-nabi-float-width` a kan `div` cikin sakin layin abu na yau da kullum.

```html
<div data-nabi-p>
  <div data-nabi-float="right" data-nabi-float-width="40">
    <p>Bayani da za a sanya a gefen babban rubutu.</p>
  </div>
</div>
<p>Wannan sakin layi yana ci gaba a gefen yankin.</p>
```

Fitarwa zuwa Markdown yana kiyaye yankin a matsayin HTML. Ba a shigo da salon CSS `float` na son rai, don haka yi amfani da JSON ko HTML da NABI NOTE ya samar wajen adanawa da dawo da abun ciki. Haɗa fuka-fukai da CSS iri ɗaya a edita, SSR, samfoti da shafin da aka wallafa don kiyaye gefe da faɗi.

## Salon CSS

Za ka iya tsara launi da tazara cikin yankin ta mai zaɓe `[data-nabi-float]`. Sakin layin waje ne ke kula da shimfiɗa da iyakar faɗi, don haka kada ka maye gurbin `float`, `display` ko faɗi kai tsaye.

```css
.brand-note .nabi-content [data-nabi-float] {
  background: var(--nabi-soft);
  border-radius: var(--nabi-radius);
  padding: .75rem;
}
```
