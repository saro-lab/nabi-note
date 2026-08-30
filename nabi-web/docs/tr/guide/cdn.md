---
title: CDN kullanımı
description: Derleme aracı olmadan tarayıcı için NABI NOTE bağlama örneği.
---

<script setup>
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
</script>

# CDN kullanımı

Paketi yüklemenin zor olduğu statik sayfalarda NABI NOTE tarayıcı paketini ve CSS'sini CDN üzerinden yükleyebilirsiniz. Aşağıdaki örnek, derleme sırasında paket sürümünü otomatik olarak okuyup adresleri oluşturur ve düzenleyiciyi genel `NabiNote` nesnesiyle kurar.

<CdnDemo />

## NABI NOTE'ta dikkat edilmesi gerekenler

- Dağıtım kodunda CSS ve tarayıcı JavaScript'i için aynı sabit sürümü kullanın. `latest` gibi sürümü olmayan bir adres, yeni sürüm çıktığı gün davranışı değiştirebilir.
- Tarayıcı paketi kök API'yi `window.NabiNote` olarak sunar. `nabi-note/ssr`, `nabi-note/viewer` ve `nabi-note/diff` için ayrı genel paketler yoktur.
- Örnekteki dosya kaydetme ve yerel geçmiş kullanıcının tarayıcısında çalışır. Sunucuya kaydetme veya hesap eşitleme gerekiyorsa `getJson()` sonucunu uygulama API'sine gönderin.
- Yükleme eklerken yalnızca `upload` wing'ini değil, gerçek gönderme işlevini ve gereken görsel ya da bağlantı wings'lerini de bağlayın. Dosya doğrulamasından yükleme sunucusu sorumludur.
- Tarayıcı paketi HTML parser'ını içinde barındırır. Bu nedenle `setHtml()`, HTML dosyası açma ve HTML yapıştırma için ayrı bir parser seçeneği veya özel API gerekmez.

CDN yalnızca yükleme biçiminde farklıdır. Kaydetme biçimi ve girdi doğrulaması npm ile kurulumdakiyle aynıdır; bu nedenle [temel kullanımı](/tr/guide/getting-started) da inceleyin.
