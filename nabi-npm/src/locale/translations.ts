const rows = (raw: string): readonly string[] =>
  raw
    .trim()
    .split('\n')
    .map((value) => value.replaceAll('\\n', '\n'));

const KEYS = rows(String.raw`
(lossy)
Address
Align center
Align left
Align right
Alignment
Amber
Apply
Attachment
Blue
Bold
Bullet list
Cancel
Changes only
Checklist
Choose files
Clear all
Clear formatting
Close
Code
Confirm
Context bar
Coral
Current session
Cursive
Cyan
Default
Delete column
Delete row
Details
Diff
Display name
Divider
Document diff
Document diff controls
Drop cap
Please drop files here
Exit fullscreen
Extra large
Extra small
File name
Format error — the data could not be read
Fullscreen
Green
Header this column
Header this row
Heading
Heading 1
Heading 2
Heading 3
Heading 4
Heading 5
Heading 6
Highlight
Image
Image width
Insert column left
Insert column right
Insert row above
Insert row below
Italic
Language
Large
Link
Local history
Merge cells
Monospace
Next change
No history yet
No language
No text selected.
Numbered list
OK
Open
Orange
Paste
Paste was canceled because the document changed.
Pink
Preview
Previous change
Purple
Quote
Remove this entry
Sans serif
Save
Save as {ext}
Serif
Shortcut hints
Small
Strikethrough
Subscript
Superscript
Table
Text color
Text size
Local history is unavailable because the browser has restricted access to storage.\nIf you opened a local file (file://), please open the page through a web server.
This clears the whole local history. It cannot be undone. Continue?
This document has unsaved changes. Open anyway?
This removes the entry. It cannot be undone. Continue?
Toggle sorting
Toolbar
Typeface
Underline
Upload
View image
Violet
Please write here…
Yellow
YouTube width
An upload is in progress. Please try again after it finishes.
created {when}
just now
up to {max} in one batch
{name} — file type not accepted
{name} — the file is empty
{name} — up to {max} per file
{name} — upload failed
{n} d ago
{n} files could not be uploaded
{n} h ago
{n} min ago
`);

const IT = rows(String.raw`
(con perdita)
Indirizzo
Allinea al centro
Allinea a sinistra
Allinea a destra
Allineamento
Ambra
Applica
Allegato
Blu
Grassetto
Elenco puntato
Annulla
Solo modifiche
Elenco di controllo
Scegli file
Cancella tutto
Rimuovi formattazione
Chiudi
Codice
Conferma
Barra contestuale
Corallo
Sessione corrente
Corsivo
Ciano
Predefinito
Elimina colonna
Elimina riga
Dettagli
Confronto
Nome visualizzato
Separatore
Confronto documenti
Controlli confronto documenti
Capolettera
È possibile trascinare e rilasciare i file qui
Esci da schermo intero
Molto grande
Molto piccolo
Nome file
Errore di formato — impossibile leggere i dati
Schermo intero
Verde
Intestazione di questa colonna
Intestazione di questa riga
Titolo
Titolo 1
Titolo 2
Titolo 3
Titolo 4
Titolo 5
Titolo 6
Evidenziatore
Immagine
Larghezza immagine
Inserisci colonna a sinistra
Inserisci colonna a destra
Inserisci riga sopra
Inserisci riga sotto
Corsivo
Linguaggio
Grande
Collegamento
Cronologia locale
Unisci celle
Monospaziato
Modifica successiva
Nessuna cronologia
Nessun linguaggio
Nessun testo selezionato.
Elenco numerato
OK
Apri
Arancione
Incolla
L'incollaggio è stato annullato perché il documento è cambiato.
Rosa
Anteprima
Modifica precedente
Viola
Citazione
Rimuovi questa voce
Senza grazie
Salva
Salva come {ext}
Con grazie
Suggerimenti scorciatoie
Piccolo
Barrato
Pedice
Apice
Tabella
Colore testo
Dimensione testo
La cronologia locale non è disponibile perché il browser ha limitato l’accesso all’archiviazione.\nSe la pagina è stata aperta come file locale (file://), è possibile aprirla tramite un server web.
Questa operazione cancella tutta la cronologia locale e non può essere annullata. Continuare?
Questo documento contiene modifiche non salvate. Aprirlo comunque?
Questa operazione rimuove la voce e non può essere annullata. Continuare?
Attiva/disattiva ordinamento
Barra degli strumenti
Tipo di carattere
Sottolineato
Carica
Visualizza immagine
Violetto
È possibile scrivere qui…
Giallo
Larghezza YouTube
È in corso un caricamento. Sarà possibile riprovare al termine.
creato {when}
proprio ora
fino a {max} per gruppo
{name} — tipo di file non accettato
{name} — il file è vuoto
{name} — massimo {max} per file
{name} — caricamento non riuscito
{n} g fa
Impossibile caricare {n} file
{n} h fa
{n} min fa
`);

const TR = rows(String.raw`
(kayıplı)
Adres
Ortala
Sola hizala
Sağa hizala
Hizalama
Kehribar
Uygula
Ek
Mavi
Kalın
Madde işaretli liste
İptal
Yalnızca değişiklikler
Kontrol listesi
Dosya seç
Tümünü temizle
Biçimlendirmeyi temizle
Kapat
Kod
Onayla
Bağlam çubuğu
Mercan
Geçerli oturum
El yazısı
Camgöbeği
Varsayılan
Sütunu sil
Satırı sil
Ayrıntılar
Karşılaştırma
Görünen ad
Ayırıcı
Belge karşılaştırması
Belge karşılaştırma denetimleri
Baş harf
Lütfen dosyaları buraya bırakın
Tam ekrandan çık
Çok büyük
Çok küçük
Dosya adı
Biçim hatası — veriler okunamadı
Tam ekran
Yeşil
Bu sütunu başlık yap
Bu satırı başlık yap
Başlık
Başlık 1
Başlık 2
Başlık 3
Başlık 4
Başlık 5
Başlık 6
Vurgulama
Görsel
Görsel genişliği
Sola sütun ekle
Sağa sütun ekle
Üste satır ekle
Alta satır ekle
İtalik
Dil
Büyük
Bağlantı
Yerel geçmiş
Hücreleri birleştir
Eş aralıklı
Sonraki değişiklik
Henüz geçmiş yok
Dil yok
Metin seçilmedi.
Numaralı liste
Tamam
Aç
Turuncu
Yapıştır
Belge değiştiği için yapıştırma iptal edildi.
Pembe
Önizleme
Önceki değişiklik
Mor
Alıntı
Bu kaydı kaldır
Serifsiz
Kaydet
{ext} olarak kaydet
Serifli
Kısayol ipuçları
Küçük
Üstü çizili
Alt simge
Üst simge
Tablo
Metin rengi
Metin boyutu
Tarayıcı depolama erişimini kısıtladığı için yerel geçmiş kullanılamıyor.\nYerel bir dosya (file://) açtıysanız lütfen sayfayı bir web sunucusu üzerinden açın.
Bu işlem tüm yerel geçmişi temizler ve geri alınamaz. Devam edilsin mi?
Bu belgede kaydedilmemiş değişiklikler var. Yine de açılsın mı?
Bu işlem kaydı kaldırır ve geri alınamaz. Devam edilsin mi?
Sıralamayı aç/kapat
Araç çubuğu
Yazı tipi
Altı çizili
Yükle
Görseli görüntüle
Menekşe
Lütfen buraya yazın…
Sarı
YouTube genişliği
Bir yükleme devam ediyor. Lütfen tamamlandıktan sonra yeniden deneyin.
{when} oluşturuldu
az önce
tek seferde en fazla {max}
{name} — dosya türü kabul edilmiyor
{name} — dosya boş
{name} — dosya başına en fazla {max}
{name} — yükleme başarısız
{n} gün önce
{n} dosya yüklenemedi
{n} saat önce
{n} dk önce
`);

const VI = rows(String.raw`
(có mất dữ liệu)
Địa chỉ
Căn giữa
Căn trái
Căn phải
Căn chỉnh
Hổ phách
Áp dụng
Tệp đính kèm
Xanh lam
Đậm
Danh sách dấu đầu dòng
Hủy
Chỉ phần thay đổi
Danh sách kiểm tra
Chọn tệp
Xóa tất cả
Xóa định dạng
Đóng
Mã
Xác nhận
Thanh ngữ cảnh
San hô
Phiên hiện tại
Chữ viết tay
Lục lam
Mặc định
Xóa cột
Xóa hàng
Chi tiết
So sánh
Tên hiển thị
Đường phân cách
So sánh tài liệu
Điều khiển so sánh tài liệu
Chữ cái đầu lớn
Vui lòng thả tệp vào đây
Thoát toàn màn hình
Rất lớn
Rất nhỏ
Tên tệp
Lỗi định dạng — không thể đọc dữ liệu
Toàn màn hình
Xanh lá
Đặt cột này làm tiêu đề
Đặt hàng này làm tiêu đề
Tiêu đề
Tiêu đề 1
Tiêu đề 2
Tiêu đề 3
Tiêu đề 4
Tiêu đề 5
Tiêu đề 6
Tô sáng
Hình ảnh
Chiều rộng hình ảnh
Chèn cột bên trái
Chèn cột bên phải
Chèn hàng phía trên
Chèn hàng phía dưới
Nghiêng
Ngôn ngữ
Lớn
Liên kết
Lịch sử cục bộ
Gộp ô
Đơn cách
Thay đổi tiếp theo
Chưa có lịch sử
Không có ngôn ngữ
Chưa chọn văn bản.
Danh sách đánh số
OK
Mở
Cam
Dán
Đã hủy thao tác dán vì tài liệu đã thay đổi.
Hồng
Xem trước
Thay đổi trước
Tím
Trích dẫn
Xóa mục này
Không chân
Lưu
Lưu dưới dạng {ext}
Có chân
Gợi ý phím tắt
Nhỏ
Gạch ngang
Chỉ số dưới
Chỉ số trên
Bảng
Màu chữ
Cỡ chữ
Không thể sử dụng lịch sử cục bộ vì trình duyệt đã hạn chế quyền truy cập bộ nhớ.\nNếu bạn đã mở tệp cục bộ (file://), vui lòng mở trang thông qua máy chủ web.
Thao tác này xóa toàn bộ lịch sử cục bộ và không thể hoàn tác. Tiếp tục?
Tài liệu này có thay đổi chưa lưu. Vẫn mở?
Thao tác này xóa mục và không thể hoàn tác. Tiếp tục?
Bật/tắt sắp xếp
Thanh công cụ
Kiểu chữ
Gạch chân
Tải lên
Xem hình ảnh
Tím
Vui lòng nhập nội dung tại đây…
Vàng
Chiều rộng YouTube
Đang tải lên. Vui lòng thử lại sau khi hoàn tất.
đã tạo {when}
vừa xong
tối đa {max} mỗi đợt
{name} — loại tệp không được chấp nhận
{name} — tệp trống
{name} — tối đa {max} mỗi tệp
{name} — tải lên thất bại
{n} ngày trước
Không thể tải lên {n} tệp
{n} giờ trước
{n} phút trước
`);

const FA = rows(String.raw`
(با افت کیفیت)
نشانی
تراز وسط
تراز چپ
تراز راست
تراز
کهربایی
اعمال
پیوست
آبی
پررنگ
فهرست نشانه‌دار
لغو
فقط تغییرات
فهرست بررسی
انتخاب فایل
پاک کردن همه
پاک کردن قالب‌بندی
بستن
کد
تأیید
نوار زمینه
مرجانی
نشست فعلی
دست‌نویس
فیروزه‌ای
پیش‌فرض
حذف ستون
حذف ردیف
جزئیات
مقایسه
نام نمایشی
جداکننده
مقایسه سند
کنترل‌های مقایسه سند
حرف آغازین بزرگ
لطفاً فایل‌ها را اینجا رها کنید
خروج از تمام‌صفحه
بسیار بزرگ
بسیار کوچک
نام فایل
خطای قالب — داده خوانده نشد
تمام‌صفحه
سبز
این ستون را سرصفحه کن
این ردیف را سرصفحه کن
عنوان
عنوان ۱
عنوان ۲
عنوان ۳
عنوان ۴
عنوان ۵
عنوان ۶
برجسته‌سازی
تصویر
پهنای تصویر
درج ستون در چپ
درج ستون در راست
درج ردیف در بالا
درج ردیف در پایین
کج
زبان
بزرگ
پیوند
تاریخچه محلی
ادغام سلول‌ها
تک‌فاصله
تغییر بعدی
هنوز تاریخچه‌ای نیست
بدون زبان
متنی انتخاب نشده است.
فهرست شماره‌دار
تأیید
باز کردن
نارنجی
چسباندن
چون سند تغییر کرد، چسباندن لغو شد.
صورتی
پیش‌نمایش
تغییر قبلی
بنفش
نقل‌قول
حذف این مورد
بدون سریف
ذخیره
ذخیره به‌صورت {ext}
سریف‌دار
راهنمای میانبرها
کوچک
خط‌خورده
زیرنویس
بالانویس
جدول
رنگ متن
اندازه متن
به دلیل محدودیت دسترسی مرورگر به فضای ذخیره‌سازی، تاریخچه محلی در دسترس نیست.\nاگر یک فایل محلی (file://) باز کرده‌اید، لطفاً صفحه را از طریق یک وب‌سرور باز کنید.
این کار تمام تاریخچه محلی را پاک می‌کند و قابل بازگشت نیست. ادامه می‌دهید؟
این سند تغییرات ذخیره‌نشده دارد. با این حال باز شود؟
این کار مورد را حذف می‌کند و قابل بازگشت نیست. ادامه می‌دهید؟
تغییر وضعیت مرتب‌سازی
نوار ابزار
قلم
زیرخط
بارگذاری
نمایش تصویر
بنفش
لطفاً اینجا بنویسید…
زرد
پهنای YouTube
بارگذاری در حال انجام است. لطفاً پس از پایان دوباره تلاش کنید.
ایجادشده در {when}
همین حالا
حداکثر {max} در هر نوبت
{name} — نوع فایل پذیرفته نیست
{name} — فایل خالی است
{name} — حداکثر {max} برای هر فایل
{name} — بارگذاری ناموفق بود
{n} روز پیش
{n} فایل بارگذاری نشد
{n} ساعت پیش
{n} دقیقه پیش
`);

const MR = rows(String.raw`
(गुणवत्तेत घट)
पत्ता
मध्यभागी संरेखित करा
डावीकडे संरेखित करा
उजवीकडे संरेखित करा
संरेखन
अंबर
लागू करा
संलग्नक
निळा
ठळक
बुलेट सूची
रद्द करा
फक्त बदल
तपासणी सूची
फायली निवडा
सर्व साफ करा
स्वरूपण साफ करा
बंद करा
कोड
पुष्टी करा
संदर्भ पट्टी
प्रवाळ
सध्याचे सत्र
हस्तलिखित
सायन
डीफॉल्ट
स्तंभ हटवा
पंक्ती हटवा
तपशील
तुलना
दर्शनी नाव
विभाजक
दस्तऐवज तुलना
दस्तऐवज तुलना नियंत्रणे
मोठे आद्याक्षर
कृपया फायली येथे सोडा
पूर्ण स्क्रीनमधून बाहेर पडा
अतिशय मोठे
अतिशय लहान
फाइलचे नाव
स्वरूप त्रुटी — डेटा वाचता आला नाही
पूर्ण स्क्रीन
हिरवा
हा स्तंभ शीर्षलेख करा
ही पंक्ती शीर्षलेख करा
शीर्षक
शीर्षक १
शीर्षक २
शीर्षक ३
शीर्षक ४
शीर्षक ५
शीर्षक ६
ठळक रंग
प्रतिमा
प्रतिमेची रुंदी
डावीकडे स्तंभ घाला
उजवीकडे स्तंभ घाला
वर पंक्ती घाला
खाली पंक्ती घाला
तिरपे
भाषा
मोठे
दुवा
स्थानिक इतिहास
पेशी एकत्र करा
एकसमान रुंदी
पुढील बदल
अजून इतिहास नाही
भाषा नाही
मजकूर निवडलेला नाही.
क्रमांकित सूची
ठीक आहे
उघडा
नारिंगी
चिकटवा
दस्तऐवज बदलल्यामुळे चिकटवणे रद्द केले.
गुलाबी
पूर्वावलोकन
मागील बदल
जांभळा
उद्धरण
ही नोंद काढा
सेरिफविरहित
जतन करा
{ext} म्हणून जतन करा
सेरिफ
शॉर्टकट सूचना
लहान
मधून रेघ
अधोलिखित
अधिलिखित
तक्ता
मजकूर रंग
मजकूर आकार
ब्राउझरने संचयाचा प्रवेश मर्यादित केल्यामुळे स्थानिक इतिहास उपलब्ध नाही.\nआपण स्थानिक फाइल (file://) उघडली असल्यास, कृपया पृष्ठ वेब सर्व्हरद्वारे उघडा.
यामुळे संपूर्ण स्थानिक इतिहास साफ होईल आणि ते पूर्ववत करता येणार नाही. पुढे जायचे?
या दस्तऐवजात जतन न केलेले बदल आहेत. तरीही उघडायचे?
यामुळे नोंद काढली जाईल आणि ते पूर्ववत करता येणार नाही. पुढे जायचे?
क्रमवारी चालू/बंद करा
साधनपट्टी
टाइपफेस
अधोरेखित
अपलोड करा
प्रतिमा पहा
जांभळट
कृपया येथे लिहा…
पिवळा
YouTube रुंदी
अपलोड सुरू आहे. कृपया पूर्ण झाल्यावर पुन्हा प्रयत्न करा.
{when} रोजी तयार केले
आत्ताच
एका तुकडीत कमाल {max}
{name} — फाइल प्रकार स्वीकारलेला नाही
{name} — फाइल रिकामी आहे
{name} — प्रत्येक फाइलसाठी कमाल {max}
{name} — अपलोड अयशस्वी
{n} दिवसांपूर्वी
{n} फायली अपलोड करता आल्या नाहीत
{n} तासांपूर्वी
{n} मिनिटांपूर्वी
`);

const TE = rows(String.raw`
(నష్టంతో)
చిరునామా
మధ్యకు సమలేఖనం
ఎడమకు సమలేఖనం
కుడికి సమలేఖనం
సమలేఖనం
అంబర్
వర్తింపజేయండి
జోడింపు
నీలం
బోల్డ్
బుల్లెట్ జాబితా
రద్దు
మార్పులు మాత్రమే
తనిఖీ జాబితా
ఫైళ్లను ఎంచుకోండి
అన్నీ తొలగించండి
ఆకృతీకరణను తొలగించండి
మూసివేయండి
కోడ్
నిర్ధారించండి
సందర్భ పట్టీ
పగడపు రంగు
ప్రస్తుత సెషన్
చేతిరాత
సయాన్
డిఫాల్ట్
నిలువు వరుసను తొలగించండి
అడ్డు వరుసను తొలగించండి
వివరాలు
పోలిక
ప్రదర్శన పేరు
విభాజకం
పత్రం పోలిక
పత్రం పోలిక నియంత్రణలు
పెద్ద మొదటి అక్షరం
దయచేసి ఫైళ్లను ఇక్కడ వదలండి
పూర్తి తెర నుండి నిష్క్రమించండి
చాలా పెద్దది
చాలా చిన్నది
ఫైల్ పేరు
ఆకృతి లోపం — డేటాను చదవలేకపోయాం
పూర్తి తెర
ఆకుపచ్చ
ఈ నిలువు వరుసను శీర్షికగా చేయండి
ఈ అడ్డు వరుసను శీర్షికగా చేయండి
శీర్షిక
శీర్షిక 1
శీర్షిక 2
శీర్షిక 3
శీర్షిక 4
శీర్షిక 5
శీర్షిక 6
హైలైట్
చిత్రం
చిత్ర వెడల్పు
ఎడమవైపు నిలువు వరుసను చేర్చండి
కుడివైపు నిలువు వరుసను చేర్చండి
పైన అడ్డు వరుసను చేర్చండి
కింద అడ్డు వరుసను చేర్చండి
ఇటాలిక్
భాష
పెద్దది
లింక్
స్థానిక చరిత్ర
గడులను విలీనం చేయండి
ఏకవెడల్పు
తదుపరి మార్పు
ఇంకా చరిత్ర లేదు
భాష లేదు
పాఠ్యం ఎంచుకోలేదు.
సంఖ్యా జాబితా
సరే
తెరవండి
నారింజ
అతికించండి
పత్రం మారినందున అతికించడం రద్దయింది.
గులాబీ
మునుజూపు
మునుపటి మార్పు
ఊదా
ఉల్లేఖనం
ఈ నమోదును తొలగించండి
సెరిఫ్ లేని
భద్రపరచండి
{ext}గా భద్రపరచండి
సెరిఫ్
సత్వరమార్గ సూచనలు
చిన్నది
కొట్టివేత
అధోలిపి
ఊర్ధ్వలిపి
పట్టిక
పాఠ్య రంగు
పాఠ్య పరిమాణం
బ్రౌజర్ నిల్వకు ప్రాప్యతను పరిమితం చేసినందున స్థానిక చరిత్ర అందుబాటులో లేదు.\nమీరు స్థానిక ఫైల్‌ను (file://) తెరిచి ఉంటే, దయచేసి వెబ్ సర్వర్ ద్వారా పేజీని తెరవండి.
ఇది మొత్తం స్థానిక చరిత్రను తొలగిస్తుంది; తిరిగి పొందలేరు. కొనసాగించాలా?
ఈ పత్రంలో భద్రపరచని మార్పులు ఉన్నాయి. అయినా తెరవాలా?
ఇది నమోదును తొలగిస్తుంది; తిరిగి పొందలేరు. కొనసాగించాలా?
క్రమబద్ధీకరణను మార్చండి
సాధన పట్టీ
అక్షర రూపం
అండర్‌లైన్
అప్‌లోడ్
చిత్రాన్ని చూడండి
వయలెట్
దయచేసి ఇక్కడ వ్రాయండి…
పసుపు
YouTube వెడల్పు
అప్‌లోడ్ జరుగుతోంది. దయచేసి పూర్తయిన తర్వాత మళ్లీ ప్రయత్నించండి.
{when}న సృష్టించబడింది
ఇప్పుడే
ఒక విడతలో గరిష్ఠంగా {max}
{name} — ఫైల్ రకం అంగీకరించబడదు
{name} — ఫైల్ ఖాళీగా ఉంది
{name} — ఒక్కో ఫైల్‌కు గరిష్ఠంగా {max}
{name} — అప్‌లోడ్ విఫలమైంది
{n} రోజుల క్రితం
{n} ఫైళ్లను అప్‌లోడ్ చేయలేకపోయాం
{n} గంటల క్రితం
{n} నిమిషాల క్రితం
`);

const HA = rows(String.raw`
(mai rasa inganci)
Adireshi
Daidaita a tsakiya
Daidaita hagu
Daidaita dama
Daidaitawa
Launin amber
Aiwatar
Haɗe-haɗe
Shuɗi
Kauri
Jerin ɗigo
Soke
Canje-canje kawai
Jerin dubawa
Zaɓi fayiloli
Goge duka
Goge tsarawa
Rufe
Lamba
Tabbatar
Sandar mahalli
Launin murjani
Zaman yanzu
Rubutun hannu
Launin cyan
Na asali
Goge ginshiƙi
Goge layi
Cikakkun bayanai
Kwatantawa
Sunan nunawa
Mai raba
Kwatanta daftari
Abubuwan sarrafa kwatancin daftari
Babban harafin farko
Da fatan za a ajiye fayiloli a nan
Fita daga cikakken allo
Mafi girma
Mafi ƙanƙanta
Sunan fayil
Kuskuren tsari — ba a iya karanta bayanan ba
Cikakken allo
Kore
Mayar da wannan ginshiƙi take
Mayar da wannan layi take
Take
Take na 1
Take na 2
Take na 3
Take na 4
Take na 5
Take na 6
Haskakawa
Hoto
Faɗin hoto
Saka ginshiƙi a hagu
Saka ginshiƙi a dama
Saka layi a sama
Saka layi a ƙasa
Rubutun karkace
Harshe
Babba
Mahada
Tarihin gida
Haɗa sel
Faɗi ɗaya
Canji na gaba
Babu tarihi tukuna
Babu harshe
Ba a zaɓi rubutu ba.
Jerin lambobi
To
Buɗe
Ruwan lemu
Liƙa
An soke liƙawa saboda daftarin ya canza.
Ruwan hoda
Samfoti
Canjin da ya gabata
Shunayya
Ambato
Cire wannan shigarwar
Ba tare da serif ba
Ajiye
Ajiye a matsayin {ext}
Mai serif
Alamomin gajeriyar hanya
Ƙarami
Tsallake rubutu
Rubutun ƙasa
Rubutun sama
Tebur
Launin rubutu
Girman rubutu
Tarihin gida ba ya samuwa saboda mai lilo ya taƙaita damar shiga ma’ajiya.\nIdan an buɗe fayil na gida (file://), da fatan za a buɗe shafin ta uwar garken yanar gizo.
Wannan zai goge duk tarihin gida kuma ba za a iya mayar da shi ba. A ci gaba?
Wannan daftarin yana da canje-canjen da ba a ajiye ba. A buɗe duk da haka?
Wannan zai cire shigarwar kuma ba za a iya mayar da ita ba. A ci gaba?
Kunna/kashe jerantawa
Sandar kayan aiki
Nau'in rubutu
Ja layi a ƙasa
Loda
Duba hoto
Launin violet
Da fatan za a rubuta a nan…
Rawaya
Faɗin YouTube
Ana lodi. Da fatan za a sake gwadawa bayan an gama.
an ƙirƙira {when}
yanzu-yanzu
har zuwa {max} a rukuni ɗaya
{name} — ba a karɓar nau'in fayil ɗin ba
{name} — fayil ɗin babu komai
{name} — har zuwa {max} ga kowane fayil
{name} — lodawa ta gaza
kwanaki {n} da suka wuce
Ba a iya loda fayiloli {n} ba
sa'o'i {n} da suka wuce
minti {n} da suka wuce
`);

const SW = rows(String.raw`
(hupoteza ubora)
Anwani
Panga katikati
Panga kushoto
Panga kulia
Mpangilio
Kaharabu
Tumia
Kiambatisho
Buluu
Nzito
Orodha ya vitone
Ghairi
Mabadiliko pekee
Orodha hakiki
Chagua faili
Futa yote
Futa uumbizaji
Funga
Msimbo
Thibitisha
Upau wa muktadha
Matumbawe
Kikao cha sasa
Mwandiko
Siani
Chaguo-msingi
Futa safu wima
Futa safu mlalo
Maelezo
Tofauti
Jina la kuonyesha
Kitenganishi
Tofauti ya hati
Vidhibiti vya tofauti ya hati
Herufi kubwa ya mwanzo
Tafadhali dondosha faili hapa
Ondoka kwenye skrini nzima
Kubwa sana
Ndogo sana
Jina la faili
Hitilafu ya muundo — data haikuweza kusomwa
Skrini nzima
Kijani
Fanya safu wima hii kuwa kichwa
Fanya safu mlalo hii kuwa kichwa
Kichwa
Kichwa 1
Kichwa 2
Kichwa 3
Kichwa 4
Kichwa 5
Kichwa 6
Angazia
Picha
Upana wa picha
Ingiza safu wima kushoto
Ingiza safu wima kulia
Ingiza safu mlalo juu
Ingiza safu mlalo chini
Italiki
Lugha
Kubwa
Kiungo
Historia ya ndani
Unganisha visanduku
Nafasi sawa
Badiliko linalofuata
Bado hakuna historia
Hakuna lugha
Hakuna maandishi yaliyochaguliwa.
Orodha yenye nambari
Sawa
Fungua
Machungwa
Bandika
Ubandikaji ulighairiwa kwa sababu hati ilibadilika.
Waridi
Onyesho la awali
Badiliko lililotangulia
Zambarau
Nukuu
Ondoa ingizo hili
Bila serif
Hifadhi
Hifadhi kama {ext}
Yenye serif
Vidokezo vya mikato
Ndogo
Piga mstari katikati
Hati ndogo
Hati juu
Jedwali
Rangi ya maandishi
Ukubwa wa maandishi
Historia ya ndani haipatikani kwa sababu kivinjari kimezuia ufikiaji wa hifadhi.\nIkiwa umefungua faili ya ndani (file://), tafadhali fungua ukurasa kupitia seva ya wavuti.
Hii itafuta historia yote ya ndani na haiwezi kutenduliwa. Endelea?
Hati hii ina mabadiliko ambayo hayajahifadhiwa. Uifungue hata hivyo?
Hii itaondoa ingizo na haiwezi kutenduliwa. Endelea?
Washa/zima upangaji
Upau wa zana
Aina ya herufi
Pigia mstari
Pakia
Tazama picha
Urujuani
Tafadhali andika hapa…
Njano
Upana wa YouTube
Upakiaji unaendelea. Tafadhali jaribu tena baada ya kukamilika.
imeundwa {when}
sasa hivi
hadi {max} kwa kundi moja
{name} — aina ya faili haikubaliki
{name} — faili ni tupu
{name} — hadi {max} kwa kila faili
{name} — upakiaji umeshindwa
siku {n} zilizopita
Faili {n} hazikuweza kupakiwa
saa {n} zilizopita
dakika {n} zilizopita
`);

const TA = rows(String.raw`
(தர இழப்புடன்)
முகவரி
நடுவில் சீரமை
இடப்புறம் சீரமை
வலப்புறம் சீரமை
சீரமைப்பு
அம்பர்
பயன்படுத்து
இணைப்பு
நீலம்
தடித்த
புள்ளிப் பட்டியல்
ரத்துசெய்
மாற்றங்கள் மட்டும்
சரிபார்ப்புப் பட்டியல்
கோப்புகளைத் தேர்ந்தெடு
அனைத்தையும் அழி
வடிவமைப்பை அழி
மூடு
குறியீடு
உறுதிசெய்
சூழல் பட்டை
பவளம்
தற்போதைய அமர்வு
கையெழுத்து
சியான்
இயல்புநிலை
நிரலை அழி
வரிசையை அழி
விவரங்கள்
ஒப்பீடு
காட்சிப் பெயர்
பிரிப்பான்
ஆவண ஒப்பீடு
ஆவண ஒப்பீட்டுக் கட்டுப்பாடுகள்
முதலெழுத்தை பெரிதாக்கு
கோப்புகளை இங்கே விடுங்கள்
முழுத்திரையிலிருந்து வெளியேறு
மிகப் பெரியது
மிகச் சிறியது
கோப்புப் பெயர்
வடிவப் பிழை — தரவைப் படிக்க முடியவில்லை
முழுத்திரை
பச்சை
இந்த நிரலைத் தலைப்பாக்கு
இந்த வரிசையைத் தலைப்பாக்கு
தலைப்பு
தலைப்பு 1
தலைப்பு 2
தலைப்பு 3
தலைப்பு 4
தலைப்பு 5
தலைப்பு 6
தனிப்படுத்து
படம்
பட அகலம்
இடப்புறம் நிரலைச் சேர்
வலப்புறம் நிரலைச் சேர்
மேலே வரிசையைச் சேர்
கீழே வரிசையைச் சேர்
சாய்வு
மொழி
பெரியது
இணைப்பு
உள்ளூர் வரலாறு
கலங்களை ஒன்றிணை
ஒற்றை அகலம்
அடுத்த மாற்றம்
இன்னும் வரலாறு இல்லை
மொழி இல்லை
உரை தேர்ந்தெடுக்கப்படவில்லை.
எண்ணிட்ட பட்டியல்
சரி
திற
ஆரஞ்சு
ஒட்டு
ஆவணம் மாறியதால் ஒட்டுதல் ரத்துசெய்யப்பட்டது.
இளஞ்சிவப்பு
முன்னோட்டம்
முந்தைய மாற்றம்
ஊதா
மேற்கோள்
இந்தப் பதிவை நீக்கு
செரிஃப் இல்லாதது
சேமி
{ext} ஆகச் சேமி
செரிஃப்
குறுக்குவழிக் குறிப்புகள்
சிறியது
குறுக்குக்கோடு
கீழெழுத்து
மேலெழுத்து
அட்டவணை
உரை நிறம்
உரை அளவு
உலாவி சேமிப்பக அணுகலைக் கட்டுப்படுத்தியுள்ளதால் உள்ளூர் வரலாற்றைப் பயன்படுத்த முடியவில்லை.\nஉள்ளூர் கோப்பை (file://) திறந்திருந்தால், வலைச் சேவையகம் வழியாகப் பக்கத்தைத் திறக்கவும்.
இது முழு உள்ளூர் வரலாற்றையும் அழிக்கும்; இதை மீட்டெடுக்க முடியாது. தொடரவா?
இந்த ஆவணத்தில் சேமிக்காத மாற்றங்கள் உள்ளன. இருந்தும் திறக்கவா?
இது பதிவை நீக்கும்; இதை மீட்டெடுக்க முடியாது. தொடரவா?
வரிசைப்படுத்தலை மாற்று
கருவிப்பட்டை
எழுத்துரு
அடிக்கோடு
பதிவேற்று
படத்தைப் பார்
வயலெட்
இங்கே எழுதுங்கள்…
மஞ்சள்
YouTube அகலம்
பதிவேற்றம் நடைபெறுகிறது. முடிந்த பிறகு மீண்டும் முயற்சிக்கவும்.
{when} அன்று உருவாக்கப்பட்டது
இப்போதுதான்
ஒரு தொகுதியில் அதிகபட்சம் {max}
{name} — கோப்பு வகை ஏற்கப்படவில்லை
{name} — கோப்பு காலியாக உள்ளது
{name} — ஒரு கோப்புக்கு அதிகபட்சம் {max}
{name} — பதிவேற்றம் தோல்வியடைந்தது
{n} நாட்களுக்கு முன்
{n} கோப்புகளைப் பதிவேற்ற முடியவில்லை
{n} மணி நேரத்திற்கு முன்
{n} நிமிடங்களுக்கு முன்
`);

const TH = rows(String.raw`
(อาจสูญเสียข้อมูล)
ที่อยู่
จัดกึ่งกลาง
จัดชิดซ้าย
จัดชิดขวา
การจัดแนว
สีอำพัน
นำไปใช้
ไฟล์แนบ
สีน้ำเงิน
ตัวหนา
รายการหัวข้อย่อย
ยกเลิก
เฉพาะการเปลี่ยนแปลง
รายการตรวจสอบ
เลือกไฟล์
ล้างทั้งหมด
ล้างการจัดรูปแบบ
ปิด
โค้ด
ยืนยัน
แถบบริบท
สีปะการัง
เซสชันปัจจุบัน
ลายมือ
สีฟ้าอมเขียว
ค่าเริ่มต้น
ลบคอลัมน์
ลบแถว
รายละเอียด
เปรียบเทียบ
ชื่อที่แสดง
เส้นแบ่ง
เปรียบเทียบเอกสาร
ตัวควบคุมการเปรียบเทียบเอกสาร
อักษรนำขนาดใหญ่
กรุณาวางไฟล์ที่นี่
ออกจากโหมดเต็มหน้าจอ
ใหญ่มาก
เล็กมาก
ชื่อไฟล์
รูปแบบผิดพลาด — ไม่สามารถอ่านข้อมูลได้
เต็มหน้าจอ
สีเขียว
ตั้งคอลัมน์นี้เป็นส่วนหัว
ตั้งแถวนี้เป็นส่วนหัว
หัวเรื่อง
หัวเรื่อง 1
หัวเรื่อง 2
หัวเรื่อง 3
หัวเรื่อง 4
หัวเรื่อง 5
หัวเรื่อง 6
ไฮไลต์
รูปภาพ
ความกว้างรูปภาพ
แทรกคอลัมน์ทางซ้าย
แทรกคอลัมน์ทางขวา
แทรกแถวด้านบน
แทรกแถวด้านล่าง
ตัวเอียง
ภาษา
ใหญ่
ลิงก์
ประวัติในเครื่อง
ผสานเซลล์
ความกว้างคงที่
การเปลี่ยนแปลงถัดไป
ยังไม่มีประวัติ
ไม่มีภาษา
ไม่ได้เลือกข้อความ
รายการลำดับเลข
ตกลง
เปิด
สีส้ม
วาง
ยกเลิกการวางเนื่องจากเอกสารมีการเปลี่ยนแปลง
สีชมพู
แสดงตัวอย่าง
การเปลี่ยนแปลงก่อนหน้า
สีม่วง
คำพูดอ้างอิง
ลบรายการนี้
ไม่มีเชิง
บันทึก
บันทึกเป็น {ext}
มีเชิง
คำแนะนำแป้นลัด
เล็ก
ขีดทับ
ตัวห้อย
ตัวยก
ตาราง
สีข้อความ
ขนาดข้อความ
ไม่สามารถใช้ประวัติในเครื่องได้ เนื่องจากเบราว์เซอร์จำกัดการเข้าถึงพื้นที่จัดเก็บ\nหากเปิดไฟล์ในเครื่อง (file://) กรุณาเปิดหน้าผ่านเว็บเซิร์ฟเวอร์
การดำเนินการนี้จะล้างประวัติในเครื่องทั้งหมดและย้อนกลับไม่ได้ ดำเนินการต่อหรือไม่
เอกสารนี้มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการเปิดต่อหรือไม่
การดำเนินการนี้จะลบรายการและย้อนกลับไม่ได้ ดำเนินการต่อหรือไม่
สลับการเรียงลำดับ
แถบเครื่องมือ
แบบอักษร
ขีดเส้นใต้
อัปโหลด
ดูรูปภาพ
สีไวโอเล็ต
กรุณาเขียนที่นี่…
สีเหลือง
ความกว้าง YouTube
กำลังอัปโหลด กรุณาลองอีกครั้งหลังจากอัปโหลดเสร็จสิ้น
สร้างเมื่อ {when}
เมื่อสักครู่
สูงสุด {max} ต่อหนึ่งชุด
{name} — ไม่รองรับชนิดไฟล์
{name} — ไฟล์ว่าง
{name} — สูงสุด {max} ต่อไฟล์
{name} — อัปโหลดไม่สำเร็จ
{n} วันที่แล้ว
อัปโหลดไฟล์ {n} ไฟล์ไม่สำเร็จ
{n} ชั่วโมงที่แล้ว
{n} นาทีที่แล้ว
`);

const BY_LOCALE: Readonly<Record<string, readonly string[]>> = {
  fa: FA,
  mr: MR,
  vi: VI,
  te: TE,
  ha: HA,
  tr: TR,
  sw: SW,
  ta: TA,
  th: TH,
  it: IT,
};

const OLD_KEYS = rows(String.raw`
Cancel
Apply
Toolbar
Context bar
Paste was canceled because the document changed.
Shortcut hints
Choose files
created {when}
just now
{n} min ago
{n} h ago
{n} d ago
Previous change
Next change
Changes only
Document diff
Document diff controls
Diff
View image
`);

const OLD_BY_LOCALE: Readonly<Record<string, readonly string[]>> = {
  zh: rows(String.raw`
取消
应用
工具栏
上下文栏
由于文档已更改，已取消粘贴。
快捷键提示
选择文件
创建于 {when}
刚刚
{n} 分钟前
{n} 小时前
{n} 天前
上一处更改
下一处更改
仅显示更改
文档比较
文档比较控件
比较
查看图片
`),
  hi: rows(String.raw`
रद्द करें
लागू करें
टूलबार
संदर्भ पट्टी
दस्तावेज़ बदलने के कारण चिपकाना रद्द कर दिया गया।
शॉर्टकट संकेत
फ़ाइलें चुनें
{when} बनाया गया
अभी-अभी
{n} मिनट पहले
{n} घंटे पहले
{n} दिन पहले
पिछला बदलाव
अगला बदलाव
केवल बदलाव
दस्तावेज़ तुलना
दस्तावेज़ तुलना नियंत्रण
तुलना
छवि देखें
`),
  es: rows(String.raw`
Cancelar
Aplicar
Barra de herramientas
Barra contextual
Se canceló el pegado porque el documento cambió.
Indicaciones de atajos
Elegir archivos
creado {when}
ahora mismo
hace {n} min
hace {n} h
hace {n} d
Cambio anterior
Cambio siguiente
Solo cambios
Comparación de documentos
Controles de comparación de documentos
Comparar
Ver imagen
`),
  ar: rows(String.raw`
إلغاء
تطبيق
شريط الأدوات
شريط السياق
أُلغي اللصق لأن المستند تغيّر.
تلميحات الاختصارات
اختيار الملفات
أُنشئ في {when}
الآن
قبل {n} دقيقة
قبل {n} ساعة
قبل {n} يوم
التغيير السابق
التغيير التالي
التغييرات فقط
مقارنة المستند
عناصر تحكم مقارنة المستند
مقارنة
عرض الصورة
`),
  fr: rows(String.raw`
Annuler
Appliquer
Barre d’outils
Barre contextuelle
Le collage a été annulé car le document a changé.
Indications de raccourcis
Choisir des fichiers
créé {when}
à l’instant
il y a {n} min
il y a {n} h
il y a {n} j
Modification précédente
Modification suivante
Modifications uniquement
Comparaison de documents
Commandes de comparaison de documents
Comparer
Voir l’image
`),
  bn: rows(String.raw`
বাতিল
প্রয়োগ করুন
টুলবার
প্রসঙ্গ বার
নথি বদলে যাওয়ায় পেস্ট বাতিল করা হয়েছে।
শর্টকাট ইঙ্গিত
ফাইল বেছে নিন
{when} তৈরি
এইমাত্র
{n} মিনিট আগে
{n} ঘণ্টা আগে
{n} দিন আগে
আগের পরিবর্তন
পরের পরিবর্তন
শুধু পরিবর্তন
নথি তুলনা
নথি তুলনা নিয়ন্ত্রণ
তুলনা
ছবি দেখুন
`),
  pt: rows(String.raw`
Cancelar
Aplicar
Barra de ferramentas
Barra de contexto
A colagem foi cancelada porque o documento mudou.
Dicas de atalhos
Escolher ficheiros
criado {when}
agora mesmo
há {n} min
há {n} h
há {n} d
Alteração anterior
Alteração seguinte
Apenas alterações
Comparação de documentos
Controlos de comparação de documentos
Comparar
Ver imagem
`),
  ru: rows(String.raw`
Отмена
Применить
Панель инструментов
Контекстная панель
Вставка отменена, потому что документ изменился.
Подсказки сочетаний клавиш
Выбрать файлы
создано {when}
только что
{n} мин назад
{n} ч назад
{n} дн назад
Предыдущее изменение
Следующее изменение
Только изменения
Сравнение документов
Элементы управления сравнением документов
Сравнить
Просмотреть изображение
`),
  id: rows(String.raw`
Batal
Terapkan
Bilah alat
Bilah konteks
Penempelan dibatalkan karena dokumen berubah.
Petunjuk pintasan
Pilih berkas
dibuat {when}
baru saja
{n} mnt lalu
{n} jam lalu
{n} hari lalu
Perubahan sebelumnya
Perubahan berikutnya
Hanya perubahan
Perbandingan dokumen
Kontrol perbandingan dokumen
Bandingkan
Lihat gambar
`),
  ur: rows(String.raw`
منسوخ کریں
لاگو کریں
ٹول بار
سیاقی بار
دستاویز بدلنے کی وجہ سے چسپاں کرنا منسوخ کر دیا گیا۔
شارٹ کٹ اشارے
فائلیں منتخب کریں
{when} بنایا گیا
ابھی
{n} منٹ پہلے
{n} گھنٹے پہلے
{n} دن پہلے
پچھلی تبدیلی
اگلی تبدیلی
صرف تبدیلیاں
دستاویز کا موازنہ
دستاویز موازنہ کے کنٹرولز
موازنہ
تصویر دیکھیں
`),
  de: rows(String.raw`
Abbrechen
Anwenden
Werkzeugleiste
Kontextleiste
Das Einfügen wurde abgebrochen, weil sich das Dokument geändert hat.
Tastenkürzel-Hinweise
Dateien auswählen
erstellt {when}
gerade eben
vor {n} Min.
vor {n} Std.
vor {n} Tg.
Vorherige Änderung
Nächste Änderung
Nur Änderungen
Dokumentvergleich
Steuerelemente für den Dokumentvergleich
Vergleichen
Bild anzeigen
`),
  ja: rows(String.raw`
キャンセル
適用
ツールバー
コンテキストバー
文書が変更されたため、貼り付けをキャンセルしました。
ショートカットのヒント
ファイルを選択
{when} に作成
たった今
{n} 分前
{n} 時間前
{n} 日前
前の変更
次の変更
変更のみ
文書の比較
文書比較コントロール
比較
画像を表示
`),
};

const MERGE_KEYS = rows(String.raw`
Apply previous content
Base version
Editable result
Incoming version
{count} conflicts remaining
All conflicts resolved
Previous conflict
Next conflict
Confirm
Submitting...
Confirmed
Restore base version
Accept incoming version
Resolve with current content
The conflict range changed during editing. Review it and resolve with current content.
Conflict {index} of {count}
Submission failed. Your edits are preserved. Please try again.
`);

const MERGE_BY_LOCALE: Readonly<Record<string, readonly string[]>> = {
  zh: rows(String.raw`
应用先前内容
编辑开始时的版本
可编辑的结果
新保存的版本
剩余 {count} 处冲突
所有冲突已解决
上一处冲突
下一处冲突
确认
正在提交...
已确认
恢复编辑开始时的版本
采用新保存的版本
使用当前内容解决
编辑过程中冲突范围发生了变化。请检查后使用当前内容解决。
第 {index} 处冲突，共 {count} 处
提交失败。您的编辑内容已保留。请重试。
`),
  hi: rows(String.raw`
पिछली सामग्री लागू करें
संपादन शुरू करते समय का संस्करण
संपादन योग्य परिणाम
नया सहेजा गया संस्करण
{count} टकराव शेष हैं
सभी टकराव हल हो गए
पिछला टकराव
अगला टकराव
पुष्टि करें
जमा किया जा रहा है...
पुष्टि हो गई
संपादन शुरू करते समय का संस्करण बहाल करें
नया सहेजा गया संस्करण अपनाएँ
वर्तमान सामग्री से हल करें
संपादन के दौरान टकराव का दायरा बदल गया। जाँचकर वर्तमान सामग्री से हल करें।
टकराव {index} / {count}
जमा नहीं हो पाया। आपके संपादन सुरक्षित हैं। कृपया फिर से प्रयास करें।
`),
  es: rows(String.raw`
Aplicar el contenido anterior
Versión al empezar a editar
Resultado editable
Nueva versión guardada
Quedan {count} conflictos
Todos los conflictos están resueltos
Conflicto anterior
Conflicto siguiente
Confirmar
Enviando...
Confirmado
Restaurar la versión inicial
Aceptar la nueva versión guardada
Resolver con el contenido actual
El alcance del conflicto cambió durante la edición. Revíselo y resuélvalo con el contenido actual.
Conflicto {index} de {count}
No se pudo enviar. Sus cambios se conservan. Vuelva a intentarlo, por favor.
`),
  ar: rows(String.raw`
تطبيق المحتوى السابق
الإصدار عند بدء التحرير
النتيجة القابلة للتحرير
الإصدار المحفوظ حديثًا
عدد التعارضات المتبقية: {count}
تم حل جميع التعارضات
التعارض السابق
التعارض التالي
تأكيد
جارٍ الإرسال...
تم التأكيد
استعادة الإصدار عند بدء التحرير
اعتماد الإصدار المحفوظ حديثًا
الحل بالمحتوى الحالي
تغير نطاق التعارض أثناء التحرير. يرجى مراجعته وحله بالمحتوى الحالي.
التعارض {index} من {count}
تعذر الإرسال. تعديلاتك محفوظة. يرجى المحاولة مرة أخرى.
`),
  fr: rows(String.raw`
Appliquer le contenu précédent
Version au début de la modification
Résultat modifiable
Nouvelle version enregistrée
{count} conflits restants
Tous les conflits sont résolus
Conflit précédent
Conflit suivant
Confirmer
Envoi en cours...
Confirmé
Restaurer la version initiale
Accepter la nouvelle version enregistrée
Résoudre avec le contenu actuel
La zone du conflit a changé pendant la modification. Vérifiez-la et résolvez le conflit avec le contenu actuel.
Conflit {index} sur {count}
Échec de l’envoi. Vos modifications sont conservées. Veuillez réessayer.
`),
  bn: rows(String.raw`
আগের বিষয়বস্তু প্রয়োগ করুন
সম্পাদনা শুরুর সংস্করণ
সম্পাদনাযোগ্য ফলাফল
নতুন সংরক্ষিত সংস্করণ
{count}টি বিরোধ বাকি আছে
সব বিরোধ সমাধান হয়েছে
আগের বিরোধ
পরের বিরোধ
নিশ্চিত করুন
জমা দেওয়া হচ্ছে...
নিশ্চিত করা হয়েছে
সম্পাদনা শুরুর সংস্করণ ফিরিয়ে আনুন
নতুন সংরক্ষিত সংস্করণ গ্রহণ করুন
বর্তমান বিষয়বস্তু দিয়ে সমাধান করুন
সম্পাদনার সময় বিরোধের পরিসর বদলেছে। পরীক্ষা করে বর্তমান বিষয়বস্তু দিয়ে সমাধান করুন।
বিরোধ {index} / {count}
জমা দেওয়া যায়নি। আপনার সম্পাদনা সংরক্ষিত আছে। অনুগ্রহ করে আবার চেষ্টা করুন।
`),
  pt: rows(String.raw`
Aplicar o conteúdo anterior
Versão no início da edição
Resultado editável
Nova versão guardada
Restam {count} conflitos
Todos os conflitos resolvidos
Conflito anterior
Conflito seguinte
Confirmar
A enviar...
Confirmado
Restaurar a versão inicial
Aceitar a nova versão guardada
Resolver com o conteúdo atual
A área do conflito mudou durante a edição. Reveja-a e resolva o conflito com o conteúdo atual.
Conflito {index} de {count}
Não foi possível enviar. As suas alterações foram preservadas. Por favor, tente novamente.
`),
  ru: rows(String.raw`
Применить прежнее содержимое
Версия на момент начала редактирования
Редактируемый результат
Новая сохранённая версия
Осталось конфликтов: {count}
Все конфликты разрешены
Предыдущий конфликт
Следующий конфликт
Подтвердить
Отправка...
Подтверждено
Восстановить исходную версию
Принять новую сохранённую версию
Разрешить с текущим содержимым
Область конфликта изменилась при редактировании. Проверьте её и разрешите конфликт с текущим содержимым.
Конфликт {index} из {count}
Не удалось отправить. Ваши изменения сохранены. Повторите попытку.
`),
  id: rows(String.raw`
Terapkan isi sebelumnya
Versi saat mulai menyunting
Hasil yang dapat disunting
Versi baru yang tersimpan
Tersisa {count} konflik
Semua konflik telah diselesaikan
Konflik sebelumnya
Konflik berikutnya
Konfirmasi
Mengirim...
Dikonfirmasi
Pulihkan versi awal
Terima versi baru yang tersimpan
Selesaikan dengan isi saat ini
Cakupan konflik berubah selama penyuntingan. Tinjau dan selesaikan dengan isi saat ini.
Konflik {index} dari {count}
Pengiriman gagal. Suntingan Anda tetap tersimpan. Silakan coba lagi.
`),
  ur: rows(String.raw`
پچھلا مواد لاگو کریں
ترمیم شروع کرتے وقت کا ورژن
قابل ترمیم نتیجہ
نیا محفوظ شدہ ورژن
{count} ٹکراؤ باقی ہیں
تمام ٹکراؤ حل ہو گئے
پچھلا ٹکراؤ
اگلا ٹکراؤ
تصدیق کریں
جمع کیا جا رہا ہے...
تصدیق ہو گئی
ترمیم شروع کرتے وقت کا ورژن بحال کریں
نیا محفوظ شدہ ورژن قبول کریں
موجودہ مواد سے حل کریں
ترمیم کے دوران ٹکراؤ کی حد بدل گئی ہے۔ جائزہ لے کر موجودہ مواد سے حل کریں۔
ٹکراؤ {index} از {count}
جمع نہیں ہو سکا۔ آپ کی ترامیم محفوظ ہیں۔ براہ کرم دوبارہ کوشش کریں۔
`),
  de: rows(String.raw`
Vorherigen Inhalt übernehmen
Version zu Beginn der Bearbeitung
Bearbeitbares Ergebnis
Neu gespeicherte Version
{count} Konflikte verbleiben
Alle Konflikte gelöst
Vorheriger Konflikt
Nächster Konflikt
Bestätigen
Wird übermittelt...
Bestätigt
Ausgangsversion wiederherstellen
Neu gespeicherte Version übernehmen
Mit aktuellem Inhalt lösen
Der Konfliktbereich hat sich bei der Bearbeitung geändert. Prüfen Sie ihn und lösen Sie den Konflikt mit dem aktuellen Inhalt.
Konflikt {index} von {count}
Übermittlung fehlgeschlagen. Ihre Änderungen bleiben erhalten. Bitte versuchen Sie es erneut.
`),
  ja: rows(String.raw`
以前の内容を反映
編集開始時のバージョン
編集可能な結果
新しく保存されたバージョン
残りの競合 {count} 件
すべての競合を解決しました
前の競合
次の競合
確認
送信中...
確認済み
編集開始時のバージョンに戻す
新しく保存されたバージョンを採用
現在の内容で解決
編集中に競合の範囲が変わりました。内容を確認し、現在の内容で解決してください。
競合 {index} / {count}
送信できませんでした。編集内容は保持されています。もう一度お試しください。
`),
  fa: rows(String.raw`
اعمال محتوای قبلی
نسخه هنگام شروع ویرایش
نتیجه قابل ویرایش
نسخه تازه ذخیره‌شده
{count} تعارض باقی مانده است
همه تعارض‌ها حل شدند
تعارض قبلی
تعارض بعدی
تأیید
در حال ارسال...
تأیید شد
بازگردانی نسخه آغاز ویرایش
پذیرش نسخه تازه ذخیره‌شده
حل با محتوای فعلی
محدوده تعارض هنگام ویرایش تغییر کرد. آن را بررسی کنید و با محتوای فعلی حل کنید.
تعارض {index} از {count}
ارسال ناموفق بود. ویرایش‌های شما حفظ شده‌اند. لطفاً دوباره تلاش کنید.
`),
  mr: rows(String.raw`
मागील मजकूर लागू करा
संपादन सुरू करतानाची आवृत्ती
संपादन करता येणारा परिणाम
नव्याने जतन केलेली आवृत्ती
{count} विरोध बाकी आहेत
सर्व विरोध सोडवले
मागील विरोध
पुढील विरोध
पुष्टी करा
सादर करत आहे...
पुष्टी झाली
संपादन सुरू करतानाची आवृत्ती पुनर्संचयित करा
नव्याने जतन केलेली आवृत्ती स्वीकारा
सध्याच्या मजकुराने सोडवा
संपादनादरम्यान विरोधाची व्याप्ती बदलली. ती तपासा आणि सध्याच्या मजकुराने सोडवा.
विरोध {index} / {count}
सादर करता आले नाही. तुमचे बदल सुरक्षित आहेत. कृपया पुन्हा प्रयत्न करा.
`),
  vi: rows(String.raw`
Áp dụng nội dung trước đó
Phiên bản khi bắt đầu chỉnh sửa
Kết quả có thể chỉnh sửa
Phiên bản mới được lưu
Còn {count} xung đột
Đã giải quyết tất cả xung đột
Xung đột trước
Xung đột tiếp theo
Xác nhận
Đang gửi...
Đã xác nhận
Khôi phục phiên bản ban đầu
Chấp nhận phiên bản mới được lưu
Giải quyết bằng nội dung hiện tại
Phạm vi xung đột đã thay đổi trong khi chỉnh sửa. Hãy kiểm tra và giải quyết bằng nội dung hiện tại.
Xung đột {index} trên {count}
Gửi không thành công. Các chỉnh sửa của bạn được giữ nguyên. Vui lòng thử lại.
`),
  te: rows(String.raw`
మునుపటి విషయాన్ని వర్తింపజేయండి
సవరణ ప్రారంభించినప్పటి సంస్కరణ
సవరించగల ఫలితం
కొత్తగా సేవ్ చేసిన సంస్కరణ
{count} వైరుధ్యాలు మిగిలి ఉన్నాయి
అన్ని వైరుధ్యాలు పరిష్కరించబడ్డాయి
మునుపటి వైరుధ్యం
తదుపరి వైరుధ్యం
నిర్ధారించండి
సమర్పిస్తోంది...
నిర్ధారించబడింది
సవరణ ప్రారంభించినప్పటి సంస్కరణను పునరుద్ధరించండి
కొత్తగా సేవ్ చేసిన సంస్కరణను అంగీకరించండి
ప్రస్తుత విషయంతో పరిష్కరించండి
సవరణ సమయంలో వైరుధ్యం పరిధి మారింది. దాన్ని పరిశీలించి ప్రస్తుత విషయంతో పరిష్కరించండి.
వైరుధ్యం {index} / {count}
సమర్పించడం విఫలమైంది. మీ సవరణలు అలాగే ఉన్నాయి. దయచేసి మళ్లీ ప్రయత్నించండి.
`),
  ha: rows(String.raw`
Aiwatar da abin da ke ciki a baya
Sigar lokacin fara gyarawa
Sakamakon da za a iya gyarawa
Sabuwar sigar da aka adana
Saɓani {count} sun rage
An warware duk saɓani
Saɓanin da ya gabata
Saɓani na gaba
Tabbatar
Ana miƙawa...
An tabbatar
Maido da sigar farko
Karɓi sabuwar sigar da aka adana
Warware da abin da ke ciki yanzu
Yankin saɓanin ya canza yayin gyarawa. A duba shi sannan a warware da abin da ke ciki yanzu.
Saɓani na {index} cikin {count}
Miƙawa ta kasa. An kiyaye gyare-gyarenku. Da fatan za a sake gwadawa.
`),
  tr: rows(String.raw`
Önceki içeriği uygula
Düzenlemeye başlanan sürüm
Düzenlenebilir sonuç
Yeni kaydedilen sürüm
{count} çakışma kaldı
Tüm çakışmalar çözüldü
Önceki çakışma
Sonraki çakışma
Onayla
Gönderiliyor...
Onaylandı
Başlangıç sürümünü geri yükle
Yeni kaydedilen sürümü kabul et
Mevcut içerikle çöz
Düzenleme sırasında çakışma aralığı değişti. İnceleyip mevcut içerikle çözün.
Çakışma {index} / {count}
Gönderilemedi. Düzenlemeleriniz korundu. Lütfen tekrar deneyin.
`),
  sw: rows(String.raw`
Tumia maudhui ya awali
Toleo la wakati uhariri ulipoanza
Matokeo yanayoweza kuhaririwa
Toleo jipya lililohifadhiwa
Migongano {count} imesalia
Migongano yote imetatuliwa
Mgongano uliotangulia
Mgongano unaofuata
Thibitisha
Inawasilisha...
Imethibitishwa
Rejesha toleo la mwanzo
Kubali toleo jipya lililohifadhiwa
Tatua kwa maudhui ya sasa
Eneo la mgongano limebadilika wakati wa kuhariri. Likague na utatue kwa maudhui ya sasa.
Mgongano wa {index} kati ya {count}
Imeshindwa kuwasilisha. Mabadiliko yako yamehifadhiwa. Tafadhali jaribu tena.
`),
  ta: rows(String.raw`
முந்தைய உள்ளடக்கத்தைப் பயன்படுத்து
திருத்தத் தொடங்கியபோதுள்ள பதிப்பு
திருத்தக்கூடிய முடிவு
புதிதாகச் சேமிக்கப்பட்ட பதிப்பு
{count} முரண்பாடுகள் மீதமுள்ளன
அனைத்து முரண்பாடுகளும் தீர்க்கப்பட்டன
முந்தைய முரண்பாடு
அடுத்த முரண்பாடு
உறுதிப்படுத்து
சமர்ப்பிக்கிறது...
உறுதிப்படுத்தப்பட்டது
தொடக்கப் பதிப்பை மீட்டமை
புதிதாகச் சேமிக்கப்பட்ட பதிப்பை ஏற்றுக்கொள்
தற்போதைய உள்ளடக்கத்துடன் தீர்க்கவும்
திருத்தும்போது முரண்பாட்டின் வரம்பு மாறிவிட்டது. அதைச் சரிபார்த்து தற்போதைய உள்ளடக்கத்துடன் தீர்க்கவும்.
முரண்பாடு {index} / {count}
சமர்ப்பிக்க முடியவில்லை. உங்கள் திருத்தங்கள் பாதுகாக்கப்பட்டுள்ளன. மீண்டும் முயற்சிக்கவும்.
`),
  th: rows(String.raw`
ใช้เนื้อหาก่อนหน้า
เวอร์ชันเมื่อเริ่มแก้ไข
ผลลัพธ์ที่แก้ไขได้
เวอร์ชันที่บันทึกใหม่
เหลือข้อขัดแย้ง {count} จุด
แก้ไขข้อขัดแย้งทั้งหมดแล้ว
ข้อขัดแย้งก่อนหน้า
ข้อขัดแย้งถัดไป
ยืนยัน
กำลังส่ง...
ยืนยันแล้ว
คืนค่าเวอร์ชันเริ่มต้น
ยอมรับเวอร์ชันที่บันทึกใหม่
แก้ข้อขัดแย้งด้วยเนื้อหาปัจจุบัน
ขอบเขตข้อขัดแย้งเปลี่ยนไประหว่างการแก้ไข โปรดตรวจสอบแล้วแก้ข้อขัดแย้งด้วยเนื้อหาปัจจุบัน
ข้อขัดแย้งที่ {index} จาก {count}
ส่งไม่สำเร็จ การแก้ไขของคุณยังคงอยู่ โปรดลองอีกครั้ง
`),
  it: rows(String.raw`
Applica il contenuto precedente
Versione all'inizio della modifica
Risultato modificabile
Nuova versione salvata
{count} conflitti rimanenti
Tutti i conflitti sono risolti
Conflitto precedente
Conflitto successivo
Conferma
Invio in corso...
Confermato
Ripristina la versione iniziale
Accetta la nuova versione salvata
Risolvi con il contenuto attuale
L'area del conflitto è cambiata durante la modifica. Controllala e risolvi il conflitto con il contenuto attuale.
Conflitto {index} di {count}
Invio non riuscito. Le modifiche sono state conservate. Riprova.
`),
};

export function catalogTranslation(source: string, locale: string): string | undefined {
  const values = BY_LOCALE[locale];
  const index = KEYS.indexOf(source);
  if (values && index >= 0) return values[index];
  const oldValues = OLD_BY_LOCALE[locale];
  const oldIndex = OLD_KEYS.indexOf(source);
  if (oldValues && oldIndex >= 0) return oldValues[oldIndex];
  const mergeValues = MERGE_BY_LOCALE[locale];
  const mergeIndex = MERGE_KEYS.indexOf(source);
  return mergeValues && mergeIndex >= 0 ? mergeValues[mergeIndex] : undefined;
}

export function catalogDiagnostics(): Readonly<Record<string, number>> {
  return Object.fromEntries([
    ...Object.entries(BY_LOCALE).map(([locale, values]) => [locale, values.length] as const),
    ...Object.entries(OLD_BY_LOCALE).map(([locale, values]) => [locale, values.length] as const),
  ]);
}
