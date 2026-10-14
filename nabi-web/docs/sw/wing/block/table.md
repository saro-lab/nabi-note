---
title: Jedwali
description: Weka aya na bloku nyingi katika seli, kisha hariri mandharinyuma, uunganishaji na mpangilio.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Jedwali

Chagua safu mlalo na safu wima kwenye upau wa zana ili kuunda jedwali. Seli zinaweza kuwa na aya nyingi, picha, orodha, nukuu, msimbo, sehemu zinazokunjwa na video. Weka kishale ndani ya seli ili kuhariri safu mlalo, safu wima, uunganishaji, seli za kichwa na rangi za mandharinyuma kwa zana za sifa zilizo chini.

Jaribu kuhariri aya na orodha katika seli za mfano ulio hapa chini, kisha buruta kuchagua seli kadhaa ili kubadilisha mandharinyuma yao pamoja. Bofya **Chagua jedwali** katika zana za sifa ili kupanga jedwali lenyewe kwa upau mkuu wa zana.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

Sajili pia mabawa utakayotumia ndani ya seli. Kwa kihariri kinachotumia mabawa yote ya msingi, kiunganishe kwa `wings().allBasic()`.

## Kuandika ndani ya seli

| Ingizo | Kinachotokea |
| --- | --- |
| Enter katika aya ya kawaida | Huunda aya mpya katika seli hiyo hiyo. |
| Shift+Enter | Huanzisha mstari mpya ndani ya aya au kipengele cha orodha cha sasa. |
| Tab / Shift+Tab katika aya ya kawaida | Huenda kwenye seli inayofuata / iliyotangulia. |
| Tab / Shift+Tab katika orodha au msimbo | Hutumia kuongeza / kupunguza ujongezaji wa bloku hiyo. |

Enter katika orodha na msimbo hufuata kanuni za uingizaji za kila bloku. Hata kama ujongezaji wa msimbo hauwezi kupunguzwa zaidi, Shift+Tab haiendi kwenye seli iliyotangulia. Backspace au Delete mwanzoni au mwishoni mwa seli haiiunganishi na seli jirani au aya iliyo nje ya jedwali.

Kubandika na kuingiza picha au bloku hubaki katika seli ambamo kitendo kilianza. Kuingiza bloku na kubandika hakupatikani kwa uteuzi unaovuka mipaka ya seli. Jedwali na [maeneo yanayoelea](./float) hayawezi kupachikwa ndani ya seli; miundo hiyo inapoingizwa au kubandikwa, maudhui yake hutolewa kwa mpangilio wake.

Seli za kawaida zinaweza kuwa na vichwa vya sehemu, lakini umbizo la kichwa halitumiki katika seli za kichwa cha jedwali. Kubadilisha seli kuwa ya kichwa hugeuza vichwa vilivyomo kuwa aya za kawaida, huku maandishi na miundo mingine ikihifadhiwa.

## Rangi za mandharinyuma ya seli

Rangi ya mandharinyuma hutumika kwa seli moja au eneo la mstatili lililochaguliwa kwa kuburuta. Hata ukichagua sehemu tu ya maandishi, mandharinyuma ya seli nzima yenye maandishi hayo hubadilika. Rangi hafifu hubadilika kulingana na mandhari angavu na nyeusi. Seli zilizochaguliwa zikiwa na rangi tofauti, hakuna rangi moja inayoonyeshwa kuwa imechaguliwa.

Unaweza pia kubadilisha rangi kwa amri huku ukihifadhi uteuzi wa sasa wa seli.

```ts
nabi.applyCommand('setCellColor', { bg: 'cyan' })
```

Thamani zinazoruhusiwa ni `yellow`, `green`, `cyan`, `pink`, `purple` na `orange`. Ili kurudisha mandharinyuma chaguomsingi, chagua **Chaguomsingi** kwenye zana za sifa au pitisha mfuatano tupu wa maandishi.

```ts
nabi.applyCommand('setCellColor', { bg: '' })
```

Kufuta maudhui, kukata na kuondoa umbizo hakuondoi rangi za mandharinyuma. Kuunganisha hutumia rangi ya seli ya juu kushoto; kugawanya huzipa seli mpya rangi hiyo hiyo. Safu mlalo na safu wima mpya huanza na mandharinyuma chaguomsingi. Mabadiliko ya rangi za mandharinyuma yanaweza kutenduliwa na kufanywa upya.

## Kupanga maudhui ya seli na jedwali

Kishale kikiwa ndani ya seli, mpangilio hutumika kwa aya au picha zilizomo. Ukichagua seli kadhaa, hutumika pamoja kwa aya na vitu vyote vinavyoweza kupangwa ndani yake, isipokuwa msimbo. Hali ya zana za vichwa, mpangilio na herufi kubwa ya mwanzo pia hufuata aya za ndani zilizochaguliwa hasa. Thamani zikiwa tofauti katika aya zilizochaguliwa, hazionyeshwi kama thamani moja.

Ili kupanga jedwali lenyewe, bofya **Chagua jedwali** kwenye zana za sifa, kisha utumie vitufe vya mpangilio kwenye upau mkuu wa zana. Mpangilio huo pia hupatikana kishale kikiwa kabla au baada ya aya inayofunika jedwali na mpaka wa mistari iliyokatika unapoonekana. Mpaka huo huonyesha lengo tu; haubadilishi kishale kuwa uteuzi wa jedwali lote.

```ts
nabi.applyCommand('selectTable')
nabi.applyCommand('setAlign', { value: 'c' })
```

Kuongeza au kufuta safu mlalo na safu wima, kuunganisha na kugawanya hufanya kazi kwa kuzingatia seli zilizochaguliwa. Kuunganisha huhifadhi bloku za kila seli kwa mpangilio wa safu mlalo. Kugawanya huacha maudhui katika seli ya awali na seli nyingine zikiwa tupu.

## Kunakili na kuhifadhi

Kunakili seli kadhaa zilizochaguliwa kunakili eneo la mstatili linaloonekana hadi seli ya mwisho ikiwemo. HTML na umbizo la ndani la ubao wa kunakili huhifadhi seli tupu, miunganiko, bloku, umbizo la maandishi na rangi za mandharinyuma. Maandishi ya kawaida hutenganisha seli kwa tabo na mistari mipya, huku yakihifadhi mistari mipya kati ya bloku ndani ya seli na anwani za picha na video. Kukata huondoa maudhui ya seli zilizochaguliwa pekee, na kunaweza kutenduliwa kwa hatua moja.

Kishale kikiwa kabla au baada ya jedwali na mpaka wa mistari iliyokatika ukionekana, kunakili na kukata hutumika kwa aya nzima inayofunika jedwali. Kukata huondoa aya na jedwali baada ya kuandika kwenye ubao wa kunakili kufanikiwa. Kukata au kufuta jedwali ndani ya eneo linaloelea huacha eneo linaloelea la nje.

Kuhifadhi kwa JSON au HTML huhifadhi bloku na rangi za mandharinyuma ya seli. Majedwali rahisi hutolewa kama majedwali ya Markdown; yenye bloku nyingi au rangi za mandharinyuma hubaki katika HTML ili kuhifadhi maudhui. Katika HTML, jina la rangi ya seli huhifadhiwa kwenye sifa ya `data-nabi-cell-color` ya `td` au `th`. Mitindo yoyote ya rangi ya mandharinyuma kutoka HTML ya nje haiingizwi kama rangi za mandharinyuma ya seli.

Ili kupanga kwa safu wima katika mwonekano uliochapishwa, hifadhi jedwali likiwa linaweza kupangwa na uunganishe `attachViewer()` kutoka `nabi-note/viewer`. Majedwali yenye seli zilizounganishwa hayahusishwi katika upangaji kwa safu wima.

## Mitindo ya CSS

Pamba majedwali kwa `.nabi-content table` na seli kwa `.nabi-content :is(th, td)`. Tumia mistari ya rangi zinazopishana na mandharinyuma ya vichwa kwenye seli zisizo na rangi pekee, ili zisibadilishe rangi zilizowekwa.

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { font-weight: 700; }
.article-body th:not([data-nabi-cell-color]) { background: var(--nabi-soft); }
.article-body tr:nth-child(even) td:not([data-nabi-cell-color]) {
  background: color-mix(in srgb, var(--nabi-soft) 45%, transparent);
}
```

Badilisha rangi za mandharinyuma zenyewe kupitia vigezo vya CSS vyenye jina la rangi, kama `--nabi-cell-yellow`. Pakia CSS ifuatayo baada ya CSS ya kifurushi, kisha weka darasa `table-note` na thamani ya `data-nabi-theme` ya mandhari ya sasa moja kwa moja kwenye kipengele `.nabi` cha kihariri au `.nabi-content` cha mwonekano uliochapishwa.

```css
.table-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-cell-cyan: #e2f4f7;
}
.table-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

Ikiwa viewer imeunganishwa, hifadhi kitufe `.nabi-sort`. Kubadilisha kwa lazima `position` au padding ya kulia ya seli kunaweza kusababisha mwingiliano na kitufe cha kupanga.
