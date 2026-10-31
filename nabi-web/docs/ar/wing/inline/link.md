---
title: رابط
description: اربط عناوين ويب آمنة واعرض المرفقات المرفوعة.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# رابط

Pilih teks lalu lampirkan alamat padanya. Jika Anda memasukkan alamat tanpa memilih teks, alamat itu sendiri dimasukkan sebagai teks tautan. Mengetik alamat `http://` atau `https://` lalu menekan Space atau Enter juga mengubahnya menjadi tautan.

Tautan hanya menyimpan `http:`, `https:`, dan path situs yang sama yang diawali `.` atau `/`. Alamat yang asalnya tidak dapat dikenali jelas, seperti `javascript:` atau `//example.com`, ditolak. Tautan lampiran yang dibuat oleh upload juga menyimpan informasi file dan tidak dapat dibuat manual seperti tautan biasa.

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

## لصق عناوين URL

إذا كان المحتوى الملصق بالكامل، بعد إزالة المسافات البيضاء من بدايته ونهايته، عنوان URL صالحًا يبدأ بـ `http://` أو `https://`، فسيُدرج فورًا كرابط. تُعالَج عناوين URL داخل الجمل والنصوص التي تحتوي على عدة عناوين URL والمسارات النسبية وفق سلوك اللصق المعتاد. يبقى المحتوى نصًا في كتل التعليمات البرمجية والمحررات التي لا تحتوي على wing الروابط. تُعطى الأولوية لبيانات الحافظة الداخلية الصالحة المنسوخة من المحرر للحفاظ على تنسيقها الأصلي.

استخدم دالة الاستدعاء `onPasteUrl` في `mountSurface()` لتحديد النص المعروض للرابط.

| الوسيط | القيمة |
| --- | --- |
| `url` | عنوان URL كاملًا بعد إزالة المسافات البيضاء من بدايته ونهايته |
| `isSameOrigin` | ما إذا كان بروتوكول عنوان URL ومضيفه ومنفذه يطابقون أصل المستند الذي يحتوي على المحرر |
| `path` | المسار الذي يبدأ بـ `/`، بما في ذلك الاستعلام والجزء المحدد بعد علامة التجزئة. مثال: `/posts/1?a=2#top` |

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

إذا أُرجعت سلسلة نصية تحتوي على محارف غير المسافات البيضاء، فستُستخدم كنص معروض. إذا لم توجد دالة الاستدعاء، أو أعادت قيمة فارغة أو قيمة ليست سلسلة نصية، أو فشلت، فسيبقى عنوان URL الملصق هو النص المعروض. لا تُفسَّر السلاسل النصية المُعادة على أنها HTML مطلقًا، ولا تغيّر عنوان الرابط.

تدعم دالة الاستدعاء أيضًا دوال `async` وكائنات Promise. يُدرج رابط URL فورًا أثناء انتظار الرد؛ وإذا وصلت نتيجة صالحة لاحقًا، فإنها تغيّر النص المعروض لذلك الرابط فقط. تُتجاهل النتيجة المتأخرة إذا عُدّل الرابط أو حُذف، أو حُمّل مستند جديد، أو أُزيل تركيب سطح التحرير.

## أنماط CSS

Beri gaya tautan biasa dengan `.nabi-content a`, dan tautan lampiran secara terpisah dengan `.nabi-content a[data-nabi-file]`.

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

Bagian `::before` dan `::after` pada tautan lampiran dipakai untuk menampilkan ikon dan ekstensi file, jadi biasanya sebaiknya jangan mengganti atau menghapus `content`-nya.
