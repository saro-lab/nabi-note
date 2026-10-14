---
title: Ausrichtung
description: Ändert die horizontale Ausrichtung für Absätze und Objektblöcke.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Ausrichtung

Richte den aktuellen Absatz oder die Absätze im ausgewählten Bereich links, zentriert oder rechts aus. Objekte, die in einem Absatz enthalten sind, wie Bilder, Videos und Tabellen, werden über den sie umgebenden Absatz ausgerichtet.

Die Ausrichtung wird als Absatzattribut gespeichert, nicht als Textformatierung. Codeblöcke sind von der Ausrichtung ausgeschlossen, da die Einrückung dort eine Bedeutung hat.

In einer Tabellenzelle wird der Absatz oder das Bild an der Cursorposition ausgerichtet. Werden mehrere Zellen durch Ziehen ausgewählt, gilt die Ausrichtung für alle ausrichtbaren Absätze und Bilder darin. Enthält die Auswahl unterschiedliche Ausrichtungen, wird keine Ausrichtungsschaltfläche als ausgewählt angezeigt.

Um die Tabelle selbst auszurichten, wählen Sie **Tabelle auswählen** in ihren Kontextwerkzeugen oder setzen den Cursor vor oder hinter die Tabelle in ihrem umschließenden Absatz. Verwenden Sie dann die Ausrichtungsschaltflächen der Hauptwerkzeugleiste. Die linke oder rechte Position eines Float-Bereichs ändern Sie in dessen Kontextwerkzeugen statt über die Ausrichtungsschaltflächen.

<WingDemo path="/wing/etc/align" />

```ts
const selected = wings().use('align').build()
```

Für einen Befehl auf die aktuelle Auswahl verwenden Sie `l` für links, `c` für zentriert und `r` für rechts.

```ts
nabi.applyCommand('setAlign', { value: 'c' })
```
