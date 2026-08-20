---
title: Über ein CDN verwenden
description: CDN-Beispiel
---

# Über ein CDN verwenden

<CdnDemo />

---

## Was Sie gerade getan haben

Die Datei oben läuft, ohne dass Sie etwas davon lesen müssen. Schauen Sie nur hierher, wenn Sie sie
ändern wollen.

### Zwei Tags sind die gesamte Installation

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">
<script src="https://cdn.jsdelivr.net/npm/nabi-note@latest"></script>
```

**Alles**, was das Paket exportiert, hängt an dem einen globalen `NabiNote`. **Das Stylesheet hängen
Sie selbst ein** — die Mounts injizieren kein CSS, lassen Sie das `<link>` weg, steht der Editor
nackt da.

### Das Gerüst

```html
<div id="app" class="nabi">                    <!-- die Wurzel, in der Farben, Ecken und Schriften leben -->
  <div id="chrome" class="nabi-toolbar">        <!-- Werkzeugleiste und Kontextzeile hängen als ein Klotz zusammen -->
    <div class="nabi-toolbar-row">
      <span id="tools"></span>                 <!-- Vorschau und Vollbild (ganz rechts) -->
      <div id="toolbar"></div>
    </div>
    <div id="context"></div>                   <!-- füllt sich von selbst, je nachdem worauf der Caret zeigt -->
  </div>
  <div id="editor" class="nabi-content" contenteditable="true"></div>
</div>
```

Die `id`s dürfen beliebig heißen — was Sie einem Mount übergeben, ist das **Element**, nicht der
Name. Lassen Sie die vier Klassen (`nabi`, `nabi-toolbar`, `nabi-toolbar-row`, `nabi-content`), wie
sie sind — sie sind die Griffe, an denen das Stylesheet ansetzt. Wollen Sie Vorschau und Vollbild
nicht nutzen, löschen Sie `<span id="tools">` und die Zeile mit `mountViewTools` zusammen. Den
Kasten dürfen Sie überallhin übergeben — `mountViewTools` baut seinen eigenen, nach rechts
schwebenden Kasten selbst auf, sodass die Zeile der Schaltflächen nicht durcheinandergerät, auch
wenn Sie ihm die Werkzeugleiste selbst übergeben.

### Flügel auswählen

Flügel auswählen ist eine einzige Builder-Zeile. Die Datei oben nimmt aus den neunundzwanzig
Standard-Flügeln das Upload heraus und schränkt die Schriftart auf zwei ein.

```js
var wings = N.wings().all().drop('upload').use('tf', { values: ['sans', 'serif'] })
```

- `all()` beginnt mit allen offiziellen Flügeln. **Rufen Sie es nicht, sind die Hände leer** — es
  lädt nur, was Sie über `use()` hinzufügen.
- `use('name', optionen?)` fügt einen hinzu. Rufen Sie es für einen bereits enthaltenen Flügel,
  legt es nur Optionen darauf — genau das tut das obige `use('tf', { values: [...] })`. Braucht ein
  Flügel einen anderen, auf dem er steht (Upload lebt nur, wenn es entweder Bild oder Link gibt),
  wird der still mit hereingezogen.
- `drop('name')` entfernt einen aus der Auswahl. Versuchen Sie, einen zu entfernen, auf dem ein
  anderer Flügel steht, wirft es an Ort und Stelle und nennt Ihnen, was Sie mit entfernen müssen.
- Der Name ist der kurze Schlüssel, der im gespeicherten Wert steht — `b` (fett), `tf`
  (Schriftart), `upload` und so weiter. Die vollständige Liste sehen Sie mit
  `console.log(N.wingNames())`.
- **Ein falscher Aufruf wirft genau in dieser Zeile.** Ein Tippfehler im Namen, ein unbekannter
  Optionsschlüssel, ein Wert außerhalb der Liste — all das, und die geworfene Meldung trägt bereits
  den Korrekturvorschlag: `use('bod')` antwortet mit „meinen Sie 'b' (fett)?". Es gibt keine Stelle,
  die still ignoriert wird.

`createNabiWith` nimmt den Builder unverändert entgegen, Sie müssen `build()` also nicht rufen —
`build()` liefert nur dort ein Array, wo eines gebraucht wird. Wählen Sie nur ein paar aus, ist ein
Array weiterhin die Antwort.

```js
var wings = [N.boldWing, N.italicWing, N.headingWing, N.bulletListWing]
```

Einen selbst gebauten Flügel geben Sie als Objekt hinein — etwa `N.wings().all().use(customWing)`.
Das `w` dieses Flügels muss mit `ex` beginnen (`exNote`) — überschneidet es sich im gespeicherten
Wert mit einem später erscheinenden offiziellen Namen, wird ein bereits gespeichertes Dokument
anders gelesen als gemeint. Wie man einen baut, steht unter
[{{ t('menu_wing_custom') }}](../wing/custom).

Die Flügel einzeln stehen unter [{{ t('menu_wing') }}](../wing/inline/bold).

### Wege des Fragens und Benachrichtigens

Die Datei oben steckt über `ask` den `alert` und `confirm` des Browsers ein — eine Frage wie „Es
gibt hier schon Geschriebenes. Trotzdem öffnen?" geht in diesen Kasten. Stecken Sie es nicht ein,
ist die Antwort auf die Frage „nein", und ein kurzer Satz, der keine Antwort braucht, zeigt der
toast-Kasten, den der Kern selbst mitbringt, unterhalb der Werkzeugleiste — für eine
Benachrichtigung wie einen Upload-Fehler müssen Sie nichts extra einstecken. Näheres steht unter
[{{ t('menu_intro_usage') }}](./usage).

### Den Wert herausholen

| | |
|---|---|
| `nabi.getHtml()` | das HTML, das Sie speichern und veröffentlichen |
| `nabi.getJson()` | der Nabi-Baum (JSON) |
| `nabi.setHtml(html)` · `nabi.setJson(json)` | ihn wieder hineingeben |
| `nabi.onChange(fn)` | jedes Mal, wenn sich der Wert ändert |
| `N.renderStoredHtml(json, registry)` | einen gespeicherten Wert ohne Editor zu HTML (unten [Leseseite](#die-lesende-seite)) |

---

## Adressen

Um die Version festzunageln, hängen Sie die Versionsnummer an die Adresse. unpkg gibt Ihnen dieselbe
Datei.

**Verwenden Sie nicht die Adresse ohne Versionsnummer (`/npm/nabi-note`)** — jsDelivr cacht diese
Stelle lange, und Bundle und Stylesheet können am Ende aus zwei verschiedenen Versionen gemischt sein.

| | Adresse |
|---|---|
| **Bundle (neueste)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest` |
| **Bundle (festgenagelt)** | <code>{{ CDN_BUNDLE }}</code> |
| **Stylesheet (neueste)** | `https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css` |
| **Stylesheet (festgenagelt)** | <code>{{ CDN_SHEET }}</code> |
| **Bundle** (unpkg) | `https://unpkg.com/nabi-note` |

Das Bundle wird innerhalb der npm-Veröffentlichung selbst mit ausgeliefert, also **ist das CDN keine
eigene Veröffentlichung.**

---

## Die lesende Seite

Eine Seite, die gespeichertes HTML nur **zeigt**, stellt keinen Editor auf. Hängen Sie dasselbe
Stylesheet ein, setzen Sie den Wert in ein `.nabi-content`, und er kommt genauso heraus, wie er im
Editor aussah.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/nabi.css">

<div class="nabi-content">
  <!-- der mit getHtml() gespeicherte Wert -->
</div>
```

Haben Sie **nicht als HTML, sondern als Nabi-Baum (JSON)** gespeichert, wird an Ort und Stelle
gezeichnet, ohne einen Editor aufzustellen. Entgegengenommen werden zwei Dinge: der gespeicherte
Wert und die Liste der registrierten Flügel.

```html
<script>
  var registry = N.makeRegistry(N.wings().all().build())

  var saved = [{ w: 'p', ch: ['Ein Kommentar'] }]   // vom Server erhaltener Nabi-Baum
  document.querySelector('.nabi-content').innerHTML = N.renderStoredHtml(saved, registry)
</script>
```

Ist es kein Nabi-Baum, antwortet dies mit `null`, und ein bestandener Wert unterscheidet sich um
kein einziges Zeichen von dem `getHtml()`, das der Editor liefert — auch die Stelle, an der XSS
herausgefiltert wird, ist exakt dieselbe. Dieser Zugang nutzt kein DOM und läuft deshalb
unverändert auch auf einem Server (Node.js) — **HTML bereits auf dem Server vorzufertigen und
herunterzuschicken** öffnet sich über genau denselben Zugang (siehe
[{{ t('menu_intro_ssr') }}](./ssr#nur-den-gespeicherten-wert-zeichnen-ohne-einen-editor-aufzustellen)).

Ein Server, den Sie über npm einbinden, nimmt nicht das globale Bundle, sondern **`nabi-note/ssr`**
— dieser Einstiegspunkt trägt nur das zum Zeichnen Nötige, Editier-Oberfläche und
Bildschirmwerkzeuge sind darin nicht enthalten.

Diese eine Stylesheet-Datei enthält **das CSS jedes Flügels** — die Datei kann nicht wissen, welche
Flügel Sie registriert haben, deshalb trägt sie sie alle.

Das Sichtbare übernimmt das Stylesheet vollständig, aber **Tabellensortierung und Code-Einfärbung
sind Aufgaben, die auf der Leseseite JavaScript erledigen muss** — eine Spaltenüberschrift antippen
und die Zeilen neu ordnen, oder Code-Zeichen in Stücke zerlegen und einfärben, kann CSS nicht.
Wollen Sie das, heften Sie die Leseseiten-Laufzeit über einen einzigen Zugang an.

```html
<script type="module">
  import { attachViewer } from 'https://cdn.jsdelivr.net/npm/nabi-note@latest/dist/viewer/index.js'

  attachViewer(document.querySelector('.nabi-content'), { locale: 'de' })
</script>
```

- Auch ohne das ist das Dokument einwandfrei zu sehen — nur dreht sich eine Tabelle mit
  eingeschalteter Sortierung nicht, und Code bleibt einfarbig.
- Tabellensortierung heftet sich nur an Tabellen, bei denen die Sortierung im Editor eingeschaltet
  wurde (sie tragen das Kennzeichen `data-nabi-sortable`).
- Die Code-Einfärbung beantwortet der eingebaute Tokenizer, es braucht also keine Abhängigkeit.
  Wollen Sie einen Highlighter wie Shiki, stecken Sie ihn als Hook ein, etwa
  `{ locale: 'de', highlight }` — dessen Gewicht trägt die Seite, die ihn einsteckt.
- Das globale `NabiNote`-Bundle hat diesen Zugang nicht — damit eine lesende Seite nicht den ganzen
  Editor mitlädt, lebt `nabi-note/viewer` separat. Ein Host, der über npm einbindet, heftet
  denselben Zugang auch an die Vorschau, so wie unter
  [{{ t('menu_intro_usage') }}](./usage#der-vorschau-die-leseseiten-laufzeit-anheften) beschrieben.

---

## Weiterführende Seiten

- [{{ t('menu_intro_usage') }}](./usage) — der npm-Weg: Zusammenbau, Eingabe und Ausgabe im Ganzen
- [{{ t('menu_wing_custom') }}](../wing/custom) — eine fehlende Formatierung selbst bauen

<script setup lang="ts">
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
import { useTranslate } from '../../.vitepress/src/langs.ts'
// Die Versionsnummer wird nie von Hand geschrieben — sie wird direkt aus nabi-npms package.json gelesen
import { CDN_BUNDLE, CDN_SHEET } from '../../.vitepress/src/version.ts'

const { t } = useTranslate()
</script>
