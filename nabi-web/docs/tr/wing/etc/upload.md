---
title: Dosya yükleme
description: Dosya aktarımını hizmetinizin yükleyicisine bağlar.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Dosya yükleme

Dosya seçimini, sürükle-bırakı ve yalnızca dosya içeren yapıştırma işlemlerini bir yükleme akışına bağlayın. Bu sayfadaki demo dosyaları sunucuya göndermez; gerçek bir hizmette, dosyayı alıp URL döndüren bir yükleyici bağlamanız gerekir.

Yükleme sonuçlarını görsel blokları olarak eklemek için görsel wing'ine, diğer dosyaları ek bağlantıları olarak eklemek için bağlantı wing'ine ihtiyacınız vardır. Hizmetiniz her iki biçimi de kabul ediyorsa iki wing'i de açıkça seçin. Yükleme sürerken düzenleyici kilitlenir ve başarılı dosyalar tek bir geri alma adımı olarak birlikte eklenir.

<WingDemo path="/wing/etc/upload" />

```ts
const selected = wings()
  .use('img')
  .use('a')
  .use('upload', { allowLocalUrls: false })
  .build()
```

Yalnızca `upload` seçerseniz, görsel veya bağlantı bağımlılıklarından eksik olanı otomatik olarak ekler. Aktarım `mountUpload()` ile, düzenleme ekranındaki ilerleme arayüzü ise genellikle `mountUploadView()` ile bağlanır. Sunucu HTTPS URL'leri döndürüyorsa yerel URL seçeneğine gerek yoktur.

## Sunucu API sözleşmesi

NABI NOTE dosyaları kendiliğinden sunucunuza göndermez. `uploader` işlevi tek bir dosyayı sunucuya yollar ve başarılı olduğunda yalnızca herkese açık veya kimlik doğrulamalı bir `https:` URL'si döndürür. En basit API sözleşmesi şöyledir.

```text
POST /api/uploads
Content-Type: multipart/form-data
Alan adı: file

Başarı: { "url": "https://cdn.example.com/uploads/8f2c.webp" }
Başarısızlık: 4xx veya 5xx yanıtı
```

Sunucu yalnızca özgün dosya adına, uzantıya veya tarayıcının gönderdiği MIME değerine güvenmemelidir. Önce kimlik doğrulama ve izinleri denetleyin, akış sırasında dosya boyutunu sınırlayın ve gerçek dosya türünü inceleyin. Saklanan adı sunucuda oluşturun. Görseller için gerektiğinde yeniden kodlama yapın veya küçük resimler oluşturun. Yüklenen dosyalar herkes tarafından indirilememeliyse herkese açık URL yerine kimlik doğrulaması gerektiren bir indirme yolu döndürün.

| Sunucuda denetlenecekler | Neden |
| --- | --- |
| Oturum açmış kullanıcı ve yükleme izni | Başka kullanıcının depolama alanına yazılmasını önler |
| Dosya başına boyut ve toplam istek boyutu | Bellek ve depolama alanının tükenmesini önler |
| İzin verilen gerçek MIME türü ve uzantı | Uzantısı değiştirilmiş çalıştırılabilir dosyaları engeller |
| Rastgele saklama adı ve yalıtılmış depolama | Yol manipülasyonunu ve mevcut dosyaların üzerine yazılmasını önler |
| Yanıt URL'sinin erişim ve son kullanma ilkesi | Özel dosyaların yalnızca URL ile açığa çıkmasını önler |

İstemci tarafındaki `extensions` ve `maxFileSize`, kullanıcıya hızlı geri bildirim vermenin yalnızca ilk adımıdır. Aynı sınırları sunucuya da koyun.

## Tarayıcıda yükleyiciyi bağlama

Aşağıdaki örnek, NABI NOTE'un beklediği gerçek bağlantıdır. Tarayıcının standart `fetch()` işlevi yükleme ilerlemesi sağlamadığından `XMLHttpRequest` kullanır. Sunucu yanıtından yalnızca `url` değerini döndürün; görseller görsel bloklarına, diğer dosyalar ek bağlantılarına dönüşür.

```ts
import {
  createNabiWith,
  mountSurface,
  mountUpload,
  mountUploadView,
  wings,
  type UploadTask,
} from 'nabi-note'

const content = document.querySelector<HTMLElement>('#content')!
const { nabi, registry } = createNabiWith(
  wings().use('img').use('a').use('upload').build(),
  { locale: 'tr' },
)

function sendUpload(task: UploadTask): Promise<{ uri: string } | null> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('POST', '/api/uploads')
    request.responseType = 'json'

    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) task.onProgress((event.loaded / event.total) * 100)
    })

    request.addEventListener('load', () => {
      const url = request.response?.url
      if (request.status >= 200 && request.status < 300 && typeof url === 'string') {
        resolve({ uri: url })
      } else {
        resolve(null)
      }
    })
    request.addEventListener('error', () => reject(new Error('Yükleme isteği başarısız oldu.')))
    task.signal.addEventListener('abort', () => request.abort(), { once: true })

    const body = new FormData()
    body.append('file', task.file as File, task.name)
    request.send(body)
  })
}

let uploadView: ReturnType<typeof mountUploadView>
const upload = mountUpload({
  nabi,
  root: content,
  uploader: sendUpload,
  extensions: ['png', 'jpg', 'jpeg', 'webp', 'pdf'],
  maxFileSize: 10 * 1024 * 1024,
  maxTotalSize: 20 * 1024 * 1024,
  locale: 'tr',
  onStart: (tasks) => uploadView.start(tasks),
  onProgress: (id, percent) => uploadView.progress(id, percent),
  onSettle: () => uploadView.settle(),
  onDone: () => uploadView.done(),
})

uploadView = mountUploadView({ nabi, surface: content, upload, locale: 'tr' })

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  fileSink: upload.take,
  locale: 'tr',
})
```

Sürükle-bırak ve yalnızca dosya içeren yapıştırma işlemlerinin yükleme akışına girmesi için `fileSink: upload.take` bağlantısını kurun. Yükleme wing'i arayüzü, dosya seçme düğmesinin sonuçlarını `upload.take()` işlevine iletir. Yükleme sürerken düzenleyici kilitlenir ve her toplu işteki başarılı dosyalar tek bir geri alma adımı olarak eklenir. `upload.cancel()` veya `uploadView` içindeki iptal düğmesi, devam eden istekleri `AbortSignal` aracılığıyla durdurur.

## Başarısızlık ve temizleme

Sunucu hata yanıtı verirse veya `uploader` `null` döndürürse o dosya belgeye eklenmez. Aynı toplu işteki diğer dosyalar işlenmeye devam eder. Toplam boyut sınırı aşılırsa toplu işin tamamı başlamaz. Ekranı kapatırken, oluşturma sırasının tersine göre kaldırın.

```ts
function dispose() {
  surface.unmount()
  uploadView.unmount()
  upload.unmount()
}
```

Yalnızca geliştirme sırasında anlık önizleme için `blob:` URL'leri kullanabilirsiniz. Bu durumda düzenleyici kurulumunda, görsel wing'inde ve yükleme wing'inde `allowLocalUrls: true` seçeneğini açın. Gerçek sunucu yüklemeleri HTTPS URL'leri döndürüyorsa bu seçeneği etkinleştirmemek daha güvenlidir.

## CSS stilleri

Tamamlanan normal dosyalar, bağlantı wing'i aracılığıyla `a[data-nabi-file]` olarak gösterilir. Yayımlanan görünümde yalnızca ek görünümünü değiştirmek istiyorsanız bu seçiciyi kullanın.

```css
.article-body a[data-nabi-file] {
  padding: .3em .6em;
  border: 1px solid var(--nabi-line);
  border-radius: 8px;
  background: var(--nabi-soft);
}
```

Görsel yükleme sonuçları görsel wing'inin CSS'ini izler. Yükleme ilerlemesi yalnızca düzenleme görünümünde gösterilir; bu nedenle yayımlanan görünüm CSS'inin bir ilerleme durumu oluşturmasına gerek yoktur.
