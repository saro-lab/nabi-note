---
title: লিংক
description: নিরাপদ ওয়েব ঠিকানা যুক্ত করুন এবং আপলোড করা attachments দেখান।
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# লিংক

Pilih teks lalu lampirkan alamat padanya. Jika Anda memasukkan alamat tanpa memilih teks, alamat itu sendiri dimasukkan sebagai teks tautan. Mengetik alamat `http://` atau `https://` lalu menekan Space atau Enter juga mengubahnya menjadi tautan.

Tautan hanya menyimpan `http:`, `https:`, dan path situs yang sama yang diawali `.` atau `/`. Alamat yang asalnya tidak dapat dikenali jelas, seperti `javascript:` atau `//example.com`, ditolak. Tautan lampiran yang dibuat oleh upload juga menyimpan informasi file dan tidak dapat dibuat manual seperti tautan biasa.

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

## URL পেস্ট করা

শুরু ও শেষের ফাঁকা অক্ষর বাদ দেওয়ার পর পেস্ট করা পুরো বিষয়বস্তু যদি একটি বৈধ `http://` বা `https://` URL হয়, তবে তা সঙ্গে সঙ্গে লিংক হিসেবে ঢোকানো হয়। বাক্যের মধ্যে থাকা URL, একাধিক URL-সহ লেখা এবং আপেক্ষিক পাথ আগের পেস্টের নিয়মেই প্রক্রিয়া করা হয়। কোড ব্লক এবং লিংক wing নেই এমন এডিটরে বিষয়বস্তু টেক্সট হিসেবেই থাকে। মূল বিন্যাস ধরে রাখতে এডিটর থেকে কপি করা বৈধ অভ্যন্তরীণ ক্লিপবোর্ড ডেটাকে অগ্রাধিকার দেওয়া হয়।

লিংকের প্রদর্শিত লেখা নির্ধারণ করতে `mountSurface()`-এর `onPasteUrl` কলব্যাক ব্যবহার করুন।

| আর্গুমেন্ট | মান |
| --- | --- |
| `url` | শুরু ও শেষের ফাঁকা অক্ষর বাদ দেওয়া সম্পূর্ণ URL |
| `isSameOrigin` | URL-এর প্রোটোকল, হোস্ট ও পোর্ট এডিটর থাকা ডকুমেন্টের অরিজিনের সঙ্গে মেলে কি না |
| `path` | `/` দিয়ে শুরু হওয়া পাথ, কোয়েরি ও ফ্র্যাগমেন্টসহ। উদাহরণ: `/posts/1?a=2#top` |

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

ফেরত দেওয়া স্ট্রিংয়ে ফাঁকা অক্ষর ছাড়া অন্য অক্ষর থাকলে সেটিই প্রদর্শিত লেখা হয়। কলব্যাক না থাকলে, খালি বা স্ট্রিং নয় এমন মান ফেরত দিলে, অথবা ব্যর্থ হলে পেস্ট করা URL-ই প্রদর্শিত লেখা হিসেবে থাকে। ফেরত দেওয়া স্ট্রিং কখনো HTML হিসেবে ব্যাখ্যা করা হয় না এবং লিংকের ঠিকানা বদলায় না।

কলব্যাক `async` ফাংশন ও Promise-ও সমর্থন করে। উত্তরের অপেক্ষায় থাকার সময় URL লিংকটি সঙ্গে সঙ্গে ঢোকানো হয়; পরে বৈধ ফল এলে শুধু সেই লিংকের প্রদর্শিত লেখা বদলায়। এর মধ্যে লিংক সম্পাদনা বা মুছে ফেলা হলে, নতুন ডকুমেন্ট লোড হলে, অথবা surface আনমাউন্ট করা হলে দেরিতে আসা ফল উপেক্ষা করা হয়।

## CSS স্টাইল

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
