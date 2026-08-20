---
title: YouTube
---

# YouTube

## تفصیل

`youtubeWing` (نام `youtube`، کوئی شارٹ کٹ نہیں) یوٹیوب embed (`<iframe>`) کی
مالک ہے۔ یہ `hr`·`img` جیسا **بغیر اندرونی مواد کا جسم** (`place: 'void'`) ہے۔
بٹن دبانے سے پتہ درج کرنے کا panel کھلتا ہے، اور صرف `watch?v=`·`youtu.be/`·
`/embed/`·`/shorts/`·`/v/`·`/live/` شکل کا یوٹیوب پتہ گزرتا ہے (`www.`·`m.`·
`music.` prefix اور `youtube-nocookie.com` بھی شامل) — یہ فیصلہ سٹرنگ میں لفظ
ملنے سے نہیں بلکہ `URL()` parsing سے ہوتا ہے، اس لیے `youtube.com.evil.test`
جیسا پتہ نہیں پکڑا جاتا۔

آیا ہوا پتہ جوں کا توں نہیں مانا جاتا، صرف **گیارہ حرفی video id** نکال کر
محفوظ کیا جاتا ہے۔ پتہ محفوظ قدر میں نہیں رہتا — صرف
`{"w":"youtube","a":{"v":"<id>","w":"70"}}` رہتا ہے، اور باہر جاتے وقت ہمیشہ
`https://www.youtube-nocookie.com/embed/<id>` کی شکل میں نئے سرے سے جوڑا جاتا
ہے۔

`hr` جیسی وجہ سے کیریٹ اندر نہیں جاتا، اور بالکل آگے/پیچھے Backspace·Delete
دبانے سے پورا غائب ہو جاتا ہے۔ غیر-یوٹیوب embed اندر لاتے وقت **پورا پھینک
دیا جاتا ہے** — نامعلوم دستاویز کو اپنی دستاویز کے اندر کھڑا نہیں کیا جاتا۔

## سیاق سطر

ویڈیو پر کلک کریں تو دو خانے نکلتے ہیں۔

| قسم | خانے |
|---|---|
| چوڑائی | `50` `60` `70` `80` `90` `100` چھ درجے (default `70`) — یہ ایک نشان ہے، ابھی کی قدر ساتھ نظر آتی ہے |
| پتہ | ابھی کے ویڈیو کا id بھرا ہوا ان پٹ panel |

**بائیں، درمیان، دائیں کے خانے یہاں نہیں ہیں۔** ویڈیو کی جگہ خود ویڈیو نہیں
بلکہ **اسے تھامنے والا wrapper پیراگراف** رکھتا ہے، اس لیے یہ کام ٹول بار کا
سیدھ کا بٹن کرتا ہے۔ نئی ڈالی گئی ویڈیو کا wrapper پیراگراف درمیان کی سیدھ
(`c`) پہن کر کھڑا ہوتا ہے۔

اس لیے باہر جاتے وقت چوڑائی ویڈیو پر اور سیدھ اسے لپیٹنے والے پیراگراف پر
لگتی ہے۔

```html
<div data-nabi-p data-nabi-align="c">
  <iframe src="https://www.youtube-nocookie.com/embed/<id>" title="YouTube"
          allowfullscreen loading="lazy" data-nabi-width="70"></iframe>
</div>
```

inline `style` باہر نہیں جاتا۔ میزبان اپنے UI سے ڈالنا چاہے تو سیدھا command
بلائے — `applyCommand('insertYoutube', { v: پتہ, w: '80' })`، صرف چوڑائی بدلنی
ہو تو `applyCommand('setYoutubeWidth', { w: '80' })`۔ فہرست سے باہر کی چوڑائی
مسترد ہو جاتی ہے۔

## استعمال کی مثال

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, youtubeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// wing کی فہرست ایک ساتھ اصناف کی معرفت، command اور جوڑنے والا بناتی ہے — یہی `registry` ہے
const { nabi, registry } = createNabiWith([youtubeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## ڈیمو

<WingDemo path="/wing/block/youtube" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
