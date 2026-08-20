// Translated — the values now speak Russian; only the frame and the keys are shared with English.
// A missing key is a type error, so the file stays whole.
// 옮겼다 — 값은 이제 러시아어로 선다. 영어와 같은 것은 틀과 키뿐이다.
// 키가 하나라도 빠지면 타입 오류라 파일은 온전해야 한다.
export const ru = {
  label: 'Русский',
  lang: 'ru',
  link: '/ru/',
  description: 'NABI NOTE — WYSIWYG-редактор с открытым исходным кодом.',

  menu_docs: 'Документация',
  menu_intro: 'Введение',
  menu_intro_index: 'Что такое NABI NOTE?',
  menu_intro_usage: 'Основы использования',
  menu_intro_ssr: 'Поддержка SSR',
  menu_intro_cdn: 'Подключение с CDN',
  menu_intro_vibe_coding: 'AI-вайб-кодинг',

  menu_wing: 'Крылья (Wings)',
  menu_wing_custom: 'Своё крыло',
  menu_custom_start: 'Начало работы',
  menu_custom_inline: 'Строчные метки',
  menu_custom_block: 'Блоки и их атрибуты',
  menu_custom_ui: 'Интерфейс и действия',
  menu_custom_input: 'Клавиши, автозамена, вставка',

  menu_style: 'Оформление',
  menu_style_custom: 'Свои стили',

  menu_projects: 'Проекты',

  menu_inline: 'Строчные',
  menu_inline_bold: 'Полужирный',
  menu_inline_italic: 'Курсив',
  menu_inline_underline: 'Подчёркнутый',
  menu_inline_strikethrough: 'Зачёркнутый',
  menu_inline_superscript: 'Надстрочный',
  menu_inline_subscript: 'Подстрочный',
  menu_inline_link: 'Ссылка',
  menu_inline_highlight: 'Маркер',
  menu_inline_text_color: 'Цвет текста',

  menu_block: 'Блоки',
  menu_block_heading: 'Заголовок',
  menu_block_bullet_list: 'Маркированный список',
  menu_block_ordered_list: 'Нумерованный список',
  menu_block_task_list: 'Список задач',
  menu_block_table: 'Таблица',
  menu_block_image: 'Изображение',
  menu_block_youtube: 'YouTube',
  menu_block_code: 'Код',
  menu_block_details: 'Спойлер',
  menu_block_quote: 'Цитата',
  menu_block_divider: 'Разделитель',

  menu_etc: 'Прочее',
  menu_etc_align: 'Выравнивание',
  menu_etc_dropcap: 'Буквица',
  menu_etc_typeface: 'Гарнитура',
  menu_etc_font_size: 'Размер текста',
  menu_etc_clear_format: 'Очистить форматирование',
  menu_etc_upload: 'Загрузить файл',

  search: 'Поиск',
  search_no_results: 'Ничего не найдено',
  search_hint: 'Введите поисковый запрос',
  search_move: 'Перемещение',
  search_open: 'Открыть',
  search_close: 'Закрыть',

  demo_placeholder: 'Напишите что-нибудь',
  // Exercises every wing but YouTube — no stranger's video on the front page
  // 유튜브만 빼고 기본 날개 전부를 써 보인다 — 앞면에 남의 영상을 걸지 않는다
  demo_html: `<p data-nabi-align="c">Сейчас документация создаётся и переводится с помощью AI.</p><p data-nabi-align="c">Когда всё уляжется, станет версией 1.0.0.</p><div data-nabi-p data-nabi-align="c"><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><h1 data-nabi-align="c">NABI NOTE</h1><p data-nabi-align="c"><span data-nabi-size="lg"><i><span data-nabi-typeface="cursive">Редактор WYSIWYG с открытым кодом</span></i></span></p><p><br/></p><p data-nabi-dropcap="1"><span data-nabi-typeface="serif"><b>NABI NOTE</b> — редактор WYSIWYG с открытым кодом, в котором каждая крупная возможность — оформление, выравнивание, таблицы, загрузки и прочее — вынесена из ядра в отдельный модуль, называемый «крылом», так что разработчик может дополнять его без всяких границ. Он написан на чистом Vanilla JS с прицелом на <b>НОЛЬ зависимостей от фреймворков</b>, поэтому одинаково ложится и в React, и во Vue, и куда угодно, а для проектов без сборки есть <b>библиотека с CDN</b>. У него свой формат JSON — <b>NABI TREE</b>, поэтому превращение HTML в текст и обратно можно подготовить там, где DOM нет вовсе (Node.js, SSR); а поскольку документ собирается заново из разрешённого словаря, а не латается, <b>скрипты XSS перекрыты у корня</b> без отдельной библиотеки очистки. В оформлении принят подход <b>переменных CSS</b>, так что фирменный цвет меняется легко, а <b>вёрстка в rem</b> держит мобильный вид гладким при любом масштабе; цвета под тёмную и светлую тему, маркеры и многоязычные шрифты уже на месте. Сверх того — <b>сортировка столбцов таблицы с учётом типа</b>, <b>локальная история</b> на IndexedDB и поддержка <b>vibe coding</b>.</span></p><p><br/></p><h2>Шрифт</h2><p>Гротеск (по умолчанию), антиква, моноширинный и рукописный — в каждой семье шрифты сложены по системам письма, поэтому любой язык сохраняет лицо этой семьи; письменность, у которой в этой семье нет рукописного начертания, откатывается к шрифту браузера. <b>Шрифт по умолчанию задаёт хост.</b></p><p><br/></p><p>Ниже каждая семья показана <b>на разных языках</b>.</p><p><br/></p><p><span data-nabi-typeface="serif"><span data-nabi-size="lg">세리프 · Serif · 明朝体 · 衬线 · Serif · Avec empattement · Serif · Com serifa · С засечками · بزخارف · सेरिफ़ · সেরিফ · سیرف · Berserif</span></span></p><p><br/></p><p><span data-nabi-typeface="mono"><span data-nabi-size="lg">고정폭 · Monospace · 等幅 · 等宽 · Dicktengleich · Chasse fixe · Monoespaciada · Monoespaçada · Моноширинный · ثابت العرض · मोनोस्पेस · মনোস্পেস · یکساں چوڑائی · Lebar tetap</span></span></p><p><br/></p><p><span data-nabi-typeface="cursive"><span data-nabi-size="lg">필기체 · Cursive · 筆記体 · 手写体 · Schreibschrift · Cursive · Cursiva · Cursiva · Рукописный · خط اليد · घसीट · হস্তলিপি · رواں خط · Tulisan tangan</span></span></p><p><br/></p><p><br/></p><h2>Размер текста</h2><p><span data-nabi-size="xs">Очень мелко</span></p><p><span data-nabi-size="sm">Мелко</span></p><p><span data-nabi-size="lg">Крупно</span></p><p><span data-nabi-size="xl">Очень крупно</span></p><p><br/></p><p><br/></p><h2>Заголовок</h2><p>На пустой строке наберите # и нажмите пробел — тут же станет заголовком.</p><h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6><p><br/></p><p><br/></p><h2>Жирный · Курсив · Подчёркивание · Зачёркивание</h2><p><b>Жирный</b> <i>курсив</i> <u>подчёркнутый</u> <s>зачёркнутый</s> — вот пример.</p><p><b><i><s><u>Их можно и накладывать друг на друга.</u></s></i></b></p><h3>Верхний и нижний индекс</h3><p>Площадь — 3,5 м<sup>2</sup>, а сноска ставится вот так<sup>1</sup>.</p><p>Вода — это H<sub>2</sub>O.</p><p><br/></p><p><br/></p><h2>Цвет текста · Маркер</h2><p>Палитра подобрана так, чтобы одинаково читаться и в светлой, и в тёмной теме.</p><p>Цвет текста <span data-color="green">Зелёный</span> · <span data-color="coral">Коралловый</span> · <span data-color="violet">Фиолетовый</span> · <span data-color="amber">Янтарный</span> · <span data-color="blue">Синий</span></p><p>Маркер <mark data-color="yellow">Жёлтый</mark> · <mark data-color="green">Зелёный</mark> · <mark data-color="cyan">Голубой</mark> · <mark data-color="pink">Розовый</mark> · <mark data-color="purple">Пурпурный</mark> · <mark data-color="orange">Оранжевый</mark></p><p><br/></p><p><br/></p><h2>Ссылка</h2><p>Вставьте адрес — и получится <a href="https://nabi.saro.me/">ссылка</a>.</p><p>Разрешены только http:// и https://; что-то вроде javascript: не пройдёт.</p><p>Например, наберите <a href="https://nabi.saro.me/">https://nabi.saro.me</a> и нажмите пробел или Enter — превратится само, как здесь.</p><h3>target</h3><p>По умолчанию ссылка того же происхождения открывается в этом окне, а любой другой сайт — в новом; правило задаётся при объявлении редактора.</p><h3>Ссылка на вложение</h3><p>Если загрузить не картинку, останется ссылка в виде файла, как ниже.</p><p><a href="https://nabi.saro.me/file-link-test.txt" data-nabi-file="txt" download>Вложение</a> вот так она и остаётся.</p><p><br/></p><p><br/></p><h2>Выравнивание</h2><p>По левому краю</p><p>По центру</p><p>По правому краю</p><h3>Заголовки тоже выравниваются.</h3><p><br/></p><p><br/></p><h2>Списки</h2><h3>Маркированный список</h3><p>На пустой строке наберите - и нажмите <b>пробел</b> — тут же станет маркированным списком.</p><div data-nabi-p><ul><li><p>Это пункт списка</p><div data-nabi-p><ul><li><p>Tab / Shift+Tab делают отступ и снимают его.</p></li></ul></div></li></ul></div><h3>Нумерованный список</h3><p>На пустой строке наберите 1. и нажмите <b>пробел</b> — получится нумерованный список.</p><div data-nabi-p><ol><li><p>Первое</p></li><li><p>Второе</p></li><li><p>Третье</p></li></ol></div><h3>Список задач</h3><p>На пустой строке наберите [ ] или [x] и нажмите <b>пробел</b> — получится список задач.</p><div data-nabi-p><ul data-nabi-list="task"><li data-nabi-checked="true"><p>Эта задача сделана.</p></li><li data-nabi-checked="false"><p>А эта пока нет.</p></li></ul></div><p><br/></p><p><br/></p><h2>Таблица</h2><p>Создайте её через таблицу на панели; строки и столбцы можно добавлять, убирать и объединять.</p><h3>Сортировка столбцов</h3><p>Нажмите <b>Просмотр</b>, а затем щёлкните по заголовкам <b>Остаток</b> и <b>Цена</b> — один за другим.</p><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>Модель</p></th><th><p>Остаток</p></th><th><p>Цена</p></th><th><p>Вес</p></th></tr><tr><td><p>NB-7</p></td><td><p>1,200</p></td><td><p>349</p></td><td><p>1.2 kg</p></td></tr><tr><td><p>NB-9</p></td><td><p>20,000</p></td><td><p>99</p></td><td><p>0.9 kg</p></td></tr><tr><td><p>NB-12</p></td><td><p>3,500</p></td><td><p>1,299</p></td><td><p>1.4 kg</p></td></tr><tr><td><p>NB-80</p></td><td><p>900</p></td><td><p>8,900</p></td><td><p>2.1 kg</p></td></tr><tr><td><p>NB-100</p></td><td><p>Уточняется</p></td><td><p>12,999</p></td><td><p>2.4 kg</p></td></tr></table></div></div><p>В <b>Цене</b> одни числа, поэтому сортируется как число.</p><p><b>Остаток</b> сортируется как текст, потому что в последней клетке есть буквы. (Чтобы этого избежать, очистите её.)</p><p><br/></p><p><br/></p><h2>Разделитель</h2><p>Наберите --- и нажмите Enter — станет разделителем.</p><div data-nabi-p><hr/></div><p><br/></p><p><br/></p><h2>Картинка</h2><p>Вставьте адрес картинки или загрузите её; ширина берётся от 30% до 100%, а сама она встаёт слева, по центру или справа.</p><div data-nabi-p><img src="https://nabi.saro.me/logo/nabi-mark-demo.svg" data-nabi-width="40"/></div><p><br/></p><p><br/></p><h2>YouTube</h2><div data-nabi-p><iframe src="https://www.youtube-nocookie.com/embed/6j-gQmaZ9Zk" title="YouTube" allowfullscreen loading="lazy" data-nabi-width="70"></iframe></div><p><br/></p><p><br/></p><h2>Загрузка</h2><p>Перетащите картинку или файл прямо в редактор.</p><p>Загрузка в этом примере поддельная; одной настройкой она подключается к вашему серверу.</p><p>Если загрузка сорвётся, картинка или файл убирается из редактора.</p><p><br/></p><p><br/></p><h2>Цитата</h2><div data-nabi-p><blockquote><p>На пустой строке наберите &gt; и нажмите <b>пробел</b> — получится блок цитаты.</p><p>Он может занимать несколько строк.</p></blockquote></div><p><br/></p><p><br/></p><h2>Код</h2><p>На пустой строке наберите \`\`\` и нажмите <b>пробел или Enter</b> — получится блок кода.</p><p>Напишите заодно и язык, например \`\`\`java, затем пробел или Enter — блок возьмёт этот язык.</p><div data-nabi-p><pre data-nabi-lang="typescript"><code class="language-typescript">import { createNabiWith, defaultWings } from 'nabi-note'<br/><br/>const { nabi } = createNabiWith(defaultWings)<br/>const html = nabi.getHtml()</code></pre></div><p><br/></p><p><br/></p><h2>Сворачиваемый блок</h2><div data-nabi-p><details open><summary>Сворачиваемый блок состоит из заголовка и содержимого.</summary><p>Вы сами решаете, сохранять его свёрнутым или развёрнутым.</p></details></div><p><br/></p><h2>Локальная история</h2><p>Через IndexedDB <b>браузера</b> история сохраняется с заданным вами промежутком.</p><p>Она остаётся только на этом устройстве и хранит столько записей, сколько объявлено. — по умолчанию каждые 30 секунд, последние 20 сеансов.</p><p><br/></p><p><br/></p><h2>Горячие клавиши</h2><p>Нажмите <b>Shift дважды подряд</b> — и панель покажет сочетание для каждой возможности.</p><p><br/></p><p><br/></p><h2>Автоформат</h2><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>Пример</p></th><th><p>Клавиша</p></th><th><p>Результат</p></th></tr><tr><td><p>#</p></td><td><p>Пробел</p></td><td><p>Заголовок</p></td></tr><tr><td><p>-</p></td><td><p>Пробел</p></td><td><p>Маркированный список</p></td></tr><tr><td><p>1.</p></td><td><p>Пробел</p></td><td><p>Нумерованный список</p></td></tr><tr><td><p>[ ] · [x]</p></td><td><p>Пробел</p></td><td><p>Список задач</p></td></tr><tr><td><p>&gt;</p></td><td><p>Пробел</p></td><td><p>Цитата</p></td></tr><tr><td><p>\`\`\` · \`\`\`ts</p></td><td><p>Пробел · Enter</p></td><td><p>Блок кода</p></td></tr><tr><td><p>---</p></td><td><p>Enter</p></td><td><p>Разделитель</p></td></tr><tr><td><p>https://…</p></td><td><p>Пробел · Enter</p></td><td><p>Ссылка</p></td></tr></table></div></div><p><br/></p><p><br/></p><h3>Функции вывода</h3><div data-nabi-p><div class="nabi-scroll"><table data-nabi-sortable><tr><th><p>Функция</p></th><th><p>Результат</p></th></tr><tr><td><p>getHtml()</p></td><td><p>HTML</p></td></tr><tr><td><p>getJson()</p></td><td><p>JSON</p></td></tr></table></div></div><p><br/></p><p><br/></p><h2>Работает без DOM</h2><p>Чтобы превратить JSON в HTML, <b>DOM не нужен</b>.</p><p>Сервер (Node.js) читает сохранённое дерево наби как есть и собирает HTML, попутно отсекая XSS.</p><p><br/></p><h2>Дружелюбен к телефону</h2><div data-nabi-p><ul><li><p><b>Мобильный вид</b> — отзывчивая вёрстка держит мобильный вид.</p></li><li><p><b>Поправка на клавиатуру</b> — когда клавиатура выезжает, её высота учитывается.</p></li><li><p><b>Гибкие размеры</b> — все размеры записаны в rem.</p></li><li><p><b>Многоязычность</b> — он говорит на четырнадцати языках.</p></li></ul></div><p><br/></p><h2>Настройка под себя</h2><div data-nabi-p><ul><li><p><b>Своё крыло</b> — не хватает возможности — соберите её сами и подключите.</p></li><li><p><b>Свой CSS</b> — цвета, скругления и отступы заданы через --nabi-*, тёмное и светлое — на ваше усмотрение.</p></li><li><p><b>Открытый код</b> — открыт на GitHub.</p></li></ul></div><div data-nabi-p><hr/></div><p>Открыть документацию → <a href="https://nabi.saro.me/">nabi.saro.me</a></p>`,
  demo_wings: 'Крылья',
  demo_wings_all: 'Включить все',
  demo_wings_none: 'Выключить все',
  demo_zoom: 'Масштаб',
  demo_zoom_out: 'Уменьшить',
  demo_zoom_in: 'Увеличить',
  demo_zoom_reset: 'Сбросить',
  demo_sticky: 'Закрепить панель',
  demo_sticky_keyboard: 'Поправка на мобильную клавиатуру',
  demo_sticky_height: 'Отступ',
  demo_sticky_unit: 'Единица отступа',
  demo_typeface_base: 'Гарнитура по умолчанию',
  demo_typeface_sans: 'Без засечек',
  demo_typeface_serif: 'С засечками',
  demo_typeface_mono: 'Моноширинный',
  demo_typeface_cursive: 'Рукописный',
  demo_html_small: '<p>Пишите здесь и переключайте крылья выше — вкл/выкл.</p>',

  // Paired to pages by `src/sample.ts`; may use only markup that page enables (`src/wings.ts`)
  // 짝은 `src/sample.ts` 가 맺는다 — 그 페이지에서 켜지는 마크업만 써야 평문으로 안 떨어진다
  demo_html_bold:
    '<p>Отметьте <b>важные слова</b> в предложении. Выделите текст и нажмите <b>B</b> на панели.</p>',
  demo_html_italic:
    '<p>Незнакомые слова и цитаты пишут <i>курсивом</i>. Выделите это предложение и попробуйте.</p>',
  demo_html_underline:
    '<p>Здесь есть <u>подчёркивание</u>. Выделите эти буквы и нажмите ещё раз, чтобы снять его.</p>',
  demo_html_strikethrough: '<p><s>1 900 ₽</s> 990 ₽ — старое значение остаётся видимым.</p>',
  demo_html_superscript:
    '<p>Площадь — 3,5 м<sup>2</sup>, а сноски ставятся вот так.<sup>1</sup></p>',
  demo_html_subscript: '<p>Вода — H<sub>2</sub>O, а углекислый газ — CO<sub>2</sub>.</p>',
  demo_html_link:
    '<p>Добавьте адрес — получится <a href="https://example.com">вот такая ссылка</a>. У готовой ссылки нет контекстной строки — чтобы изменить адрес, удалите её и создайте заново.</p>',
  demo_html_highlight:
    '<p>Выделите текст и нажмите кнопку: рядом с кареткой откроются шесть цветов — <mark data-color="yellow">жёлтый</mark>, <mark data-color="green">зелёный</mark>, <mark data-color="cyan">голубой</mark>, <mark data-color="pink">розовый</mark>, <mark data-color="purple">пурпурный</mark>, <mark data-color="orange">оранжевый</mark>.</p><p>Поставьте каретку внутрь маркера — в контекстной строке появятся те же образцы, чтобы сменить цвет.</p>',
  demo_html_text_color:
    '<p>Раскрасьте текст — <span data-color="green">зелёный</span>, <span data-color="coral">коралловый</span>, <span data-color="violet">фиолетовый</span>, <span data-color="amber">янтарный</span> или <span data-color="blue">синий</span>.</p><p><mark data-color="yellow">Наложение на маркер</mark> не мешает: это разные марки, поэтому <span data-color="blue">действуют обе.</span></p>',
  demo_html_heading:
    '<h1>Заголовок 1</h1><h2>Заголовок 2</h2><h3>Заголовок 3</h3><p>Обычный текст. На пустой строке # и пробел тоже делают заголовок.</p>',
  demo_html_bullet_list:
    '<ul><li>Маркированный список</li><li>Tab делает отступ, Shift+Tab снимает его<ul><li>Вложенный пункт</li></ul></li></ul><p>На пустой строке - и пробел тоже создают список.</p>',
  demo_html_ordered_list:
    '<ol><li>Нумерованный список</li><li>Вставьте или удалите пункт — номера пересчитаются сами</li></ol><p>На пустой строке 1. и пробел тоже создают его.</p>',
  demo_html_task_list:
    '<ul data-nabi-list="task"><li data-nabi-checked="true">Нажмите на квадрат перед текстом</li><li data-nabi-checked="false">Отметка сохраняется вместе с документом</li></ul><p>На пустой строке [ ] или [x] тоже создают его.</p>',
  demo_html_table:
    '<table data-nabi-sortable=""><tbody><tr><th>Клавиша</th><th>Что делает</th></tr><tr><td>Tab</td><td>Следующая ячейка</td></tr><tr><td>Стрелки</td><td>Движение по сетке</td></tr></tbody></table><p>Поставьте каретку в ячейку — контекстная строка заполнится командами строк и столбцов.</p>',
  demo_html_image:
    '<div data-nabi-p data-nabi-align="c"><img src="/nabi-note.svg" alt="Логотип NABI NOTE" data-nabi-width="50"></div><p>Щёлкните по картинке — откроется коробка ширины и выравнивания.</p>',
  demo_html_youtube:
    '<p>Нажмите кнопку YouTube на панели или просто вставьте адрес видео — плеер появится прямо здесь.</p>',
  demo_html_code:
    '<pre data-nabi-lang="ts">function sum(numbers: number[]) {<br>  return numbers.reduce((a, b) =&gt; a + b, 0)<br>}</pre><p>Поставьте каретку внутрь кода — в контекстной строке появится поле языка.</p>',
  demo_html_details:
    '<details open=""><summary>Нажмите, чтобы свернуть</summary><p>Свёрнутое состояние сохраняется вместе с документом — читатель увидит его таким, каким оставил автор.</p></details>',
  demo_html_quote:
    '<blockquote><p>Коробка для чужих слов. Внутри действуют только символьные марки — кнопки картинки, кода и таблицы не появляются.</p></blockquote><p>Наберите &gt; и пробел на пустой строке — строка станет цитатой.</p>',
  demo_html_divider:
    '<p>Абзац над разделителем.</p><hr><p>И ещё один под ним. Три дефиса подряд и Enter тоже создают линию.</p>',
  demo_html_align:
    '<p data-nabi-align="l">По левому краю</p><p data-nabi-align="c">По центру</p><p data-nabi-align="r">По правому краю</p>',
  demo_html_font_size:
    '<p data-nabi-size="xs">Очень мелко — для сносок и оговорок.</p><p data-nabi-size="sm">Мелко — на шаг тише основного текста.</p><p>Абзац обычного размера. Нажмите кнопку — появятся пять ступеней, <b>каждая на вашем языке и своего размера</b>.</p><p data-nabi-size="lg">Крупно — весомая фраза.</p><p data-nabi-size="xl">Очень крупно — подзаголовок под заглавием.</p>',
  demo_html_typeface:
    '<p>У этого абзаца нет своего шрифта — он показан гротеском, шрифтом страницы по умолчанию.</p><p data-nabi-typeface="serif">Этот — с засечками. Вы выбираете семейство, а сам шрифт — тот, что этот сайт привязал к токену, здесь это Noto Serif.</p><p data-nabi-typeface="mono">Этот — моноширинный. Все символы одной ширины, поэтому столбцы выстраиваются ровно — 0O 1lI</p><p data-nabi-typeface="cursive">А этот — рукописный — Handwriting · 手書き · 手写.</p><p>Шрифт задаётся <b>для каждого абзаца отдельно</b> и спокойно уживается с такими марками, как жирный.</p>',
  demo_html_dropcap:
    '<p data-nabi-dropcap="on">Первая буква занимает три строки, а текст обтекает её сбоку. Даже короткий абзац заранее резервирует место под эти строки, поэтому следующий блок никогда не наезжает на неё.</p><p>В этом абзаце буквицы нет.</p>',
  demo_html_clear_format:
    '<p>Выделите текст, который стал <b>жирным</b>, <i>курсивом</i>, <u>подчёркнутым</u> или <s>зачёркнутым</s>, и нажмите ластик.</p><p>Снимается только символьное форматирование — блоки остаются как есть.</p>',
  demo_html_upload:
    '<p>Перетащите файл в эту коробку или вставьте его. У этого сайта нет сервера для загрузки, поэтому он лишь притворяется — результат живёт только на этой странице и больше нигде.</p><p>Готовое вложение выглядит как <a href="/nabi-note.svg" data-nabi-file="svg">nabi-note.svg</a>.</p>',


  cdn_demo_lead: 'Сохраните код ниже как {file} и откройте в браузере — сразу увидите результат.',
  cdn_demo_download: 'Скачать demo.html',
  cdn_code_minheight: 'Минимальная высота редактора — чтобы при первой загрузке он не выглядел однострочной коробкой. Меняйте свободно.',
  cdn_code_wings: 'Все крылья, кроме upload.',
  cdn_code_faces:
    'Из шрифтов оставлены только sans и serif.\nСистемы поддерживают разные шрифты, поэтому mono и cursive нужно подключать отдельным\nвеб-шрифтом, чтобы их распознавала любая платформа. Подробности — на странице «Шрифт».',
  cdn_code_change: 'Пример колбэка при изменении значения',
  code_copy: 'Скопировать код',
  demo_install: 'Установка',
  demo_code: 'Код',
  demo_chars: 'Символов: {n}',
  demo_tree: 'nabi-tree',
  demo_loading: 'Загрузка редактора…',

  page_not_found: 'Страница не найдена',
  nav_prev: 'Назад',
  nav_next: 'Вперёд',
}
