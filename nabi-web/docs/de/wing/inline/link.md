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

## URLs einfügen

Wenn der gesamte eingefügte Inhalt ohne umgebende Leerzeichen eine gültige `http://`- oder `https://`-URL ist, wird er sofort als Link eingefügt. URLs in Sätzen, Text mit mehreren URLs und relative Pfade werden wie bisher eingefügt. In Codeblöcken und Editoren ohne Link-Wing bleibt der Inhalt Text. Gültige interne Zwischenablagedaten aus dem Editor haben Vorrang, damit ihre ursprüngliche Formatierung erhalten bleibt.

Mit dem Callback `onPasteUrl` in `mountSurface()` können Sie den Anzeigetext des Links festlegen.

| Argument | Wert |
| --- | --- |
| `url` | Die vollständige URL ohne umgebende Leerzeichen |
| `isSameOrigin` | Ob Protokoll, Host und Port der URL mit dem Ursprung des Dokuments übereinstimmen, in dem sich der Editor befindet |
| `path` | Der mit `/` beginnende Pfad einschließlich Abfrage und Fragment. Beispiel: `/posts/1?a=2#top` |

```ts
const surface = mountSurface({
  nabi,
  registry,
  root: document.querySelector<HTMLElement>('#editor')!,
  onPasteUrl(url, isSameOrigin, path) {
    if (isSameOrigin && path === '/guide') return 'NABI NOTE'
    return url
  },
})
```

Eine zurückgegebene Zeichenfolge, die nicht nur aus Leerzeichen besteht, wird als Anzeigetext verwendet. Wenn der Callback fehlt, einen leeren Wert oder einen anderen Typ zurückgibt oder fehlschlägt, bleibt die eingefügte URL der Anzeigetext. Zurückgegebene Zeichenfolgen werden niemals als HTML interpretiert und ändern die Linkadresse nicht.

Der Callback unterstützt auch `async`-Funktionen und Promises. Während die Antwort aussteht, wird der URL-Link sofort eingefügt; ein späteres gültiges Ergebnis ändert nur den Anzeigetext dieses Links. Ein verspätetes Ergebnis wird ignoriert, wenn der Link bearbeitet oder gelöscht, ein neues Dokument geladen oder die Surface ausgehängt wurde.

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
