---
title: Schriftart
description: Wenden Sie eine Schriftfamilie auf den ausgewählten Text oder ein Absatz an.
---

<script setup>
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>

# Schriftart

Wenden Sie eine Schriftfamilie auf den ausgewählten Text an. Wenn ein Bereich ausgewählt ist, ändert sich nur dieser Bereich; wenn nur der Cursor vorhanden ist, wird er auf den Text im aktuellen Absatz angewendet. Die tatsächlichen Schriftdateien und `font-family`-Werte werden durch das Service-CSS definiert.

Die Standardfamilien sind `sans`, `serif`, `mono` und `cursive`. Besonders in Diensten, die koreanische oder andere mehrsprachige Inhalte enthalten, ist es besser, explizit zu entscheiden, welche Schriftarten jede Familie verwenden soll.

<WingDemo path="/wing/etc/typeface" />

```ts
const selected = wings().use('tf', {
  values: ['sans', 'serif', 'mono'],
}).build()
```

Wenn `values` weggelassen wird, werden alle Standardfamilien verwendet. Nur in `values` enthaltene Werte sind in Dokumenten erlaubt.

## CSS-Stile

Das Dokument speichert nur den Familiennamen, und CSS wählt die Schriftdateien aus. Ändern Sie die Variablen auf demselben Container sowohl für den Editor als auch für die veröffentlichte Ansicht.

```css
.nabi-content {
  --nabi-font-serif: "Noto Serif", "Noto Serif KR", serif;
  --nabi-font-mono: "JetBrains Mono", monospace;
}
```

Wenn Sie Web-Schriften verwenden, laden Sie diese Schriftdateien zuerst. `cursive` hat oft keine gute Abdeckung für viele Sprachen, daher ist es besser, sie erst bereitzustellen, nachdem Sie die tatsächliche Schriftart gewählt haben, die Ihr Service verwenden wird.
