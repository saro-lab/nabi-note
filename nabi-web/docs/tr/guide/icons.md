---
title: "Simge temaları"
description: "CSS değişkenleriyle wing, önizleme, tam ekran, panel, karşılaştırma ve tablo sıralama simgelerini değiştirin. SVG, WebP ve PNG birlikte kullanılabilir; belirtilmeyen simgeler varsayılan dosyaları kullanır."
---

# Simge temaları

CSS değişkenleriyle wing, önizleme, tam ekran, panel, karşılaştırma ve tablo sıralama simgelerini değiştirin. SVG, WebP ve PNG birlikte kullanılabilir; belirtilmeyen simgeler varsayılan dosyaları kullanır.

## Dosya seçimi

CSS dosyasını yükleyip düzenleyiciye veya ortak üst öğeye tema sınıfı ekleyin. Resimlerin özgün renkleri, saydamlığı ve en boy oranı korunur.

```ts
import 'nabi-note/nabi.css'
```

```html
<div class="nabi paper-note">...</div>
```

```css
.paper-note {
  --nabi-icon-toolbar-b: url("/icons/bold.svg");
  --nabi-icon-view-preview: url("/icons/preview.webp");
  --nabi-icon-view-fullscreen-enter: url("/icons/expand.svg");
  --nabi-icon-view-fullscreen-exit: url("/icons/shrink.webp");
  --nabi-icon-panel-preview-close: url("/icons/close.svg");
}
.paper-note[data-nabi-theme="dark"] {
  --nabi-icon-view-preview: url("/icons/preview-dark.webp");
}
```

`/icons/...` gibi kökten başlayan yollar veya tam HTTPS URL’leri kullanın. Göreli yolların tema dosyasının yanından çözüleceği garanti edilmez. CSS’yi kendiniz barındırıyorsanız aynı sürümdeki `dist/icons/` klasörünü `nabi.css` yanına kopyalayın. Resim yüklenemezse simge boş kalır; düğmenin adı, ipucu ve işlevi kullanılabilir.

## Diğer simgeleri bulma

Simge öğesinin `data-nabi-icon` değerinin önüne `--nabi-icon-` ekleyerek CSS değişkenini elde edin. Örneğin `diff-close`, `--nabi-icon-diff-close` kullanır. Bağlam, menü, kaydetme, geçmiş ve diğer anahtarların kuralları ile özel karakter kodlaması için <a href="/llms/icons.md" target="_blank" rel="noopener">simge sözleşmesine</a> bakın.

## Koyu mod ve paneller

Tema sınıfını veya CSS değişkenini değiştirmek, yeniden mount etmeden simgeleri günceller. Varsayılan simgeler açık/koyu temayı izler. Özel dosyalar `currentColor` değerini miras almaz; gerekirse yukarıdaki gibi koyu sürümler belirtin. `body` altında açılan paneller de kaynak düzenleyicinin simge temasını ve sınıf/stil değişikliklerini izler. Değişkenleri yalnızca araç çubuğunun içine değil, düzenleyiciye veya ortak üst öğeye koyun.

## Varsayılan düğmeleri gösterme

`showPreview` ve `showFullscreen` varsayılan olarak `true` değerindedir. `false`, ilgili düğmeyi, odak hedefini ve olaylarını kaldırır. İkisi de `false` ise boş araç alanı da oluşturulmaz.

```ts
import { mountViewTools, renderViewToolsHtml } from 'nabi-note'

const visibility = { showPreview: false, showFullscreen: true }
const toolsHtml = renderViewToolsHtml({ locale: 'en', ...visibility })
const tools = mountViewTools({
  nabi, surface, root, container, locale: 'en', ...visibility,
})
```

SSR ve mount için aynı görünürlük seçeneklerini kullanın. Yapılandırmayı değiştirmek için `tools.unmount()` çağırıp yeni seçeneklerle mount edin. İki düğme de gerekmiyorsa araç mount işlemini ve SSR işaretlemesini tamamen atlayabilirsiniz. `openPreview()` ve `setFullscreen()` doğrudan çağrılmaya devam edebilir.
