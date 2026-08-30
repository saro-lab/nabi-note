---
title: Yapay zekâyla vibe coding
description: Kodlama ajanlarının güncel açık API'yi ve belge sınırlarını okuyarak NABI NOTE'u doğru kullanmasına yardım edin.
---

# Yapay zekâyla vibe coding

NABI NOTE'ta yapay zekâ ve otomasyon araçları için [`llms.txt`](/llms.txt) bulunur. Ajandan tüm kütüphaneyi
tahmin etmesini istemek yerine önce bu dizini okumasını, sonra yalnızca gerekli konu belgelerine gitmesini
sağlamak cevapları ve uygulamaları daha doğru yapar.

## Hemen kullanılabilecek istem

Aşağıdaki örnekte yalnızca kullandığınız framework'ü ve gereken özellikleri doldurun.

```text
NABI NOTE (nabi-note) ile bir düzenleyici oluşturun.
Önce https://nabi.saro.me/llms.txt dosyasını okuyun, ardından yalnızca bu iş için gerekli belgeleri okuyun.

Ortam: Vue 3 + TypeScript
Gerekli özellikler: temel biçimlendirme, tablolar, görseller ve yükleme
Kaydedilen kaynak: NABI TREE JSON
Yayınlama: kaydedilen JSON'u sunucuda HTML'ye dönüştürme

Yalnızca açık export'larda ve kurulu türlerde gerçekten bulunan API'leri kullanın.
Uygulamadan sonra tür denetimini ve build'i çalıştırın; değişen dosyaları ve doğrulama sonuçlarını bildirin.
```

URL'leri okuyamayan bir ajansa `llms.txt` içeriğini ve bu işte gereken alt belgeleri konuşmaya ekleyin.

## Yalnızca gerekli belgeleri seçtirin

`llms.txt` kısa bir yönlendirme dizinidir. Başlangıçta tüm belgeleri vermek yerine işe uygun belgeleri
belirtmek daha iyidir.

- Düzenleyici npm ile kuruluyorsa [`quickstart-npm.md`](https://nabi.saro.me/llms/quickstart-npm.md) okutun.
- CDN örnekleri için [`quickstart-cdn.md`](https://nabi.saro.me/llms/quickstart-cdn.md) kullanın.
- Kanat seçimi ve bileşimi için [`wings.md`](https://nabi.saro.me/llms/wings.md) belgesine bakın.
- Kaydedilen JSON, HTML ve değişiklik bildirimleri için [`document-model.md`](https://nabi.saro.me/llms/document-model.md) belgesine bakın.
- HTML içe aktarma, yapıştırma ve yükleme sınırları için [`io-security.md`](https://nabi.saro.me/llms/io-security.md) belgesine bakın.
- Yeni kanatlar için [`custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md), sunucu oluşturması için [`ssr.md`](https://nabi.saro.me/llms/ssr.md) kullanın.
- Viewer ve diff için [`viewer-diff.md`](https://nabi.saro.me/llms/viewer-diff.md), stiller ve büyük baş harf için [`styling.md`](https://nabi.saro.me/llms/styling.md) belgesine bakın.
- Kesin import'lar ve türler için [`api-reference.md`](https://nabi.saro.me/llms/api-reference.md) belgesinden yararlanın.

## Gereksinimleri birlikte iletin

Ajan yalnızca düzenleme ekranından saklama biçimini veya güvenlik politikasını bilemez. Gerçek framework'ü,
gerekli kanatları ve hariç tutulan özellikleri, JSON ve HTML saklama kapsamını, yükleme sunucusunun istek/yanıt
biçimini ve dosya sınırlarını, yayın ekranında SSR, viewer veya diff gerekip gerekmediğini birlikte söyleyin.

Henüz karar vermediğiniz şeyler varsa keyfi bir seçimle uygulama yapmamasını; önce seçenekleri ve etkilerini
açıklayıp soru sormasını istemek daha iyidir.

## Sonucu inceleme ölçütleri

Üretilen kodu her kod gibi gözden geçirmelisiniz. Özellikle şunları doğrudan denetleyin.

- Düzenleme ve yayın ekranlarında `nabi-note/nabi.css` yüklendi mi?
- Seçilen kanatlar ile tüm mount'lar aynı `registry`yi kullanıyor mu?
- Kaydedilen kaynak `getJson()` mı; `getEditorHtml()` saklanmıyor mu?
- Düzenlenmekte olan `.nabi-content` öğesinin `innerHTML`i doğrudan değiştirilmiyor mu?
- Ekran kapatılırken oluşturulan mount'lar `unmount()` ediliyor mu?
- Yükleme sunucusu MIME türünü, boyutu, yetkiyi ve saklama konumunu denetliyor mu?
- SSR ve tarayıcı aynı kanat sırasını ve HTML'yle ilgili seçenekleri kullanıyor mu?
- Tür denetimi, test ve build ile gerçek export adları denetlenmiş mi?

Özellikle IME, imleç ve saklama biçiminin güvenli olduğunu yalnızca ekranın bir kez düzgün görünmesine bakarak
anlamak zordur. Mobil birleşik giriş ile kaydetme ve yeniden yüklemeyi gerçekten deneyin.

## Kurulu sürümü önceleyin

Projede `nabi-note` zaten kuruluysa, web belgelerinden çok kurulu paketin `package.json` export'ları ve tür
bildirimleri mevcut kod için daha doğrudan ölçüttür. Belgeler ile kurulu sürüm farklı olabilir; ajandan önce
bu farkı denetlemesini isteyin.
