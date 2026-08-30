---
title: YouTube
description: Einbetten eines YouTube-Videos in das Dokument und Anpassen seiner Breite.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# YouTube

Akzeptiert eine YouTube-Video-URL oder eine Video-ID und wandelt sie in einen eingebetteten Block um. Das Dokument speichert nur die 11-stellige Video-ID und die Breite, nicht die vollständige URL, und ein neues Video beginnt zentriert mit einer Breite von 70 %.

Die Breite wird aus festen Schritten gewählt, und die Ausrichtung wird im Absatz gespeichert, der das Video umgibt. Im Editor wählt der erste Klick das Video aus; nachdem es ausgewählt ist, kann durch einen weiteren Klick das Abspielen gestartet werden. Um die Adresse zu ändern, löschen Sie das Video und fügen Sie ein neues ein.

<WingDemo path="/wing/block/youtube" />

```ts
const selected = wings().use('youtube').build()
```

## CSS-Stile

Verwenden Sie `.nabi-content iframe`, um den Rand oder die Ecken des Videos zu ändern. Ändern Sie nicht die gespeicherte Breite oder Ausrichtung.

```css
.article-body iframe {
  border-radius: 14px;
  box-shadow: 0 10px 28px rgb(0 0 0 / 16%);
}
```

Das Paket verwendet `aspect-ratio`, Breite und Ausrichtungsabstände, um die korrekte Größe des Videos beizubehalten; überschreiben Sie diese daher nicht.
