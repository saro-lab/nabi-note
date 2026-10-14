---
title: Tablo
description: Hücrelere birden fazla paragraf ve blok ekleyin; arka planları, birleştirmeyi ve hizalamayı düzenleyin.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Tablo

Tablo oluşturmak için araç çubuğundan satır ve sütunları seçin. Hücreler birden fazla paragraf, görsel, liste, alıntı, kod, daraltılabilir bölüm ve video içerebilir. İmleci bir hücreye yerleştirerek alttaki özellik araçlarıyla satırları, sütunları, birleştirmeyi, başlık hücrelerini ve arka plan renklerini düzenleyebilirsiniz.

Aşağıdaki örnekte hücrelerdeki paragrafları ve listeleri düzenleyin, ardından birkaç hücre üzerinde sürükleyerek arka planlarını birlikte değiştirin. Özellik araçlarında **Tabloyu seç** düğmesine basarak ana araç çubuğundan tablonun kendisini hizalayabilirsiniz.

<WingDemo path="/wing/block/table" />

```ts
const selected = wings().use('table').build()
```

Hücrelerin içinde kullanacağınız kanatları da kaydedin. Tüm temel kanatları kullanan bir düzenleyiciyi `wings().allBasic()` ile oluşturabilirsiniz.

## Hücre içinde yazma

| Girdi | Davranış |
| --- | --- |
| Normal paragrafta Enter | Aynı hücre içinde yeni bir paragraf oluşturur. |
| Shift+Enter | Geçerli paragraf veya liste öğesi içinde satır sonu ekler. |
| Normal paragrafta Tab / Shift+Tab | Sonraki / önceki hücreye geçer. |
| Liste veya kod içinde Tab / Shift+Tab | İlgili bloğun girintiyi artırma / azaltma davranışını kullanır. |

Listelerde ve kodda Enter, ilgili bloğun giriş kurallarına uyar. Kodun girintisi daha fazla azaltılamasa da Shift+Tab önceki hücreye geçmez. Hücrenin başında veya sonunda Backspace ya da Delete kullanmak, hücreyi komşu hücreyle veya tablo dışındaki bir paragrafla birleştirmez.

Yapıştırma ve görsel ya da blok ekleme, işlemin başladığı hücrenin içinde kalır. Hücre sınırlarını aşan seçimlere blok ekleme veya yapıştırma uygulanamaz. Hücrelerin içine tablo veya [kayan bölge](./float) yerleştirilemez; bu tür yapılar içe aktarıldığında veya yapıştırıldığında içerikleri sırasıyla açılır.

Normal hücrelerde başlık kullanılabilir, ancak başlık hücrelerine başlık biçimi uygulanmaz. Bir hücre başlık hücresine dönüştürüldüğünde içindeki başlıklar normal paragrafa dönüşür; metin ve diğer biçimler korunur.

## Hücre arka plan renkleri

Arka plan rengi tek bir hücreye veya sürükleyerek seçilen dikdörtgen aralığa uygulanır. Metnin yalnızca bir kısmı seçilse bile onu içeren hücrenin tamamının arka planı değişir. Soluk renkler açık ve koyu temaya uyarlanır. Seçili hücrelerin renkleri farklıysa tek bir renk seçili olarak gösterilmez.

Geçerli hücre seçimini koruyarak bir komutla da rengi değiştirebilirsiniz.

```ts
nabi.applyCommand('setCellColor', { bg: 'cyan' })
```

İzin verilen değerler `yellow`, `green`, `cyan`, `pink`, `purple` ve `orange` değerleridir. Varsayılan arka plana dönmek için özellik araçlarında **Varsayılan** seçeneğini seçin veya boş bir dize gönderin.

```ts
nabi.applyCommand('setCellColor', { bg: '' })
```

İçerik silme, kesme ve biçimi temizleme hücre arka plan rengini kaldırmaz. Birleştirme sol üst hücrenin rengini kullanır; bölme sırasında oluşan yeni hücreler de aynı rengi alır. Yeni eklenen satır ve sütunlar varsayılan arka planla başlar. Arka plan rengi değişiklikleri geri alma ve yinelemeyi destekler.

## Hücre içeriğini ve tabloyu hizalama

İmleç bir hücredeyken hizalama, içindeki paragraflara veya görsellere uygulanır. Birden fazla hücre seçildiğinde, kod hariç içlerindeki hizalanabilir tüm paragraf ve nesnelere birlikte uygulanır. Başlık, hizalama ve büyük başlangıç harfi araçlarının durumu da gerçekten seçilmiş iç paragrafları izler. Seçilen paragrafların değerleri farklıysa tek bir değer gösterilmez.

Tablonun kendisini hizalamak için özellik araçlarında **Tabloyu seç** düğmesine, ardından ana araç çubuğundaki hizalama düğmelerine basın. İmleci tabloyu saran paragrafın önüne veya arkasına getirip kesik çizgili kenarlık göründüğünde de aynı hizalamayı kullanabilirsiniz. Bu kenarlık yalnızca hedefi gösterir; imleci tüm tablo seçimine dönüştürmez.

```ts
nabi.applyCommand('selectTable')
nabi.applyCommand('setAlign', { value: 'c' })
```

Satır ve sütun ekleme ya da silme, birleştirme ve bölme seçili hücrelere göre çalışır. Birleştirme her hücrenin bloklarını satır sırasıyla korur. Bölmede içerik özgün hücrede kalır, diğer hücreler boş olur.

## Kopyalama ve kaydetme

Birden fazla hücre seçilip kopyalandığında ekranda görünen dikdörtgen aralık son hücre dahil kopyalanır. HTML ve dahili pano biçimi boş hücreleri, birleştirmeleri, blokları, metin biçimlerini ve arka plan renklerini korur. Düz metin hücreleri sekmeler ve satır sonlarıyla ayırır; hücre içindeki bloklar arasındaki satır sonlarını ve görsel ile video adreslerini korur. Kesme yalnızca seçili hücrelerin içeriğini boşaltır ve tek bir geri alma işlemiyle geri döndürülebilir.

İmleç tablonun önünde veya arkasındayken kesik çizgili kenarlık görünüyorsa kopyalama ve kesme tabloyu saran paragrafın tamamına uygulanır. Kesme, panoya yazma başarılı olduktan sonra paragrafı ve tabloyu birlikte kaldırır. Kayan bölgenin içindeki bir tabloyu kesmek veya silmek dıştaki kayan bölgeyi korur.

JSON ve HTML olarak kaydetme hücre bloklarını ve arka plan renklerini korur. Basit tablolar Markdown tablosu olarak dışa aktarılır; birden fazla blok veya arka plan rengi içeren tablolar, içerik korunacak şekilde HTML olarak kalır. HTML’de hücrenin renk adı `td` veya `th` öğesinin `data-nabi-cell-color` özniteliğinde saklanır. Harici HTML’deki rastgele arka plan rengi stilleri hücre arka plan rengi olarak içe aktarılmaz.

Yayımlanan görünümde sütun sıralamasını kullanmak için tabloyu sıralanabilir olarak kaydedin ve `nabi-note/viewer` içindeki `attachViewer()` işlevini bağlayın. Birleştirilmiş hücreler içeren tablolar sütun sıralamasına dahil değildir.

## CSS stilleri

Tabloları `.nabi-content table`, hücreleri `.nabi-content :is(th, td)` ile biçimlendirin. Atanan arka plan renklerinin üzerine yazmamak için şeritleri ve başlık arka planlarını yalnızca renksiz hücrelere uygulayın.

```css
.article-body table { inline-size: 100%; border-collapse: collapse; }
.article-body :is(th, td) { padding: .6rem .75rem; border: 1px solid var(--nabi-line); }
.article-body th { font-weight: 700; }
.article-body th:not([data-nabi-cell-color]) { background: var(--nabi-soft); }
.article-body tr:nth-child(even) td:not([data-nabi-cell-color]) {
  background: color-mix(in srgb, var(--nabi-soft) 45%, transparent);
}
```

Hücre arka plan renklerinin kendisini `--nabi-cell-yellow` gibi renk adını içeren CSS değişkenleriyle değiştirin. Aşağıdaki CSS’i paket CSS’inden sonra yükleyin; `table-note` sınıfını ve geçerli temanın `data-nabi-theme` değerini doğrudan düzenleyicinin `.nabi` öğesine veya yayımlanan görünümün `.nabi-content` öğesine atayın.

```css
.table-note:is(.nabi, .nabi-content)[data-nabi-theme="light"] {
  --nabi-cell-cyan: #e2f4f7;
}
.table-note:is(.nabi, .nabi-content)[data-nabi-theme="dark"] {
  --nabi-cell-cyan: #183b43;
}
```

Viewer bağlıysa `.nabi-sort` düğmesini koruyun. Hücrelerin `position` değerini veya sağ padding değerini zorla değiştirmek sıralama düğmesiyle çakışmaya yol açabilir.
