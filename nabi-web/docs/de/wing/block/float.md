---
title: Float-Bereich
description: Text, Bilder und Tabellen neben dem Fließtext platzieren und folgende Absätze daneben fließen lassen.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Float-Bereich

Platzieren Sie eine kurze Beschreibung, ein Bild oder eine kleine Tabelle links oder rechts und lassen Sie den Fließtext daneben weiterlaufen. Den Inhalt des Bereichs können Sie direkt im selben Editor bearbeiten. Ein gestrichelter Rahmen erscheint nur während der Bearbeitung; Vorschau und veröffentlichte Ansicht zeigen ausschließlich Inhalt und Anordnung.

Setzen Sie den Cursor in den Bereich des folgenden Beispiels und ändern Sie mit den Eigenschaftswerkzeugen die Seite und die maximale Breite. In der Vorschau sehen Sie den Textfluss ohne gestrichelten Rahmen.

<WingDemo path="/wing/block/float" />

```ts
const selected = wings().allBasic().build()
```

Float-Bereiche gehören zu den grundlegenden Wings. Wenn Sie nur benötigte Wings zusammenstellen, verwenden Sie `wings().use('float')` oder registrieren `floatWing` direkt. Registrieren Sie auch die Wings für Bilder, Tabellen, Listen und andere Inhalte, die innerhalb des Bereichs verwendet werden.

## Erstellen und anordnen

Setzen Sie den Cursor in den Fließtext und klicken Sie auf **Float-Bereich**, um einen leeren Bereich zu erstellen. Standardmäßig steht er rechts und hat eine maximale Breite von 40%. Wählen Sie zuvor mehrere Absätze aus, werden alle von der Auswahl berührten Absätze vollständig in einen Bereich eingeschlossen. Ein bestehender Float-Bereich kann weder erneut umschlossen werden noch einen weiteren Float-Bereich enthalten.

```ts
nabi.applyCommand('insertFloat', { side: 'right', w: 40 })
```

Befindet sich der Cursor im Bereich, können Sie mit den Eigenschaftswerkzeugen die linke oder rechte Seite und die maximale Breite einstellen. Zur Auswahl stehen 20%, 30%, 40% und 50%. Die Angabe bezieht sich auf die Breite des Fließtexts, nicht des gesamten Bildschirms. Bei kurzem Inhalt kann der tatsächliche Bereich schmaler ausfallen.

```ts
nabi.applyCommand('setFloatSide', { side: 'left' })
nabi.applyCommand('setFloatWidth', { w: 30 })
```

Das Einfügen von Text, Bildern und Tabellen aus der Zwischenablage, Blockumwandlungen und Uploads bleiben innerhalb des Bereichs. Das Löschen einer enthaltenen Tabelle entfernt nur diese Tabelle. Bei einer Auswahl, die sich zugleich innerhalb und außerhalb des Bereichs erstreckt, können innere Blöcke nicht eingefügt oder umgewandelt werden.

Die Schaltfläche **Float-Bereich auflösen** neben dem Breitenwert führt den Inhalt in den Fließtext zurück, ohne ihn zu löschen. Erstellen, Änderungen der Anordnung und Auflösen lassen sich rückgängig machen und wiederholen.

```ts
nabi.applyCommand('unwrapFloat')
```

## Wie der Text um den Bereich fließt

Folgende Absätze fließen neben dem Bereich und nehmen nach dessen Ende wieder die gesamte Textbreite ein. Die nächste Überschrift, Tabelle, der nächste Codeblock, die nächste Trennlinie oder ein neuer Float-Bereich beginnt unterhalb des vorherigen Bereichs.

Ist die Textbreite kleiner als `36rem`, werden Bereich und Fließtext in einer Spalte angeordnet. Auch beim Drucken wird eine Spalte verwendet, wobei die gespeicherte Seite und maximale Breite erhalten bleiben. Die Dokumentvergleichsansicht behält Seite und maximale Breite jedes Bereichs bei, zeigt den nächsten Block jedoch separat darunter, damit Änderungen leichter zu lesen sind.

## Speichern und Laden

JSON speichert `a.side` und `a.w` des `float`-Knotens zusammen mit seinen inneren Blöcken. HTML verwendet die Attribute `data-nabi-float` und `data-nabi-float-width` an einem `div` innerhalb eines normalen Objektabsatzes.

```html
<div data-nabi-p>
  <div data-nabi-float="right" data-nabi-float-width="40">
    <p>Eine Beschreibung neben dem Fließtext.</p>
  </div>
</div>
<p>Dieser Absatz fließt neben dem Bereich weiter.</p>
```

Beim Markdown-Export bleibt der Bereich als HTML erhalten. Beliebige CSS-`float`-Stile werden nicht importiert. Verwenden Sie daher zum Speichern und Wiederherstellen von NABI NOTE erzeugtes JSON oder HTML. Binden Sie in Editor, SSR, Vorschau und veröffentlichter Ansicht dieselben Wings und dasselbe CSS ein, damit Seite und Breite erhalten bleiben.

## CSS-Stile

Farben und Abstände im Bereich lassen sich mit dem Selektor `[data-nabi-float]` gestalten. Der äußere Absatz steuert Anordnung und maximale Breite; überschreiben Sie daher `float`, `display` oder die Breite nicht direkt.

```css
.brand-note .nabi-content [data-nabi-float] {
  background: var(--nabi-soft);
  border-radius: var(--nabi-radius);
  padding: .75rem;
}
```
