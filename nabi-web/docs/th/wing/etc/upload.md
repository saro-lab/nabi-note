---
title: อัปโหลดไฟล์
description: เชื่อมการส่งไฟล์เข้ากับตัวอัปโหลดของบริการคุณ
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# อัปโหลดไฟล์

เชื่อมการเลือกไฟล์ การลากแล้ววาง และการวางที่มีแต่ไฟล์เข้ากับขั้นตอนการอัปโหลด เดโมในหน้านี้จะไม่ส่งไฟล์ไปยังเซิร์ฟเวอร์ สำหรับบริการจริง คุณต้องเชื่อมตัวอัปโหลดที่รับไฟล์และส่ง URL กลับมาเอง

หากต้องการแทรกผลการอัปโหลดเป็นบล็อกรูปภาพ ต้องมี image wing หากต้องการแทรกไฟล์อื่นเป็นลิงก์ไฟล์แนบ ต้องมี link wing หากบริการของคุณรับทั้งสองรูปแบบ ให้เลือกทั้งสอง wing อย่างชัดเจน ระหว่างอัปโหลด ตัวแก้ไขจะถูกล็อก และไฟล์ที่สำเร็จจะถูกแทรกรวมกันเป็นขั้นตอนเลิกทำเพียงครั้งเดียว

<WingDemo path="/wing/etc/upload" />

```ts
const selected = wings()
  .use('img')
  .use('a')
  .use('upload', { allowLocalUrls: false })
  .build()
```

หากเลือกเฉพาะ `upload` ระบบจะเติม dependency ที่ยังขาดอยู่หนึ่งรายการระหว่างรูปภาพกับลิงก์ให้อัตโนมัติ เชื่อมการส่งด้วย `mountUpload()` และโดยทั่วไปจะเชื่อม UI แสดงความคืบหน้าบนหน้าจอแก้ไขด้วย `mountUploadView()` หากเซิร์ฟเวอร์ส่ง HTTPS URL กลับมา ก็ไม่จำเป็นต้องใช้ตัวเลือกอนุญาต URL ภายในเครื่อง

## ข้อตกลง API ของเซิร์ฟเวอร์

NABI NOTE จะไม่ส่งไฟล์ไปยังเซิร์ฟเวอร์ของคุณเอง ฟังก์ชัน `uploader` จะส่งไฟล์หนึ่งไฟล์ไปยังเซิร์ฟเวอร์ และเมื่อสำเร็จจะส่งกลับเฉพาะ URL แบบ `https:` ที่เข้าถึงสาธารณะหรือผ่านการยืนยันตัวตน ข้อตกลง API ที่ง่ายที่สุดมีดังนี้

```text
POST /api/uploads
Content-Type: multipart/form-data
ชื่อฟิลด์: file

สำเร็จ: { "url": "https://cdn.example.com/uploads/8f2c.webp" }
ล้มเหลว: การตอบกลับ 4xx หรือ 5xx
```

เซิร์ฟเวอร์ต้องไม่เชื่อเพียงชื่อไฟล์เดิม นามสกุล หรือค่า MIME ที่เบราว์เซอร์ส่งมา ให้ตรวจสอบการยืนยันตัวตนและสิทธิ์ก่อน จำกัดขนาดไฟล์ระหว่างการสตรีม และตรวจชนิดไฟล์จริง ให้เซิร์ฟเวอร์สร้างชื่อที่เก็บใหม่เอง สำหรับรูปภาพ ให้เข้ารหัสใหม่หรือสร้างภาพขนาดย่อเมื่อจำเป็น หากไฟล์ที่อัปโหลดไม่ควรให้ทุกคนดาวน์โหลดได้ ให้ส่งพาธดาวน์โหลดที่ต้องยืนยันตัวตนกลับมาแทน URL สาธารณะ

| สิ่งที่ต้องตรวจบนเซิร์ฟเวอร์ | เหตุผล |
| --- | --- |
| ผู้ใช้ที่เข้าสู่ระบบและสิทธิ์อัปโหลด | ป้องกันการใช้พื้นที่เก็บของผู้ใช้อื่น |
| ขนาดต่อไฟล์และขนาดรวมของคำขอ | ป้องกันหน่วยความจำและพื้นที่เก็บข้อมูลหมด |
| ชนิด MIME จริงและนามสกุลที่อนุญาต | ปิดกั้นไฟล์ปฏิบัติการที่เปลี่ยนนามสกุล |
| ชื่อที่เก็บแบบสุ่มและพื้นที่เก็บแยกกัน | ป้องกันการแก้ไขพาธและการเขียนทับไฟล์เดิม |
| สิทธิ์เข้าถึงและนโยบายหมดอายุของ URL ตอบกลับ | ป้องกันไฟล์ส่วนตัวรั่วไหลจาก URL เพียงอย่างเดียว |

`extensions` และ `maxFileSize` ฝั่งไคลเอนต์เป็นเพียงขั้นแรกเพื่อแจ้งผู้ใช้อย่างรวดเร็วเท่านั้น ต้องกำหนดข้อจำกัดเดียวกันไว้บนเซิร์ฟเวอร์ด้วย

## การเชื่อมตัวอัปโหลดในเบราว์เซอร์

ตัวอย่างต่อไปนี้คือการเชื่อมต่อจริงที่ NABI NOTE ต้องการ ใช้ `XMLHttpRequest` เพราะ `fetch()` มาตรฐานของเบราว์เซอร์ไม่มีความคืบหน้าการอัปโหลด ส่งกลับเพียง `url` จากการตอบกลับของเซิร์ฟเวอร์ รูปภาพจะกลายเป็นบล็อกรูปภาพ และไฟล์อื่นจะกลายเป็นลิงก์ไฟล์แนบ

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
  { locale: 'th' },
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
    request.addEventListener('error', () => reject(new Error('คำขออัปโหลดล้มเหลว')))
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
  locale: 'th',
  onStart: (tasks) => uploadView.start(tasks),
  onProgress: (id, percent) => uploadView.progress(id, percent),
  onSettle: () => uploadView.settle(),
  onDone: () => uploadView.done(),
})

uploadView = mountUploadView({ nabi, surface: content, upload, locale: 'th' })

const surface = mountSurface({
  nabi,
  registry,
  root: content,
  fileSink: upload.take,
  locale: 'th',
})
```

ต้องเชื่อม `fileSink: upload.take` เพื่อให้การลากแล้ววางและการวางที่มีแต่ไฟล์เข้าไปยังการอัปโหลด ปุ่มเลือกไฟล์จะส่งต่อโดย UI ของ upload wing ไปยัง `upload.take()` ระหว่างอัปโหลด ตัวแก้ไขจะถูกล็อก และไฟล์ที่สำเร็จจะเข้ามาเป็นการเลิกทำหนึ่งครั้งต่อหนึ่งชุด `upload.cancel()` หรือปุ่มยกเลิกของ `uploadView` จะตัดคำขอที่กำลังดำเนินการผ่าน `AbortSignal`

## ความล้มเหลวและการยกเลิกการแสดงผล

หากเซิร์ฟเวอร์ตอบข้อผิดพลาด หรือ `uploader` ส่งกลับ `null` จะไม่ใส่ไฟล์นั้นลงในเอกสาร ไฟล์อื่นในชุดเดียวกันจะยังคงประมวลผลต่อไป หากเกินขีดจำกัดขนาดรวม ทั้งชุดจะไม่เริ่มทำงาน เมื่อปิดหน้าจอ ให้ยกเลิกการเชื่อมต่อตามลำดับย้อนกลับจากตอนสร้าง

```ts
function dispose() {
  surface.unmount()
  uploadView.unmount()
  upload.unmount()
}
```

เฉพาะระหว่างพัฒนา คุณสามารถใช้ URL `blob:` เพื่อสร้างตัวอย่างทันท่วงทีได้ ในกรณีนี้ ต้องเปิด `allowLocalUrls: true` ในการประกอบตัวแก้ไข image wing และ upload wing ตามลำดับ หากการอัปโหลดไปยังเซิร์ฟเวอร์จริงส่ง HTTPS URL กลับมา จะปลอดภัยกว่าหากไม่เปิดตัวเลือกนี้

## สไตล์ CSS

ไฟล์ทั่วไปที่เสร็จแล้วจะแสดงด้วย `a[data-nabi-file]` ของ link wing หากต้องการเปลี่ยนเฉพาะลักษณะไฟล์แนบบนหน้าที่เผยแพร่ ให้ใช้ตัวเลือกนี้

```css
.article-body a[data-nabi-file] {
  padding: .3em .6em;
  border: 1px solid var(--nabi-line);
  border-radius: 8px;
  background: var(--nabi-soft);
}
```

ผลการอัปโหลดรูปภาพจะใช้ CSS ของ image wing ตัวแสดงความคืบหน้าการอัปโหลดมีเฉพาะบนหน้าจอแก้ไข จึงไม่จำเป็นต้องสร้างสถานะความคืบหน้าด้วย CSS ของหน้าที่เผยแพร่
