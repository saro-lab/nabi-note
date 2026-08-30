---
title: Link
description: Sichere Webadressen verknüpfen und hochgeladene Anhänge anzeigen.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Link

Markieren Sie Text und verknüpfen Sie eine Adresse damit. Wenn Sie eine Adresse eingeben, ohne Text auszuwählen, wird die Adresse selbst als Linktext eingefügt. Das Tippen einer `http://`- oder `https://`-Adresse und anschließendes Drücken von Leertaste oder Eingabetaste wandelt diese ebenfalls in einen Link um.

Links speichern nur `http:`, `https:` und gleichseitige Pfade, die mit `.` oder `/` beginnen. Adressen, deren Ursprung nicht eindeutig identifiziert werden kann, wie `javascript:` oder `//example.com`, werden abgelehnt. Durch Uploads erstellte Anhangslinks speichern ebenfalls Dateinformationen und können nicht manuell wie gewöhnliche Links erstellt werden.

<WingDemo path="/wing/inline/link" />

```ts
const selected = wings().use('a').build()
```

## CSS-Stile

Stilieren Sie gewöhnliche Links mit `.nabi-content a` und Anhangslinks separat mit `.nabi-content a[data-nabi-file]`.

```css
.article-body a:not([data-nabi-file]) {
  color: var(--nabi-accent);
  text-decoration-thickness: .08em;
  text-underline-offset: .16em;
}

.article-body a[data-nabi-file] {
  display: inline-flex;
  gap: .35em;
  padding: .25em .55em;
  background: var(--nabi-soft);
}
```

Die Teile `::before` und `::after` von Anhangslinks werden verwendet, um das Dateiicon und die Erweiterung anzuzeigen, daher ist es in der Regel am besten, deren `content` nicht zu ersetzen oder zu entfernen.
