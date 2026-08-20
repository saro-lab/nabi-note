// 사전 **하나**. 코어가 자기 이름으로 하는 말만 여기 산다 — wing 의 버튼·상황 줄 이름은 그 wing 의
// 선언(`button.label`·`context[].label`)에 붙어 다닌다. wing 을 빼면 그 말도 함께 사라지는 것이
// 맞고, 그러려면 말이 wing 옆에 있어야 한다.
//
// old 의 `locale.ts` 이식 — 코어 소유의 아홉 마디는 14 로케일이 그대로 왔다. 새로 생긴 말은
// ko·en 만 채운다(폴백 규칙이 나머지를 en 으로 잇는다 — 빈 칸을 지어내지 않는다).

// 로케일 코드 → 그 말. `en` 은 폴백이라 사실상 필수다.
export type LocaleText = Readonly<Record<string, string>>;
export type Dictionary = Readonly<Record<string, LocaleText>>;

// old 가 든 14 언어. 사전이 이 목록을 강제하지는 않는다 — 목록은 호스트가 고르는 자리의 안내다.
export const LOCALES: readonly string[] = [
  'ko', 'en', 'ja', 'zh', 'de', 'fr', 'es', 'pt', 'ru', 'ar', 'hi', 'bn', 'ur', 'id',
];

// 오른쪽에서 왼쪽으로 쓰는 말 — 지금 아는 열넷 중 둘이다 (098).
// 히브리(he)·페르시아(fa)는 아직 사전에 없다. 사전이 늘면 여기도 함께 는다.
export const RTL_LOCALES: readonly string[] = ['ar', 'ur'];

// 말 하나의 글 방향. 모르는 말은 왼쪽에서 오른쪽이다 — 폴백(en)과 같은 결이다.
//
// **왜 사전 옆에 사는가**: 방향은 번역문처럼 그 말에 딸린 사실이고, 화면 층이 정할 것이 아니다.
// 서버(`nabi-note/ssr`)도 이 답을 알아야 미리 그린 HTML 에 같은 `dir` 을 적을 수 있다.
export function localeDirection(code: string | undefined): 'ltr' | 'rtl' {
  return code !== undefined && RTL_LOCALES.includes(code) ? 'rtl' : 'ltr';
}

export const DICTIONARY: Dictionary = {
  // --- 갈래의 이름 (`wing.<w>`) ----------------------------------------------------------------
  // ui 가 이름을 찾는 마지막 자리다: 선언에 이름이 없으면 여기를 본다
  // (`t.pick(decl.label, `wing.${wing.w}`)`). 대개는 선언이 제 이름을 들고 있어 여기 올 일이
  // 없지만, **단추를 여럿 내는 갈래**는 단추마다 제 이름이 있고 갈래 자신의 이름은 없다
  // 정렬이 그렇다(왼쪽·가운데·오른쪽 셋이 줄에 나란히 선다). 목록에서 그 갈래를 한 낱말로
  // 불러야 하는 쪽(문서 사이트의 wing 칩 같은)이 이 이름을 쓴다.
  'wing.align': {
    ko: '정렬', en: 'Alignment', ja: '配置', zh: '对齐', de: 'Ausrichtung', fr: 'Alignement',
    es: 'Alineación', pt: 'Alinhamento', ru: 'Выравнивание', ar: 'محاذاة', hi: 'संरेखण',
    bn: 'সারিবদ্ধতা', ur: 'سیدھ', id: 'Perataan',
  },

  // --- old 코어 아홉 마디 (14 로케일 그대로) ---------------------------------------------------
  preview: {
    ko: '미리보기', en: 'Preview', ja: 'プレビュー', zh: '预览', de: 'Vorschau', fr: 'Aperçu',
    es: 'Vista previa', pt: 'Pré-visualizar', ru: 'Предпросмотр', ar: 'معاينة', hi: 'पूर्वावलोकन',
    bn: 'প্রিভিউ', ur: 'پیش منظر', id: 'Pratinjau',
  },
  close: {
    ko: '닫기', en: 'Close', ja: '閉じる', zh: '关闭', de: 'Schließen', fr: 'Fermer', es: 'Cerrar',
    pt: 'Fechar', ru: 'Закрыть', ar: 'إغلاق', hi: 'बंद करें', bn: 'বন্ধ করুন', ur: 'بند کریں',
    id: 'Tutup',
  },
  confirm: {
    ko: '확인', en: 'Confirm', ja: '確定', zh: '确定', de: 'Bestätigen', fr: 'Valider', es: 'Aceptar',
    pt: 'Confirmar', ru: 'Подтвердить', ar: 'تأكيد', hi: 'पुष्टि करें', bn: 'নিশ্চিত করুন',
    ur: 'تصدیق کریں', id: 'Konfirmasi',
  },
  fullscreenEnter: {
    ko: '전체화면', en: 'Fullscreen', ja: '全画面', zh: '全屏', de: 'Vollbild', fr: 'Plein écran',
    es: 'Pantalla completa', pt: 'Tela cheia', ru: 'Полный экран', ar: 'ملء الشاشة',
    hi: 'पूर्ण स्क्रीन', bn: 'পূর্ণ স্ক্রিন', ur: 'فل اسکرین', id: 'Layar penuh',
  },
  fullscreenExit: {
    ko: '전체화면 끄기', en: 'Exit fullscreen', ja: '全画面を終了', zh: '退出全屏',
    de: 'Vollbild beenden', fr: 'Quitter le plein écran', es: 'Salir de pantalla completa',
    pt: 'Sair da tela cheia', ru: 'Выйти из полноэкранного режима', ar: 'إنهاء ملء الشاشة',
    hi: 'पूर्ण स्क्रीन से बाहर निकलें', bn: 'পূর্ণ স্ক্রিন বন্ধ করুন', ur: 'فل اسکرین بند کریں',
    id: 'Keluar dari layar penuh',
  },
  drop: {
    ko: '여기에 파일을 놓으세요', en: 'Drop files here', ja: 'ここにファイルをドロップ',
    zh: '将文件拖放到此处', de: 'Dateien hier ablegen', fr: 'Déposez les fichiers ici',
    es: 'Suelta los archivos aquí', pt: 'Solte os arquivos aqui', ru: 'Перетащите файлы сюда',
    ar: 'أفلِت الملفات هنا', hi: 'फ़ाइलें यहाँ छोड़ें', bn: 'ফাইল এখানে ছাড়ুন',
    ur: 'فائلیں یہاں چھوڑیں', id: 'Letakkan berkas di sini',
  },
  // 물어보는 판의 확인 단추 글자 (084 ⑧). ▶ svg 를 걷고 그 자리에 선 글자다.
  //
  // `confirm` 과 따로 사는 까닭: `confirm` 은 **물음에 답하는 말**이고("정말 지울까요?" 의
  // 예), 이것은 적어 넣은 값을 넣겠다는 **한 줄짜리 단추**다. 단추는 주소 칸 옆에 나란히
  // 서므로 짧아야 한다 — `confirm` 을 그대로 쓰면 러시아어의 'Подтвердить' 처럼 칸보다 넓은
  // 말이 몇 나라에서 그 자리를 차지한다. 그래서 나라마다 **그 나라의 확인 단추 글자**를 든다
  // (많은 말이 'OK' 를 그대로 쓴다 — 지어낸 번역이 아니라 그 나라 화면의 관례다).
  // 사람이 읽고 누르는 자리라 14 로케일을 다 채운다 — 폴백으로 en 을 보이면 안 된다.
  ok: {
    ko: '확인', en: 'OK', ja: 'OK', zh: '确定', de: 'OK', fr: 'OK', es: 'Aceptar', pt: 'OK',
    ru: 'OK', ar: 'موافق', hi: 'ठीक है', bn: 'ঠিক আছে', ur: 'ٹھیک ہے', id: 'OK',
  },
  // 마크 단추를 직접 클릭했는데 캐럿이 접혀 있을 때 (084 ⑨) — 포인터 손은 예약을 안 만들므로
  // 이 말이 침묵의 자리를 대신한다.
  //
  // **한 마디로 끝낸다** (주인 지시 2026-08-18: "선택된 글자가 없습니다." 처럼 간결하게).
  // 앞판은 "…없습니다 — 먼저 글자를 선택하세요" 로 사실과 지시를 겹쳐 말했는데, 1초 사는 말에
  // 두 마디는 길다. 무엇이 없는지만 말하면 무엇을 해야 하는지는 저절로 읽힌다.
  noTarget: {
    ko: '선택된 글자가 없습니다.',
    en: 'No text selected.',
    ja: '文字が選択されていません。',
    zh: '未选择文字。',
    de: 'Kein Text ausgewählt.',
    fr: 'Aucun texte sélectionné.',
    es: 'No hay texto seleccionado.',
    pt: 'Nenhum texto selecionado.',
    ru: 'Текст не выделен.',
    ar: 'لم يُحدَّد أي نص.',
    hi: 'कोई टेक्स्ट चयनित नहीं है।',
    bn: 'কোনো লেখা নির্বাচিত হয়নি।',
    ur: 'کوئی متن منتخب نہیں ہے۔',
    id: 'Tidak ada teks yang dipilih.',
  },
  // 11 이 `mountFile` 에 한국어로 박아 둔 그 말이 여기로 왔다 — 문구는 사전의 것이다.
  openWhileChanged: {
    ko: '작성 중인 문서가 있습니다. 그래도 여시겠습니까?',
    en: 'This document has unsaved changes. Open anyway?',
    ja: '編集中の文書があります。それでも開きますか？', zh: '当前文档有未保存的更改。仍要打开吗？',
    de: 'Dieses Dokument hat ungespeicherte Änderungen. Trotzdem öffnen?',
    fr: 'Ce document a des modifications non enregistrées. Ouvrir quand même ?',
    es: 'Este documento tiene cambios sin guardar. ¿Abrir de todos modos?',
    pt: 'Este documento tem alterações não salvas. Abrir mesmo assim?',
    ru: 'В документе есть несохранённые изменения. Всё равно открыть?',
    ar: 'يحتوي هذا المستند على تغييرات غير محفوظة. هل تريد الفتح على أي حال؟',
    hi: 'इस दस्तावेज़ में सेव न किए गए बदलाव हैं। फिर भी खोलें?',
    bn: 'এই নথিতে অসংরক্ষিত পরিবর্তন আছে। তবুও খুলবেন?',
    ur: 'اس دستاویز میں غیر محفوظ تبدیلیاں ہیں۔ پھر بھی کھولیں؟',
    id: 'Dokumen ini memiliki perubahan yang belum disimpan. Tetap buka?',
  },
  formatError: {
    ko: '형식 오류 — 데이터를 읽을 수 없습니다', en: 'Format error — the data could not be read',
    ja: '形式エラー — データを読み取れません', zh: '格式错误 — 无法读取数据',
    de: 'Formatfehler — die Daten konnten nicht gelesen werden',
    fr: 'Erreur de format — impossible de lire les données',
    es: 'Error de formato — no se pudieron leer los datos',
    pt: 'Erro de formato — não foi possível ler os dados',
    ru: 'Ошибка формата — не удалось прочитать данные',
    ar: 'خطأ في التنسيق — تعذّرت قراءة البيانات',
    hi: 'फ़ॉर्मैट त्रुटि — डेटा पढ़ा नहीं जा सका', bn: 'ফরম্যাট ত্রুটি — ডেটা পড়া যায়নি',
    ur: 'فارمیٹ کی خرابی — ڈیٹا پڑھا نہیں جا سکا', id: 'Kesalahan format — data tidak dapat dibaca',
  },

  // --- 새 판이 더 쓰는 말 (ko·en — 폴백이 나머지를 en 으로 잇는다) -----------------------------
  cancel: { ko: '취소', en: 'Cancel' },
  apply: { ko: '적용', en: 'Apply' },
  toolbar: { ko: '도구 모음', en: 'Toolbar' },
  contextBar: { ko: '상황 줄', en: 'Context bar' },
  // 표 격자 피커의 읽음 — `{rows} × {cols}`.
  gridSize: { ko: '{rows} × {cols}', en: '{rows} × {cols}' },
  // 힌트(Shift 연타) 안내 — 버튼 툴팁 꼬리에 붙는다.
  hintTail: { ko: '{label} (⇧⇧ {key})', en: '{label} (⇧⇧ {key})' },
  hintsOn: { ko: '단축 힌트', en: 'Shortcut hints' },
  lightbox: { ko: '크게 보기', en: 'View image' },
  chooseFile: { ko: '파일 선택', en: 'Choose files' },
  // 빈 편집기의 안내글 — 아무것도 없을 때 첫 줄에 흐리게 선다(시트가 `--nabi-placeholder` 로
  // 읽는다). **열넷을 다 채운다**: 문서를 열면 제일 먼저, 그리고 아무 말 없이 눈에 드는
  // 한 마디라 영어 폴백이 뜨면 그 화면만 낯설어진다.
  placeholder: {
    ko: '여기에 글을 쓰세요', en: 'Write here…', ja: 'ここに入力してください', zh: '在此输入…',
    de: 'Hier schreiben …', fr: 'Écrivez ici…', es: 'Escribe aquí…', pt: 'Escreva aqui…',
    ru: 'Пишите здесь…', ar: 'اكتب هنا…', hi: 'यहाँ लिखें…', bn: 'এখানে লিখুন…',
    ur: 'یہاں لکھیں…', id: 'Tulis di sini…',
  },

  // --- 로컬 기록 판 -----------------------------------------------------------------------------
  'history.title': { ko: '로컬 기록', en: 'Local history', ja: 'ローカル履歴', zh: '本地历史', de: 'Lokaler Verlauf', fr: 'Historique local', es: 'Historial local', pt: 'Histórico local', ru: 'Локальная история', ar: 'السجل المحلي', hi: 'लोकल इतिहास', bn: 'লোকাল ইতিহাস', ur: 'مقامی تاریخ', id: 'Riwayat lokal' },
  'history.empty': { ko: '아직 기록이 없습니다.', en: 'No history yet', ja: '履歴がありません', zh: '暂无历史', de: 'Noch kein Verlauf', fr: 'Aucun historique', es: 'Sin historial', pt: 'Sem histórico', ru: 'История пуста', ar: 'لا يوجد سجل', hi: 'कोई इतिहास नहीं', bn: 'কোনো ইতিহাস নেই', ur: 'کوئی تاریخ نہیں', id: 'Belum ada riwayat' },
  'history.current': { ko: '현재 세션', en: 'Current session', ja: '現在のセッション', zh: '当前会话', de: 'Aktuelle Sitzung', fr: 'Session actuelle', es: 'Sesión actual', pt: 'Sessão atual', ru: 'Текущий сеанс', ar: 'الجلسة الحالية', hi: 'वर्तमान सत्र', bn: 'বর্তমান সেশন', ur: 'موجودہ سیشن', id: 'Sesi ini' },
  'history.clear': { ko: '전체 지우기', en: 'Clear all', ja: 'すべて削除', zh: '全部清除', de: 'Alle löschen', fr: 'Tout effacer', es: 'Borrar todo', pt: 'Limpar tudo', ru: 'Очистить всё', ar: 'مسح الكل', hi: 'सब हटाएँ', bn: 'সব মুছুন', ur: 'سب مٹا دیں', id: 'Hapus semua' },
  'history.remove': { ko: '이 줄 지우기', en: 'Remove this entry', ja: 'この履歴を削除', zh: '删除此项', de: 'Diesen Eintrag löschen', fr: 'Supprimer cette entrée', es: 'Eliminar esta entrada', pt: 'Remover esta entrada', ru: 'Удалить запись', ar: 'حذف هذا السطر', hi: 'यह प्रविष्टि हटाएँ', bn: 'এই এন্ট্রি মুছুন', ur: 'یہ اندراج حذف کریں', id: 'Hapus entri ini' },
  // 지우기는 되돌리기가 없다 — 되돌리기는 문서의 것이지 저장소의 것이 아니다. 그래서 묻는다.
  'history.clearAsk': {
    ko: '로컬 기록을 전부 지웁니다. 되돌릴 수 없습니다. 계속할까요?',
    en: 'This clears the whole local history. It cannot be undone. Continue?',
    ja: 'ローカル履歴をすべて削除します。元に戻せません。続けますか？',
    zh: '将清除全部本地历史，且无法撤销。要继续吗？',
    de: 'Der gesamte lokale Verlauf wird gelöscht. Das lässt sich nicht rückgängig machen. Fortfahren?',
    fr: 'Tout l’historique local sera effacé. C’est irréversible. Continuer ?',
    es: 'Se borrará todo el historial local. No se puede deshacer. ¿Continuar?',
    pt: 'Isto apaga todo o histórico local. Não dá para desfazer. Continuar?',
    ru: 'Вся локальная история будет удалена. Это необратимо. Продолжить?',
    ar: 'سيُمسح السجل المحلي كله، ولا يمكن التراجع. هل تتابع؟',
    hi: 'पूरा लोकल इतिहास मिट जाएगा। इसे वापस नहीं लाया जा सकता। जारी रखें?',
    bn: 'পুরো লোকাল ইতিহাস মুছে যাবে। ফেরানো যাবে না। চালিয়ে যাবেন?',
    ur: 'ساری مقامی تاریخ مٹ جائے گی۔ واپس نہیں لائی جا سکتی۔ جاری رکھیں؟',
    id: 'Seluruh riwayat lokal akan dihapus dan tidak bisa dikembalikan. Lanjutkan?',
  },
  'history.removeAsk': {
    ko: '이 기록을 지웁니다. 되돌릴 수 없습니다. 계속할까요?',
    en: 'This removes the entry. It cannot be undone. Continue?',
    ja: 'この履歴を削除します。元に戻せません。続けますか？',
    zh: '将删除此项，且无法撤销。要继续吗？',
    de: 'Dieser Eintrag wird gelöscht. Das lässt sich nicht rückgängig machen. Fortfahren?',
    fr: 'Cette entrée sera supprimée. C’est irréversible. Continuer ?',
    es: 'Se eliminará esta entrada. No se puede deshacer. ¿Continuar?',
    pt: 'Isto remove esta entrada. Não dá para desfazer. Continuar?',
    ru: 'Эта запись будет удалена. Это необратимо. Продолжить?',
    ar: 'سيُحذف هذا السطر، ولا يمكن التراجع. هل تتابع؟',
    hi: 'यह प्रविष्टि हट जाएगी। इसे वापस नहीं लाया जा सकता। जारी रखें?',
    bn: 'এই এন্ট্রি মুছে যাবে। ফেরানো যাবে না। চালিয়ে যাবেন?',
    ur: 'یہ اندراج حذف ہو جائے گا۔ واپس نہیں لایا جا سکتا۔ جاری رکھیں؟',
    id: 'Entri ini akan dihapus dan tidak bisa dikembalikan. Lanjutkan?',
  },
  // 저장소가 막힌 자리에서 wing 단추를 눌렀을 때 (084 ⑤) — **무엇을 해야 하는지**까지 든 말이라
  // 열넷을 다 채운다. 폴백으로 영어가 뜨면 "안 되는구나" 만 남고 "서버에 올리면 된다" 가 안 읽힌다.
  'history.blocked': {
    ko: '로컬 파일(file://)에서는 브라우저가 저장소를 막아 로컬 기록을 쓸 수 없다.\n서버에 올려서 열어라.',
    en: 'The browser blocks storage on local files (file://), so there is no local history here.\nServe the page from a server.',
    ja: 'ローカルファイル（file://）ではブラウザがストレージを塞ぐため、ローカル履歴は使えません。\nサーバーに置いて開いてください。',
    zh: '在本地文件（file://）下浏览器会封锁存储，无法使用本地历史。\n请放到服务器上再打开。',
    de: 'Bei lokalen Dateien (file://) sperrt der Browser den Speicher — kein lokaler Verlauf.\nBitte über einen Server öffnen.',
    fr: 'Sur un fichier local (file://), le navigateur bloque le stockage : pas d’historique local.\nOuvrez la page depuis un serveur.',
    es: 'En archivos locales (file://) el navegador bloquea el almacenamiento: no hay historial local.\nAbre la página desde un servidor.',
    pt: 'Em ficheiros locais (file://) o navegador bloqueia o armazenamento: não há histórico local.\nAbra a página a partir de um servidor.',
    ru: 'Для локальных файлов (file://) браузер блокирует хранилище — локальной истории здесь нет.\nОткройте страницу с сервера.',
    ar: 'في الملفات المحلية (file://) يمنع المتصفح التخزين، فلا يوجد سجل محلي.\nافتح الصفحة من خادم.',
    hi: 'लोकल फ़ाइल (file://) पर ब्राउज़र स्टोरेज रोक देता है, इसलिए लोकल इतिहास नहीं चलता।\nपेज को सर्वर से खोलें।',
    bn: 'লোকাল ফাইলে (file://) ব্রাউজার স্টোরেজ আটকে দেয়, তাই লোকাল ইতিহাস চলে না।\nপেজটি সার্ভার থেকে খুলুন।',
    ur: 'مقامی فائل (file://) پر براؤزر اسٹوریج روک دیتا ہے، اس لیے مقامی تاریخ نہیں چلتی۔\nصفحہ سرور سے کھولیں۔',
    id: 'Pada berkas lokal (file://) peramban memblokir penyimpanan, jadi riwayat lokal tidak jalan.\nBuka halaman dari server.',
  },
  // 목록의 만든 때 — 고친 때와 벌어진 줄에만 선다. `{when}` 은 아래의 "얼마 전" 한 마디다.
  'history.created': { ko: '만든 때 {when}', en: 'created {when}' },
  'history.now': { ko: '방금', en: 'just now' },
  'history.minutes': { ko: '{n}분 전', en: '{n} min ago' },
  'history.hours': { ko: '{n}시간 전', en: '{n} h ago' },
  'history.days': { ko: '{n}일 전', en: '{n} d ago' },

  // --- 업로드가 거절할 때의 말 (14 로케일 — 이건 사람이 읽고 **무엇을 고쳐야 하는지** 아는 자리라
  //     폴백으로 en 을 보이면 안 된다) ----------------------------------------------------------
  // 자리표(`{name}`·`{max}`)는 파일 이름과 한도다.
  // 올라가는 중인 첨부의 이름 — **파일 이름이 아니다.** 올라가는 동안 알아야 하는 것은 "무엇이
  // 들어오는 중인가" 이고, 그 파일이 무엇이었는지는 끝난 뒤 링크의 글자가 말한다.
  'upload.attachment': {
    ko: '첨부파일', en: 'Attachment', ja: '添付ファイル', zh: '附件', de: 'Anhang', fr: 'Pièce jointe',
    es: 'Adjunto', pt: 'Anexo', ru: 'Вложение', ar: 'مرفق', hi: 'संलग्नक', bn: 'সংযুক্তি',
    ur: 'منسلکہ', id: 'Lampiran',
  },
  'upload.unsupported_type': {
    ko: '{name} — 받지 않는 형식입니다.', en: '{name} — file type not accepted',
    ja: '{name} — 対応していない形式です', zh: '{name} — 不支持的文件类型',
    de: '{name} — Dateityp nicht zulässig', fr: '{name} — type de fichier non accepté',
    es: '{name} — tipo de archivo no admitido', pt: '{name} — tipo de ficheiro não aceite',
    ru: '{name} — тип файла не поддерживается', ar: '{name} — نوع الملف غير مقبول',
    hi: '{name} — यह फ़ाइल प्रकार स्वीकार नहीं है', bn: '{name} — এই ফাইলের ধরন নেওয়া হয় না',
    ur: '{name} — یہ فائل قسم قابل قبول نہیں', id: '{name} — jenis berkas tidak diterima',
  },
  'upload.empty_file': {
    ko: '{name} — 빈 파일이다', en: '{name} — the file is empty',
    ja: '{name} — 空のファイルです', zh: '{name} — 文件为空',
    de: '{name} — die Datei ist leer', fr: '{name} — le fichier est vide',
    es: '{name} — el archivo está vacío', pt: '{name} — o ficheiro está vazio',
    ru: '{name} — файл пуст', ar: '{name} — الملف فارغ',
    hi: '{name} — फ़ाइल खाली है', bn: '{name} — ফাইলটি খালি',
    ur: '{name} — فائل خالی ہے', id: '{name} — berkas kosong',
  },
  'upload.file_too_large': {
    ko: '{name} — 파일 하나는 {max} 까지다', en: '{name} — up to {max} per file',
    ja: '{name} — 1ファイル {max} までです', zh: '{name} — 单个文件最大 {max}',
    de: '{name} — höchstens {max} pro Datei', fr: '{name} — {max} maximum par fichier',
    es: '{name} — hasta {max} por archivo', pt: '{name} — até {max} por ficheiro',
    ru: '{name} — не более {max} на файл', ar: '{name} — الحد {max} لكل ملف',
    hi: '{name} — प्रति फ़ाइल अधिकतम {max}', bn: '{name} — প্রতি ফাইলে সর্বোচ্চ {max}',
    ur: '{name} — فی فائل زیادہ سے زیادہ {max}', id: '{name} — maksimal {max} per berkas',
  },
  'upload.total_too_large': {
    ko: '한 번에 {max} 까지 올릴 수 있다', en: 'up to {max} in one batch',
    ja: '一度に {max} までです', zh: '一次最多 {max}',
    de: 'höchstens {max} pro Vorgang', fr: '{max} maximum par envoi',
    es: 'hasta {max} por lote', pt: 'até {max} de cada vez',
    ru: 'не более {max} за раз', ar: 'الحد {max} في المرة الواحدة',
    hi: 'एक बार में अधिकतम {max}', bn: 'একবারে সর্বোচ্চ {max}',
    ur: 'ایک بار میں زیادہ سے زیادہ {max}', id: 'maksimal {max} sekali unggah',
  },
  // --- 업로드가 실패했을 때의 말 (084 ⑦ — 예전에는 전부 침묵이던 자리다) ------------------------
  // 전송 훅이 던졌거나 주소를 못 돌려준 파일. 한 파일이면 이름을, 여럿이면 수를 말한다 —
  // 이름 다섯 개를 늘어놓으면 정작 "몇 개가 안 올라갔나" 가 안 읽힌다.
  'upload.failed': {
    ko: '{name} — 올리지 못했다', en: '{name} — upload failed',
    ja: '{name} — アップロードできませんでした', zh: '{name} — 上传失败',
    de: '{name} — Upload fehlgeschlagen', fr: '{name} — échec de l’envoi',
    es: '{name} — no se pudo subir', pt: '{name} — falha no envio',
    ru: '{name} — не удалось загрузить', ar: '{name} — تعذّر الرفع',
    hi: '{name} — अपलोड नहीं हो सका', bn: '{name} — আপলোড হয়নি',
    ur: '{name} — اپ لوڈ نہیں ہو سکا', id: '{name} — gagal diunggah',
  },
  'upload.failed_many': {
    ko: '{n}개 파일을 올리지 못했다', en: '{n} files could not be uploaded',
    ja: '{n} 件のファイルをアップロードできませんでした', zh: '{n} 个文件上传失败',
    de: '{n} Dateien konnten nicht hochgeladen werden', fr: '{n} fichiers n’ont pas pu être envoyés',
    es: 'no se pudieron subir {n} archivos', pt: '{n} ficheiros não foram enviados',
    ru: 'не удалось загрузить файлов: {n}', ar: 'تعذّر رفع {n} من الملفات',
    hi: '{n} फ़ाइलें अपलोड नहीं हो सकीं', bn: '{n}টি ফাইল আপলোড হয়নি',
    ur: '{n} فائلیں اپ لوڈ نہیں ہو سکیں', id: '{n} berkas gagal diunggah',
  },
  // 도는 배치가 있는 동안 떨어뜨린 파일 — 무시되지만, 무시됐다는 것만은 말한다(다시 하면 된다).
  'upload.busy': {
    ko: '올리는 중이다 — 끝난 뒤에 다시 놓아라', en: 'an upload is running — try again when it finishes',
    ja: 'アップロード中です — 終わってからもう一度どうぞ',
    zh: '正在上传 — 请等结束后再试', de: 'Ein Upload läuft — bitte danach erneut versuchen',
    fr: 'un envoi est en cours — réessayez une fois terminé',
    es: 'hay una subida en curso — inténtalo cuando termine',
    pt: 'há um envio em curso — tente de novo quando terminar',
    ru: 'идёт загрузка — повторите после её завершения',
    ar: 'هناك رفع جارٍ — أعد المحاولة بعد انتهائه',
    hi: 'अपलोड चल रहा है — पूरा होने पर फिर से आज़माएँ',
    bn: 'আপলোড চলছে — শেষ হলে আবার দিন',
    ur: 'اپ لوڈ جاری ہے — مکمل ہونے پر دوبارہ کوشش کریں',
    id: 'sedang mengunggah — coba lagi setelah selesai',
  },
};
