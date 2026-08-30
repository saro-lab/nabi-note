---
title: Загрузка файлов
description: Подключает передачу файлов к загрузчику вашего сервиса.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Загрузка файлов

Подключает выбор файлов, перетаскивание и вставку, содержащую только файлы, к потоку загрузки. Демонстрация на этой странице не отправляет файлы на сервер; в реальном сервисе нужно подключить uploader, который принимает файл и возвращает URL.

Для вставки результата как блока изображения нужна image wing, а для других файлов как ссылок-вложений — link wing. Если сервис принимает оба формата, выберите обе wings явно. На время загрузки редактор блокируется, а успешно загруженные файлы вставляются вместе как один шаг отмены.

<WingDemo path="/wing/etc/upload" />

```ts
const selected = wings()
  .use('img')
  .use('a')
  .use('upload', { allowLocalUrls: false })
  .build()
```

Если выбрать только `upload`, недостающая зависимость image или link добавляется автоматически. Передача подключается через `mountUpload()`, а интерфейс прогресса редактирования обычно — через `mountUploadView()`. Если сервер возвращает HTTPS URL, разрешение локальных URL не требуется.

## Контракт API сервера

NABI NOTE сам не отправляет файлы на сервер. Функция `uploader` передаёт один файл и при успехе возвращает только публичный или защищённый `https:` URL. Простейший контракт выглядит так.

```text
POST /api/uploads
Content-Type: multipart/form-data
Имя поля: file

Успех: { "url": "https://cdn.example.com/uploads/8f2c.webp" }
Ошибка: ответ 4xx или 5xx
```

Сервер не должен доверять только исходному имени, расширению или MIME, переданному браузером. Сначала проверяйте аутентификацию и права, ограничивайте размер во время потокового чтения и определяйте фактический тип файла. Имя хранения создавайте на сервере. При необходимости перекодируйте изображения или делайте миниатюры. Если файл не должен быть доступен всем, возвращайте требующий аутентификации путь скачивания, а не публичный URL.

| Проверка на сервере | Причина |
| --- | --- |
| Вход пользователя и право загрузки | Не даёт записывать файлы в чужое хранилище |
| Размер файла и общий размер запроса | Защищает память и хранилище от исчерпания |
| Реальный разрешённый MIME и расширение | Блокирует исполняемые файлы с переименованным расширением |
| Случайное имя и изолированное хранилище | Защищает от подмены пути и перезаписи файлов |
| Доступ по URL и политика срока действия | Не даёт раскрыть закрытый файл одним URL |

Клиентские `extensions` и `maxFileSize` нужны лишь для быстрой обратной связи. Те же ограничения обязательно применяйте на сервере.

## Подключение uploader в браузере

Ниже показано реальное подключение, ожидаемое NABI NOTE. Используется `XMLHttpRequest`, поскольку стандартный браузерный `fetch()` не сообщает прогресс отправки. Из ответа сервера возвращайте только `url`: изображения станут блоками изображений, остальные файлы — ссылками-вложениями.

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
  { locale: 'ru' },
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
    request.addEventListener('error', () => reject(new Error('Upload request failed.')))
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
  locale: 'ru',
  onStart: (tasks) => uploadView.start(tasks),
  onProgress: (id, percent) => uploadView.progress(id, percent),
  onSettle: () => uploadView.settle(),
  onDone: () => uploadView.done(),
})

uploadView = mountUploadView({ nabi, surface: content, upload, locale: 'ru' })

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  fileSink: upload.take,
  locale: 'ru',
})
```

Подключите `fileSink: upload.take`, чтобы перетаскивание и вставка, содержащая только файлы, попадали в поток загрузки. Кнопка выбора файлов upload wing передаёт результат в `upload.take()`. Во время загрузки редактор заблокирован, а успешные файлы каждой группы вставляются одним шагом отмены. `upload.cancel()` или кнопка отмены в `uploadView` прерывает текущие запросы через `AbortSignal`.

## Ошибки и очистка

Если сервер вернул ошибку или `uploader` вернул `null`, этот файл не вставляется. Остальные файлы группы продолжают обрабатываться. При превышении общего размера вся группа не запускается. Закрывая экран, размонтируйте компоненты в порядке, обратном созданию.

```ts
function dispose() {
  surface.unmount()
  uploadView.unmount()
  upload.unmount()
}
```

Только во время разработки для мгновенного предпросмотра можно использовать `blob:` URL. Тогда включите `allowLocalUrls: true` при сборке редактора, в image wing и upload wing. Если реальная серверная загрузка возвращает HTTPS URL, безопаснее эту возможность не включать.

## CSS-стили

Обычные загруженные файлы отображаются link wing как `a[data-nabi-file]`. Используйте этот селектор, если хотите изменить лишь вид вложения на опубликованной странице.

```css
.article-body a[data-nabi-file] {
  padding: .3em .6em;
  border: 1px solid var(--nabi-line);
  border-radius: 8px;
  background: var(--nabi-soft);
}
```

Изображения используют CSS image wing. Прогресс загрузки показывается только в редакторе, поэтому CSS опубликованной страницы не должен создавать состояние прогресса.
