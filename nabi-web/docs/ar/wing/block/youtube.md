---
title: YouTube
---

# YouTube

## الوصف

`youtubeWing` (المعرّف `youtube`، بلا اختصار) يملك تضمين YouTube (`<iframe>`).
وهو "كتلة بلا جوف" (`place: 'void'`) مثل `hr` و`img`. الضغط على الزر يفتح طبقة
إدخال عنوان، ولا يمر إلا عنوان YouTube بصيغة `watch?v=` أو `youtu.be/` أو
`/embed/` أو `/shorts/` أو `/v/` أو `/live/` (بما في ذلك البادئات `www.` و`m.`
و`music.` والنطاق `youtube-nocookie.com`) — والحكم يجري بتحليل `URL()` لا بفحص
احتواء النص، فعنوان مثل `youtube.com.evil.test` لا يمر.

ولا يُصدَّق العنوان الوارد كما هو، بل يُستخرج منه **معرّف الفيديو ذو الأحد عشر
حرفًا** فقط ويُحفَظ. لا يبقى العنوان في القيمة المحفوظة — كل ما يبقى هو
`{"w":"youtube","a":{"v":"<id>","w":"70"}}`، وعند الخروج يُعاد تركيبه دائمًا
على صورة واحدة هي `https://www.youtube-nocookie.com/embed/<id>`.

وللسبب نفسه الذي في `hr` لا يدخله المؤشر، وإن ضغطت Backspace أو Delete قبله
مباشرة أو بعده اختفى بأسره. والتضمين الذي ليس من YouTube **يُرفَض بأسره** عند
الاستيراد — لا يُقام مستند غريب داخل مستندنا.

## الشريط السياقي

النقر على الفيديو يُظهر حقلين.

| الفئة | الحقول |
|---|---|
| العرض | ست درجات `50`·`60`·`70`·`80`·`90`·`100` (الافتراضي `70`) — وهو مقياس تظهر معه القيمة الحالية |
| العنوان | لوحة إدخال معبَّأة بمعرّف الفيديو الحالي |

**لا توجد هنا خانات يسار ووسط ويمين.** موضع الفيديو لا يحمله الفيديو نفسه بل
**الفقرة الحاضنة له**، وزر المحاذاة في شريط الأدوات هو من يتولى ذلك. الفيديو
المُدرَج حديثًا تقف فقرته الحاضنة بمحاذاة `c` (وسط).

ولذلك عند الخروج يُلصَق العرض بالفيديو والمحاذاة بالفقرة التي تحتضنه.

```html
<div data-nabi-p data-nabi-align="c">
  <iframe src="https://www.youtube-nocookie.com/embed/<id>" title="YouTube"
          allowfullscreen loading="lazy" data-nabi-width="70"></iframe>
</div>
```

لا يخرج `style` سطري. من أراد إدراج فيديو من واجهته الخاصة ينادي الأمر مباشرة —
`applyCommand('insertYoutube', { v: العنوان, w: '80' })`، ولتغيير العرض وحده
`applyCommand('setYoutubeWidth', { w: '80' })`. أي عرض خارج القائمة يُرفَض.

## مثال الاستخدام

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, youtubeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// قائمة الأجنحة تبني معًا معرفة الأصناف والأوامر والمُجمِّع — وهذا هو `registry`
const { nabi, registry } = createNabiWith([youtubeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## عرض توضيحي

<WingDemo path="/wing/block/youtube" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
