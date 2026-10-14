---
title: Tebur
description: Saka sakin layi da tubalan da yawa cikin ƙwayoyin tebur, sannan gyara bango, haɗawa da daidaitawa.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Tebur

Zaɓi layuka da ginshiƙai daga sandar kayan aiki don ƙirƙirar tebur. Ƙwayoyin tebur na iya ɗaukar sakin layi da yawa, hotuna, jerin abubuwa, ambato, lambar kwamfuta, sassan da ake naɗewa da bidiyo. Sanya siginan a cikin ƙwaya don gyara layuka, ginshiƙai, haɗawa, ƙwayoyin kan tebur da launin bango ta kayan saitunan da ke ƙasa.

Gwada gyara sakin layi da jerin abubuwan cikin ƙwayoyin misalin da ke ƙasa, sannan ja a kan ƙwayoyi da yawa don sauya bangonsu tare. Danna **Zaɓi tebur** a kayan saitunan don daidaita tebur ɗin kansa daga babban sandar kayan aiki.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

Ka kuma yi rajistar fuka-fukan da za ka yi amfani da su cikin ƙwayoyin. Don edita mai amfani da dukkan fuka-fukan asali, haɗa shi da `wings().allBasic()`.

## Rubutu cikin ƙwayoyin tebur

| Shigarwa | Abin da yake yi |
| --- | --- |
| Enter a sakin layi na yau da kullum | Yana ƙirƙirar sabon sakin layi cikin ƙwayar da ake ciki. |
| Shift+Enter | Yana fara sabon layi a cikin sakin layi ko abin jerin da ake ciki. |
| Tab / Shift+Tab a sakin layi na yau da kullum | Yana matsawa zuwa ƙwaya ta gaba / ta baya. |
| Tab / Shift+Tab a jeri ko lambar kwamfuta | Yana amfani da ƙara / rage ja-da-baya na wannan tubali. |

Enter a jeri da lambar kwamfuta yana bin dokokin shigarwa na kowane tubali. Ko da ba za a iya ƙara rage ja-da-bayan lambar ba, Shift+Tab ba ya komawa ƙwayar da ta gabata. Backspace ko Delete a farko ko ƙarshen ƙwaya ba ya haɗa ta da ƙwayar maƙwabta ko sakin layi a wajen tebur.

Liƙawa da saka hotuna ko tubalan suna kasancewa a cikin ƙwayar da aka fara aikin. Ba za a iya saka tubali ko liƙa ba idan zaɓin ya ketare iyakokin ƙwayoyi. Ba za a iya cusa tebur ko [yanki mai iyo](./float) a cikin ƙwaya ba; idan an shigo da irin wannan tsari ko aka liƙa shi, ana warware abin da ke cikinsa bisa jeri.

Ƙwayoyi na yau da kullum na iya ɗaukar taken sashe, amma ba a sanya tsarin taken sashe a ƙwayoyin kan tebur. Sauya ƙwaya zuwa ƙwayar kan tebur yana maida taken da ke cikinta zuwa sakin layi na yau da kullum, tare da kiyaye rubutu da sauran tsarinsa.

## Launin bangon ƙwayoyi

Launin bango yana shafar ƙwaya guda ko yankin murabba'i mai kusurwa huɗu da aka zaɓa ta jan linzami. Ko da an zaɓi wani ɓangaren rubutu kawai, bangon dukan ƙwayar da ke ɗauke da shi yana sauyawa. Launuka masu laushi suna dacewa da yanayin haske da na duhu. Idan ƙwayoyin da aka zaɓa suna da launuka dabam, ba a nuna wani launi guda a matsayin wanda aka zaɓa ba.

Haka kuma za ka iya sauya launi da umarni tare da kiyaye zaɓin ƙwayoyin da ake da shi.

```ts
nabi.applyCommand('setCellColor', { bg: 'cyan' })
```

Ƙimomin da aka amince da su su ne `yellow`, `green`, `cyan`, `pink`, `purple` da `orange`. Don dawo da bangon tsoho, zaɓi **Tsoho** a kayan saitunan ko ka aika da kirtani marar komai.

```ts
nabi.applyCommand('setCellColor', { bg: '' })
```

Goge abun ciki, yanke da cire tsarin rubutu ba sa cire launin bangon ƙwaya. Haɗawa yana amfani da launin ƙwayar sama ta hagu; rarrabawa yana ba sababbin ƙwayoyi wannan launin. Sababbin layuka da ginshiƙai suna farawa da bangon tsoho. Sauya launin bango yana goyon bayan soke aiki da maimaita shi.

## Daidaita abun cikin ƙwaya da tebur

Idan siginan yana cikin ƙwaya, daidaitawa yana shafar sakin layi ko hotunan da ke cikinta. Idan an zaɓi ƙwayoyi da yawa, yana shafar duk sakin layi da abubuwan da za a iya daidaitawa a cikinsu tare, ban da lambar kwamfuta. Halin kayan taken sashe, daidaitawa da babban harafin farko yana bin sakin layin cikin da aka zaɓa a zahiri. Idan ƙimomin sakin layin da aka zaɓa sun bambanta, ba a nuna su a matsayin ƙima guda ba.

Don daidaita tebur ɗin kansa, danna **Zaɓi tebur** a kayan saitunan sannan ka yi amfani da maɓallan daidaitawa na babban sandar kayan aiki. Haka nan ana iya yin wannan daidaitawa idan siginan yana gaban ko bayan sakin layin da ya kewaye tebur kuma an ga iyaka mai tsinke-tsinken layi. Wannan iyaka tana nuna abin da aikin zai shafa kawai; ba ta sauya siginan zuwa zaɓin dukan tebur ba.

```ts
nabi.applyCommand('selectTable')
nabi.applyCommand('setAlign', { value: 'c' })
```

Ƙara ko goge layuka da ginshiƙai, haɗawa da rarrabawa suna aiki ne bisa ƙwayoyin da aka zaɓa. Haɗawa yana kiyaye tubalan kowace ƙwaya bisa tsarin layuka. Rarrabawa yana barin abun ciki a ƙwayar asali, sauran ƙwayoyi kuma su zama babu komai.

## Kwafi da adanawa

Kwafin ƙwayoyi da yawa da aka zaɓa yana kwafin yankin murabba'i mai kusurwa huɗu da ake gani har zuwa ƙwayar ƙarshe. HTML da tsarin allo na kwafi na ciki suna kiyaye ƙwayoyi marasa komai, haɗawa, tubalan, tsarin rubutu da launukan bango. Rubutu tsantsa yana raba ƙwayoyi da tab da sabon layi, yana kiyaye sabbin layuka tsakanin tubalan cikin ƙwaya da adiresoshin hotuna da bidiyo. Yanke yana cire abun cikin ƙwayoyin da aka zaɓa kawai, kuma za a iya dawo da shi da soke aiki sau ɗaya.

Idan siginan yana gaban ko bayan tebur kuma iyaka mai tsinke-tsinken layi ta bayyana, kwafi da yanke suna shafar dukan sakin layin da ya kewaye tebur. Yanke yana cire sakin layin da tebur tare bayan an yi nasarar rubutawa a allon kwafi. Yanke ko goge tebur a cikin yanki mai iyo yana barin yankin mai iyo na waje.

Adanawa a JSON ko HTML yana kiyaye tubalan ƙwayoyi da launukan bangonsu. Ana fitar da tebur mai sauƙi a matsayin teburin Markdown; tebur mai tubalan da yawa ko launin bango yana kasancewa HTML don kiyaye abun cikinsa. A HTML, ana adana sunan launin ƙwaya a siffar `data-nabi-cell-color` ta `td` ko `th`. Ba a shigo da salon launin bango na son rai daga HTML na waje a matsayin launin bangon ƙwaya ba.

Don amfani da jera ginshiƙai a shafin da aka wallafa, adana tebur a matsayin mai iya jerawa sannan ka haɗa `attachViewer()` daga `nabi-note/viewer`. Teburin da ke da haɗaɗɗun ƙwayoyi ba ya cikin waɗanda ake jera ginshiƙansu.

## Salon CSS

Yi wa tebur salo da `.nabi-content table`, ƙwayoyi kuma da `.nabi-content :is(th, td)`. Sanya ratsi da bangon kan tebur ga ƙwayoyin da ba su da launi kawai don kada su maye gurbin launin bangon da aka saita.

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { font-weight: 700; }
.article-body th:not([data-nabi-cell-color]) { background: var(--nabi-soft); }
.article-body tr:nth-child(even) td:not([data-nabi-cell-color]) {
  background: color-mix(in srgb, var(--nabi-soft) 45%, transparent);
}
```

Ana sauya launukan bangon ƙwayoyi da kansu ta masu canjin CSS masu sunan launi, kamar `--nabi-cell-yellow`. Loda CSS da ke ƙasa bayan CSS na kunshin, sannan ka sanya ajin `table-note` da ƙimar `data-nabi-theme` ta yanayin yanzu kai tsaye a kan `.nabi` na edita ko `.nabi-content` na shafin da aka wallafa.

```css
.table-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-cell-cyan: #e2f4f7;
}
.table-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

Idan an haɗa viewer, bar maɓallin `.nabi-sort`. Tilasta maye gurbin `position` ko padding na dama na ƙwaya na iya sa ta rufe maɓallin jerawa.
