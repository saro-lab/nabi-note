---
title: حرف استهلالي
description: يبدأ الفقرة بحرف أول كبير يلتف النص حوله.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# حرف استهلالي

يكبّر الحرف الأول من الفقرة ويجعل بقية الأسطر تلتف بجانبه. وهو تنسيق على مستوى الفقرة، لذلك لا يُطبّق على جزء من النص المحدد فقط.

تحافظ شاشة النشر والتحرير على الشكل نفسه. أثناء التحرير يُغلّف الحرف الأول بعنصر فعلي حتى لا يختل موضع المؤشر والحذف، ولا يدخل هذا العنصر في محتوى المستند المحفوظ.

<WingDemo path="/wing/etc/dropcap" />

```ts
const selected = wings().use('dc').build()
```

## أنماط CSS

تختلف شاشة النشر والتحرير في محدد الحرف الأول فقط. تستخدم شاشة النشر `[data-nabi-dropcap="1"]::first-letter`، ويستخدم المحرر العنصر الفعلي `[data-nabi-dropcap-letter]`. عند تغيير اللون أو الخط أو الحجم، اكتب المحددين معًا حتى يتطابق الشكل أثناء التحرير وبعد النشر.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  color: var(--nabi-accent);
  font-family: var(--nabi-font-serif);
}
```

إذا غيّرت الحجم وارتفاع السطر، فطبّق القيم نفسها على المحددين.

```css
.article-body:not(.nabi-editing) [data-nabi-dropcap="1"]::first-letter,
.nabi-content.nabi-editing [data-nabi-dropcap-letter] {
  font-size: 5.5em;
  line-height: .85;
}
```

يحسب الحرف الاستهلالي تدفق السطور حول الحرف الأول، لذلك قد يؤدي تغيير أحد الجانبين وحده أو تكبير القيمة بإفراط إلى كسر WYSIWYG. تجنّب إضافة `::first-letter` جديد داخل المحرر؛ ونسّق `[data-nabi-dropcap-letter]` الموجود بالفعل.
