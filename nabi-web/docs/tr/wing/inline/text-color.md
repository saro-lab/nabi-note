---
title: Metin Rengi
description: Seçili metne izin verilen bir renk adı uygulayın.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Metin Rengi

Seçili metne izin verilen bir renk adı uygulayın. Kaydedilen değer bir CSS renk dizesi değildir; izin verilen bir addır ve gerçek renk `--nabi-tc-<name>` CSS değişkeniyle tanımlanır. Böylece aynı belge hem açık hem koyu temalarda okunabilir kalır.

<WingDemo path="/wing/inline/text-color" />

```ts
const selected = wings().use('tc', {
  values: ['green', 'coral', 'blue'],
}).build()
```

`values` atlanırsa varsayılan palet `green`, `coral`, `violet`, `amber` ve `blue` olur. Listeyi azaltırsanız diğer renkler komutlar ve belge yükleme sırasında reddedilir.

## CSS Styles

Belge yalnızca renk adlarını saklar. Editör ve yayımlanmış görünüm için gerçek renkleri CSS değişkenleriyle ayarlayın.

```css
.nabi-content { --nabi-tc-blue: #2563eb; }
```

Kontrastı arka plan rengiyle birlikte kontrol edin. Koyu temada aynı renk adı farklı bir değer alabilir.

```css
.dark .article-body {
  --nabi-tc-blue: #93c5fd;
  --nabi-tc-green: #86efac;
}
```
