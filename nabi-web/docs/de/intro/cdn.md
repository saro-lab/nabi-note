---
title: CDN verwenden
description: Zeigt, wie Sie NABI NOTE ganz ohne Build-Tools nutzen — nur mit HTML-Tags.
---

# CDN verwenden

<CdnDemo />

---

## Grundaufbau und Funktionsweise

Das Demo oben läuft mit einer einzigen HTML-Datei, ganz ohne Bundler oder Build-Tool.

### Einbindung mit zwei HTML-Tags

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">
<script src="https://cdn.jsdelivr.net/npm/nabi-note@latest"></script>
```

Alles, was das Paket exportiert, hängt am globalen Objekt `NabiNote` (kurz `N`). **Das Stylesheet müssen Sie selbst einbinden** — die Mount-Funktionen injizieren kein CSS von sich aus; fehlt das `<link>`-Tag, erscheint der Editor ohne Stil.

### HTML-Struktur

```html
<div id="app" class="nabi">                    <!-- Wurzel für Farbthema, Eckenradius und Schriftart -->
  <div id="chrome" class="nabi-toolbar">        <!-- Fixierter Header, der Werkzeugleiste und Kontextleiste umschließt -->
    <div class="nabi-toolbar-row">
      <span id="tools"></span>                 <!-- Vorschau- und Vollbild-Schaltflächen (rechtsbündig) -->
      <div id="toolbar"></div>
    </div>
    <div id="context"></div>                   <!-- Kontextleiste, die je nach Cursorposition dynamisch erscheint -->
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

Die `id` jedes Elements können Sie frei wählen. Der Mount-Funktion übergeben Sie das tatsächliche DOM-Element, nicht die id als String.
Die vier Klassen (`nabi`, `nabi-toolbar`, `nabi-toolbar-row`, `nabi-content`) sind Pflichtklassen, an denen das Stylesheet ansetzt — lassen Sie sie unverändert. Brauchen Sie Vorschau und Vollbild nicht, können Sie das Element `<span id="tools">` und den Aufruf von `mountViewTools` weglassen. `mountViewTools` baut den eigenen Button-Bereich automatisch innerhalb des übergebenen Containers auf.

### Flügel-Konfiguration

Die Flügel-Konfiguration lässt sich bequem als Builder-Kette schreiben. Das obige Beispiel startet mit den 26 Basis-Flügeln, die ohne Host-Anbindung laufen, fügt Speichern und Öffnen hinzu und schränkt die Schriftartauswahl auf zwei Werte ein.

```js
var wings = N.wings().allBasic().use('save').use('open').use('tf', { values: ['sans', 'serif'] })
```

- `all()` aktiviert alle offiziellen Flügel. Ohne diesen Aufruf sind keine Basis-Flügel enthalten — nur die über `use()` angegebenen werden registriert.
- `allBasic()` wählt aus den offiziellen Flügeln die **26 aus, die ohne zusätzliche Anbindung der Host-Anwendung laufen**. Upload, Speichern und Öffnen sind ausgenommen, weil sie eine Einstellung erfordern, die der Host bereitstellen muss (etwa einen Server-Endpunkt oder einen Dateispeicher). Deshalb werden Speichern und Öffnen im Beispiel oben zusätzlich mit `use()` hinzugefügt.
- `use('name', optionen?)` fügt einen bestimmten Flügel hinzu. Bei einem bereits registrierten Flügel werden nur die Optionen aktualisiert (z. B. `use('tf', { values: [...] })`). Hängt ein Flügel von einem anderen ab (der Upload-Flügel braucht z. B. den Bild- oder den Link-Flügel), wird dieser automatisch mitregistriert.
- `drop('name')` entfernt einen Flügel aus der Liste. Hängt ein anderer Flügel davon ab, wirft der Aufruf eine Exception und nennt die mit zu entfernenden Flügel.
- Der Flügelname ist der kurze, eindeutige Schlüssel (`w`), der im Nabi-Baum gespeichert wird (z. B. `b` für Fett, `tf` für Schriftart, `upload` usw.). Die vollständige Liste liefert `console.log(N.wingNames())`.
- **Ein falscher Name oder eine falsche Option wirft sofort einen Fehler.** Tippfehler, nicht unterstützte Optionsschlüssel oder Werte außerhalb des gültigen Bereichs lösen eine Fehlermeldung aus, die den richtigen Weg zur Korrektur nennt.

`createNabiWith` akzeptiert die Builder-Instanz direkt als Argument, ein zusätzlicher Aufruf von `build()` ist also nicht nötig. Die Flügel lassen sich auch direkt als Array übergeben.

```js
var wings = [N.boldWing, N.italicWing, N.headingWing, N.bulletListWing]
```

Einen selbst geschriebenen, benutzerdefinierten Flügel übergeben Sie als Objekt (`N.wings().all().use(customWing)`). Der `w`-Bezeichner eines solchen Flügels sollte mit dem Präfix `ex` beginnen (z. B. `exNote`), um Kollisionen mit offiziellen Bezeichnern zu vermeiden. Wie Sie einen solchen Flügel schreiben, steht unter [{{ t('menu_wing_custom') }}](../wing/custom).

Die vollständige Spezifikation jedes Flügels finden Sie im Menü [{{ t('menu_wing') }}](../wing/inline/bold).

### Dialoge und Benachrichtigungen einbinden

Das obige Beispiel verbindet über die Option `ask` die eingebauten Browser-Dialoge `alert` und `confirm`. So lässt sich zum Beispiel eine Bestätigung wie „Es gibt noch ungespeicherte Änderungen. Trotzdem fortfahren?" als Browser-Popup anzeigen.

Wird `ask` nicht übergeben, gilt die Standardantwort des Bestätigungsdialogs als Abbruch (`false`), und einfache Hinweismeldungen werden über die im Kern eingebaute Toast-UI unterhalb der Werkzeugleiste automatisch angezeigt. Näheres steht unter [{{ t('menu_intro_usage') }}](./usage).

`ask` enthält außerdem die Funktion `choose`, mit der eine von mehreren Optionen ausgewählt werden kann. **Das Auswahl-Popup beim Einfügen aus der Zwischenablage funktioniert allerdings auch ohne diese Einstellung von selbst.** Sobald `mountToolbar` gemountet ist, verbindet der Kern automatisch eine eigene Popup-UI — auf Seiten, die die Werkzeugleiste verwenden, erscheint das Auswahl-Popup also ohne zusätzliche Implementierung. Übergeben Sie `ask.choose` nur, wenn Sie es durch eine eigene modale UI ersetzen möchten.

### Ein- und Ausgabemethoden

| Methode | Beschreibung |
|---|---|
| `nabi.getHtml()` | Gibt das HTML zum Speichern und Veröffentlichen zurück |
| `nabi.getJson()` | Gibt die Nabi-Baum-Daten (JSON) zurück |
| `nabi.setHtml(html)` · `nabi.setJson(json)` | Ersetzt den Inhalt durch neue Dokumentdaten |
| `nabi.onChange(fn)` | Registriert einen Listener für Änderungsereignisse |
| `N.renderStoredHtml(json, registry)` | Wandelt einen Nabi-Baum ohne Editor in HTML um (siehe [Reiner Lese-Viewer](#reiner-lese-viewer-viewer) unten) |

---

## CDN-Adressen

Um eine bestimmte Version festzulegen, geben Sie die Versionsnummer in der CDN-URL an. Sowohl jsDelivr als auch unpkg werden unterstützt.

Bei einer URL ohne Versionsangabe (`/npm/nabi-note`) können Skript- und CSS-Version durch CDN-Caching auseinanderlaufen — geben Sie daher entweder eine Version an oder verwenden Sie das Tag `@latest`.

| Art | Adresse |
|---|---|
| **Bundle-Skript (neueste)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest` |
| **Bundle-Skript (fest)** | <code>{{ CDN_BUNDLE }}</code> |
| **Stylesheet (neueste)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css` |
| **Stylesheet (fest)** | <code>{{ CDN_SHEET }}</code> |
| **Bundle-Skript (unpkg)** | `https://unpkg.com/nabi-note` |

Das CDN-Bundle entspricht genau dem `dist/`-Build-Ergebnis im npm-Paket.

---

## Reiner Lese-Viewer (Viewer)

Für eine Seite, die ein gespeichertes HTML-Dokument **nur anzeigt**, ist keine Editor-Instanz nötig. Binden Sie dasselbe Stylesheet ein und rendern Sie das HTML innerhalb eines `.nabi-content`-Containers — es erscheint genau so, wie es im Editor aussah.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">

<div class="nabi-content">
  <!-- mit nabi.getHtml() gespeicherter HTML-String -->
</div>
```

Wurde das Dokument **als Nabi-Baum (JSON)** gespeichert, können Sie die Renderfunktion aufrufen, um das HTML rein in JavaScript zu erzeugen. Übergeben Sie dazu die gespeicherten JSON-Daten und die Liste der registrierten Flügel (`registry`).

```html
<script>
  var registry = N.makeRegistry(N.wings().all().build())

  var saved = [{ w: 'p', ch: ['Ein Kommentar'] }]   // vom Server geladener Nabi-Baum
  document.querySelector('.nabi-content').innerHTML = N.renderStoredHtml(saved, registry)
</script>
```

Ist der Wert kein gültiger Nabi-Baum, liefert die Funktion `null`. Das Render-Ergebnis ist mit dem Ergebnis von `getHtml()` der Editor-Instanz vollständig identisch — dieselben XSS-Filterregeln greifen, und da nichts vom DOM abhängt, funktioniert es genauso auf dem Server (Node.js u. Ä.) (siehe [{{ t('menu_intro_ssr') }}](./ssr)).

In Server-Umgebungen, die das npm-Paket nutzen, verwenden Sie statt des globalen Bundles das schlanke Modul **`nabi-note/ssr`**. Es enthält nur die zum Rendern nötige Logik, sodass Editier-Oberfläche und UI-Code nicht im Server-Bundle landen.

Das Stylesheet enthält **die Styles aller Flügel.**

Grundlegende Formatierung wird allein durch CSS dargestellt, doch **Tabellensortierung und Code-Syntaxhervorhebung erfordern clientseitiges JavaScript.** Wenn Sie Zeilensortierung per Klick auf den Spaltenkopf sowie Code-Tokenisierung mit Farbgebung benötigen, können Sie eine schlanke Viewer-Runtime einbinden.

```html
<script type="module">
  import { attachViewer } from 'https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/viewer/index.js'

  attachViewer(document.querySelector('.nabi-content'), { locale: 'de' })
</script>
```

- Auch ohne eingebundenen Viewer wird das Dokument korrekt angezeigt (nur Tabellensortierung und Code-Farbgebung bleiben deaktiviert — das Lesen des Inhalts ist nicht beeinträchtigt).
- Die Tabellensortierung funktioniert nur bei Tabellen, für die im Editor die Sortierung aktiviert wurde (erkennbar am Attribut `data-nabi-sortable`).
- Die Code-Syntaxhervorhebung läuft standardmäßig über einen eingebauten Tokenizer, ganz ohne externe Abhängigkeit. Für einen externen Highlighter wie Shiki übergeben Sie ihn über die Option `{ locale: 'de', highlight }`.
- Das globale `NabiNote`-Bundle enthält keinen Viewer-Einstiegspunkt — um die Bundle-Größe für reine Leseseiten klein zu halten, wird er als eigenes Modul `nabi-note/viewer` bereitgestellt.

---

## Weiterführende Seiten

- [{{ t('menu_intro_usage') }}](./usage) — Installation über npm und ausführliche Nutzung des Editors
- [{{ t('menu_wing_custom') }}](../wing/custom) — einen eigenen, neuen Formatierungs-Flügel bauen

<script setup lang="ts">
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
import { useTranslate } from '../../.vitepress/src/langs.ts'
// Die Versionsnummer wird dynamisch aus der Paketversion bezogen
import { CDN_BUNDLE, CDN_SHEET } from '../../.vitepress/src/version.ts'

const { t } = useTranslate()
</script>
