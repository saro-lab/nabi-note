---
title: Benutzerdefinierte Wings
description: Die Vertrags- und Implementierungssequenz zum Hinzufügen einer dauerhaften Dokumentfunktion.
---

# Benutzerdefinierte Wings

Eine benutzerdefinierte Wing ist mehr als eine Schaltfläche in der Werkzeugleiste. Sie ist eine deklarative Erweiterung, die gespeicherte Dokumentstruktur, Befehle, HTML- und Markdown-Konvertierung, Importregeln und Anzeigeverhalten zusammenhält. Die Registry validiert sie, bevor ein Editor existiert, und verhindert so, dass ungültige Strukturen in Dokumente gelangen.

## Beginnen Sie mit der schmalsten Fabrik

Die meisten Formatierungen benötigen keine vollständige Deklaration. Verwenden Sie `simpleMark()` für eine Inline-Markierung ohne Wert, `valueMark()` für eine Markierung mit einer begrenzten Wertemenge, `boxObject()` für einen Block ohne Kinder und `listFamily()` für eine Liste.

```ts
import { createNabiWith, simpleMark, wings } from 'nabi-note'

const exStrong = simpleMark({
  w: 'exStrong',
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
})

const { nabi, registry } = createNabiWith(wings().allBasic().use(exStrong))
```

## Erstellen Sie verschiedene Arten von Wings

Jedes der folgenden Beispiele hat eine andere gespeicherte Form. Registrieren Sie zuerst eines und prüfen Sie `getJson()` und `getHtml()`. Fügen Sie Befehle und Schaltflächen erst hinzu, wenn die Struktur funktioniert.

### 1. Inline-Markierung ohne Wert: Hervorhebung

Verwenden Sie `simpleMark()`, wenn eine Funktion nur Text umschließt. Dies speichert `exStrong` und rendert es als `<strong>`.

```ts
import { simpleMark } from 'nabi-note'

export const exStrong = simpleMark({
  w: 'exStrong',
  clearable: true,
  toHtml: (_node, children, ctx) => ctx.element('strong', children()),
  styles: '.nabi-content strong { font-weight: 700; }',
})
```

Mit `clearable: true` entfernt „Formatierung löschen“ auch diese Markierung. Bevor Sie eine Schaltfläche hinzufügen, wenden Sie sie mit `nabi.applyCommand()` oder einem anderen benutzerdefinierten Befehl an. Derselbe Selektor `.nabi-content strong` formatiert sowohl den Editor als auch den veröffentlichten Inhalt.

### 2. Inline-Markierung mit einem Wert: Tonstatus

Verwenden Sie `valueMark()` für Farbe, Größe oder Zustand, die aus einer zulässigen Menge ausgewählt werden. Der Wert wird in `a.v` gespeichert; Werte außerhalb der Liste werden während `repair()` entfernt.

```ts
import { valueMark } from 'nabi-note'

export const exTone = valueMark({
  w: 'exTone',
  key: 'v',
  values: ['quiet', 'loud'],
  clearable: true,
  toHtml: (node, children, ctx) =>
    ctx.element('span', children(), { 'data-ex-tone': String(node.a?.v ?? '') }),
  styles: `
    .nabi-content [data-ex-tone="quiet"] { opacity: .65; }
    .nabi-content [data-ex-tone="loud"] { color: var(--nabi-accent); font-weight: 700; }
  `,
})
```

Die gespeicherte Form ist `{ "w": "exTone", "a": { "v": "loud" }, "ch": ["Important"] }`. CSS zielt auf den gespeicherten Wert, sodass sich auch der veröffentlichte Inhalt ändert. Entfernen Sie Werte aus einer bestehenden Liste nicht leichtfertig: Früher gespeicherte Dokumente können sie beim Lesen verlieren.

### 3. Kinderloser Block: Trennlinie

Verwenden Sie `boxObject()` für ein eigenständiges Objekt ohne Kinder, etwa ein Bild, ein Video oder eine Trennlinie.

```ts
import { boxObject } from 'nabi-note'

export const exDivider = boxObject({
  w: 'exDivider',
  toHtml: (_node, _children, ctx) => ctx.element('hr', ''),
  styles: '.nabi-content hr { border-color: var(--nabi-line); }',
})
```

Für ein Objekt mit Werten wie einer URL oder Breite deklarieren Sie die Validierung in `attrs` und legen Sie erforderliche Werte in `requires`. Lehnen Sie einen nicht überprüfbaren Wert mit `null` ab, anstatt stillschweigend einen Standardwert zu substituieren.

### 4. Block mit mehreren Absätzen: Callout

Für einen Block, der Dokumentinhalt enthält, deklarieren Sie einen `container`. `holds: 'blocks'` erlaubt Kinder vom Typ Absatz, Liste und Objekt-Block.

```ts
import type { Wing } from 'nabi-note'

export const exCallout: Wing = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      padding: 1rem;
    }
  `,
}
```

Diese Deklaration allein erstellt noch keine Möglichkeit, ausgewählte Absätze einzuhüllen. Fügen Sie einen reinen Befehl in `commands` und eine `button`, die ihn aufruft, hinzu, bevor Sie die Funktion in der Editor-Benutzeroberfläche verfügbar machen.

### 5. Ein passendes Listen- und Elementpaar

Verwenden Sie `listFamily()`, wo eine Liste und ein Element immer gemeinsam auftreten müssen.

```ts
import { listFamily } from 'nabi-note'

export const exList = listFamily({
  w: 'exList',
  item: 'exListItem',
  toHtml: (_node, children, ctx) => ctx.element('ul', children(), { class: 'ex-list' }),
  itemHtml: (_node, children, ctx) => ctx.element('li', children()),
  styles: '.nabi-content .ex-list { border-inline-start: 2px solid var(--nabi-line); }',
})
```

`listFamily()` repariert einen Block innerhalb der Liste, indem er ihn in ein Element einhüllt. Fügen Sie `itemDecl` und `repairItem` für einen Wert auf Elementebene hinzu, wie einen geprüften Zustand.

### Registrieren Sie in einer geordneten Auswahl

Verwenden Sie dieselben Deklarationen in derselben Reihenfolge auf dem Server wie im Browser.

```ts
const selected = wings()
  .allBasic()
  .use(exStrong)
  .use(exTone)
  .use(exDivider)
  .use(exCallout)
  .use(exList)

const { nabi, registry } = createNabiWith(selected, { locale: 'de' })
```

## Definieren Sie Namen und Dokumentstruktur

Namen, die in ein Dokument eingehen, müssen `ex[A-Z0-9]...` entsprechen. Ein Name wie `exCallout` verhindert, dass eine künftige offizielle Wing die Bedeutung gespeicherter Inhalte verändert.

`place` bestimmt die gespeicherte Form: `mark` umschließt Inline-Inhalt, `void` ist ein Block ohne Kinder, `container` enthält Kinder, `attr` ändert Absatzattribute und `tool` erstellt keinen Dokumentknoten. Ein `container` benötigt `holds: 'blocks' | 'inline'` und `toHtml()`.

```ts
const exNote = {
  w: 'exNote',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) => ctx.element('aside', children()),
} as const
```

`attrs`, `boolAttrs`, `allows`, `requiresAnyOf` und `parts` deklarieren strukturelle Einschränkungen. Eine `parts`-Deklaration benötigt auch `partHtml` für jeden Teil. Verwenden Sie `attrKey` und `attrValues`, um einen wertauswählenden Flügel einzuschränken.

## Jede Deklarationsoption

Deklarieren Sie nur das, was der Flügel benötigt. Eine Fabrik liefert bereits einige Felder für Sie.

| Bereich | Optionen | Zweck |
| --- | --- | --- |
| Basis | `w`, `place`, `basic`, `styles` | Name, strukturelle Art, Zugehörigkeit zum Grundkatalog, Standard-CSS |
| Struktur | `holds`, `singleParagraph`, `attrs`, `boolAttrs` | Art der Kinder, Enter-Verhalten, zulässige Attribute, boolesche Attribute |
| Struktur | `parts`, `allows`, `noAlign`, `requiresAnyOf` | Interne Teile, zulässige Kinder, Ausschluss der Ausrichtung, Flügelabhängigkeit |
| Werte | `attrKey`, `attrValues`, `currentValue` | Schlüssel und Liste des gespeicherten Werts, Erkennung des aktuellen Werts |
| Befehle und Eingabe | `commands`, `onKey`, `escapeKeys`, `doubleKeys`, `inputRules` | Befehle, Tastenbehandlung, Escape/Doppel-Tasten-Verhalten, Autoformatierungsregeln |
| Oberflächenverhalten | `attach` | DOM-Verhalten und Bereinigung für eine Oberfläche |
| Konvertierung | `toHtml`, `partHtml`, `toMd`, `partMd` | HTML- und Markdown-Ausgabe |
| Import und Reparatur | `claim`, `ioFilter`, `repair`, `partRepair` | HTML-Import, Dateihandling, JSON-Validierung und Reparatur |
| Benutzeroberfläche | `button`, `buttons`, `context` | Deklarationen für Symbolleiste und Kontext-Benutzeroberfläche |
| Formatierung löschen | `clearable` | Ob „Formatierung löschen“ es entfernt |

`w` und `place` sind immer erforderlich. Knoten erzeugende Flügel vom Typ `mark`, `void` und `container` benötigen ebenfalls `toHtml()`. Ein Container benötigt `holds`; jeder deklarierte Teil benötigt sein passendes `partHtml`.

## Halten Sie HTML, Markdown und JSON zusammen

`toHtml()` rendert einen gespeicherten Knoten zu HTML, während `toMd()` Markdown exportiert. Ohne einen Markdown-Builder wird das generierte HTML beibehalten, damit Informationen nicht verloren gehen. Verwenden Sie `claim()`, um nur Ihr eigenes HTML-Element und validierte Attribute beim Import zu erkennen.

`repair()` wird ausgeführt, wenn JSON geladen wird, und erneut nach Befehlen. Geben Sie einen korrigierten Knoten für ein ungültiges Attribut zurück, oder `null` für einen Knoten, der nicht beibehalten werden kann. Erstellen Sie HTML mit `ctx.element()`, `ctx.escape()` und `ctx.url()`; verketten Sie niemals Tags, Attribute oder URLs um diese Prüfungen herum.

## Halten Sie Befehle vom Anzeige-Verhalten getrennt

Ein Befehl ist eine reine Funktion von Dokument und Auswahl, die das nächste Dokument und eine Auswahl darin zurückgibt. Er liest oder ändert niemals das DOM und gibt `null` zurück, wenn er keine gültige Änderung vornehmen kann. Benennen Sie Befehle in lower camel case beginnend mit einem Verb, wie `insertNote`.

Legen Sie nur-DOM-Verhalten, wie die Drag-Auswahl von Tabellen, in `attach(host)`. Registrieren Sie sofort die Bereinigung für jeden Listener oder jedes geänderte Attribut mit `host.onDispose()`, damit auch ein fehlgeschlagener Setup bereinigt wird. Ändern Sie nicht den composing-Text-DOM oder die Auswahlzuordnung der Oberfläche.

Deklarieren Sie Symbolleisten- und Kontrollen mit `button`, `buttons` und `context`; das Duplizieren ihrer Befehlsregeln in der Anwendungs-Benutzeroberfläche kann dazu führen, dass Benutzeroberfläche und Dokumentmodell divergieren.

## CSS-Stile

Legen Sie das erforderliche Basis-CSS eines Flügels in `styles`. Eingebaute Flügelstile sind bereits in `nabi-note/nabi.css` enthalten. Ein Browser, der ausgewählte Registry-Stile zusammenstellt, kann `collectSheets()` und `injectSheets()` verwenden; SSR sollte stattdessen die CSS-Datei verlinken.

Verwenden Sie dieselben Klassen und Datenattribute für das Bearbeiten und den veröffentlichten Inhalt, ändern Sie jedoch nicht die Struktur von `[data-key]`, `display` oder `white-space` im Editor. CSS muss nur das Erscheinungsbild ändern, nicht die Caret-Zuordnung.

```ts
const exCallout = {
  w: 'exCallout',
  place: 'container',
  holds: 'blocks',
  toHtml: (_node, children, ctx) =>
    ctx.element('aside', children(), { class: 'ex-callout' }),
  styles: `
    .nabi-content .ex-callout {
      padding: 1rem;
      border-inline-start: 4px solid var(--nabi-accent);
      background: var(--nabi-soft);
      border-radius: var(--nabi-radius);
    }
  `,
} as const
```

Zielen Sie nur auf Klassen oder Datenattribute ab, die von `toHtml()` erstellt wurden. Halten Sie dienstspezifische Änderungen enger, z. B. `.article-body .ex-callout`.

## Überprüfen Sie den gesamten Vertrag

Überprüfen Sie, dass ein gespeichertes JSON-Dokument wieder mit derselben Struktur und demselben HTML geladen wird. Testen Sie, dass die Registry ungültige Namen, doppelte Befehle, fehlende Builder und nicht erfüllte Abhängigkeiten ablehnt. Decken Sie ungültigen HTML-Import und `repair()`-Eingabe, Auswahlbehandlung in Befehlen, SSR-Ausgabe und eine gestaltete veröffentlichte Ansicht ab.

Für vollständige Typen und Fabrikargumente prüfen Sie die installierten Deklarationen und die [englische API-Referenz](https://nabi.saro.me/llms/api-reference.md).
