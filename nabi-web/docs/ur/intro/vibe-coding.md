---
title: AI وائب کوڈنگ
description: کوڈنگ ایجنٹس کو NABI NOTE کے موجودہ عوامی API اور دستاویز کی حدود کی بنیاد پر درست استعمال میں مدد دیں۔
---

# AI وائب کوڈنگ

NABI NOTE، AI اور خودکار سازی کے ٹولز کے لیے [`llms.txt`](/llms.txt) فراہم کرتا ہے۔ ایجنٹ سے پوری لائبریری کا اندازہ لگانے کو کہنے کے بجائے، اس اشاریے سے آغاز کریں اور اسے صرف کام کے لیے درکار دستاویزات پڑھنے دیں۔

## آغاز کے لیے پرامپٹ

اپنا مطلوبہ فریم ورک اور خصوصیات بھریں۔

```text
Build an editor with NABI NOTE (nabi-note).
First read https://nabi.saro.me/llms.txt, then read only the documents needed for this task.

Environment: Vue 3 + TypeScript
Features: basic formatting, tables, images, and uploads
Stored source: NABI TREE JSON
Publishing: render stored JSON to HTML on the server

Use only public exports and APIs that exist in the installed types.
After implementation, run type checking and a build, then report changed files and verification results.
```

اگر ایجنٹ URLs نہیں کھول سکتا تو گفتگو میں `llms.txt` اور متعلقہ منسلک دستاویزات شامل کریں۔

## اسے صرف مطلوبہ مواد کی طرف رہنمائی دیں

`llms.txt` ایک مختصر اشاریہ ہے۔ ایجنٹ کو صرف متعلقہ صفحات دینا عموماً تمام دستاویزات ایک ساتھ بھیجنے سے زیادہ مفید ہے۔

- npm اسمبلی: [`quickstart-npm.md`](https://nabi.saro.me/llms/quickstart-npm.md)
- CDN سیٹ اپ: [`quickstart-cdn.md`](https://nabi.saro.me/llms/quickstart-cdn.md)
- ونگ کا انتخاب: [`wings.md`](https://nabi.saro.me/llms/wings.md)
- محفوظ شدہ JSON، HTML اور تبدیلی کے واقعات: [`document-model.md`](https://nabi.saro.me/llms/document-model.md)
- HTML امپورٹ، پیسٹ اور اپ لوڈ کی حدود: [`io-security.md`](https://nabi.saro.me/llms/io-security.md)
- حسب ضرورت ونگز اور سرور رینڈرنگ: [`custom-wing.md`](https://nabi.saro.me/llms/custom-wing.md)، [`ssr.md`](https://nabi.saro.me/llms/ssr.md)
- ویوئر، diff، طرزیں اور ڈراپ کیپس: [`viewer-diff.md`](https://nabi.saro.me/llms/viewer-diff.md)، [`styling.md`](https://nabi.saro.me/llms/styling.md)
- عین امپورٹس اور اقسام: [`api-reference.md`](https://nabi.saro.me/llms/api-reference.md)

## پراڈکٹ کی ضروریات شامل کریں

ایجنٹ صرف ترمیمی اسکرین سے اسٹوریج، حفاظتی پالیسی یا اپ لوڈ کے رویے کا اندازہ نہیں لگا سکتا۔ اصل فریم ورک، شامل اور خارج ونگز، JSON اور HTML کے محفوظ ہونے یا نہ ہونے، اپ لوڈ اینڈ پوائنٹ کے درخواست اور جواب کے معاہدے، فائل حدود، اور شائع شدہ صفحات کے لیے SSR، ویوئر رویے یا diffing کی ضرورت واضح کریں۔

جس چیز کا فیصلہ ابھی نہ ہوا ہو، انتخاب پر عمل درآمد سے پہلے ایجنٹ سے اختیارات اور ان کے اثرات کی وضاحت مانگیں۔

## نتیجے کا جائزہ لیں

بنائے گئے کوڈ کا بھی دوسرے کوڈ کی طرح جائزہ لیں۔ خاص طور پر تصدیق کریں کہ یہ:

- ترمیم اور شائع شدہ مواد، دونوں کے لیے `nabi-note/nabi.css` لوڈ کرتا ہو؛
- منتخب ونگز اور ہر mount کے لیے ایک ہی `registry` استعمال کرتا ہو؛
- `getEditorHtml()` کبھی نہیں، `getJson()` محفوظ کرتا ہو؛
- ترمیم ہونے والے `.nabi-content` عنصر کے `innerHTML` میں براہ راست نہ لکھتا ہو؛
- اسکرین بند ہونے پر ہر mount کو unmount کرتا ہو؛
- اپ لوڈ سرور پر MIME قسم، حجم، اجازت اور ذخیرہ مقام کی توثیق کرتا ہو؛
- سرور اور براؤزر پر ملتی ہوئی ونگ ترتیب اور HTML کو متاثر کرنے والے اختیارات استعمال کرتا ہو؛
- ٹائپ چیکنگ، ٹیسٹس اور بلڈ کے ذریعے اصل export ناموں کی تصدیق کرتا ہو۔

IME اور کرسر کے رویے، نیز محفوظ اور لوڈ کرنے کے راستوں کو حقیقی توثیق درکار ہے، خواہ صفحہ ایک بار کام کرتا دکھائی دے۔ موبائل پر composition input کے ساتھ محفوظ شدہ دستاویز کی بحالی بھی آزمائیں۔

## نصب شدہ ورژن کو ترجیح دیں

جب کسی پروجیکٹ میں `nabi-note` پہلے سے نصب ہو تو اس کے `package.json` exports اور ٹائپ اعلانات کسی دوسرے ریلیز کے لیے بنی ویب سائٹ سے زیادہ براہ راست متعلق ہوتے ہیں۔ ایجنٹ سے کوڈ لکھنے سے پہلے اس ورژن کے فرق کی جانچ کروائیں۔
