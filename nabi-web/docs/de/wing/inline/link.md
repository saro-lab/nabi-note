---
title: Link
---

# Link

## Beschreibung

`linkWing` (id `a`) besitzt `<a href>`. Er ist eine **Konstante** — es gibt nichts aufzurufen und
keine Optionen zu übergeben. Drücken Sie die Schaltfläche, öffnet sich eine Adressebene nahe dem
Caret; nur eine mit `http` oder `https` beginnende Adresse schaltet die Bestätigungs-Schaltfläche
ein — diese Whitelist-Prüfung *ist* die XSS-Abwehr (ein Schema wie `javascript:` kommt überhaupt nie
durch). Ein `href`, das die Prüfung nicht besteht, wird nicht gespeichert, und in diesem Fall geht
der Text ohne `<a>`-Tag als reiner Text hinaus.

Die Ebene hat zwei Felder — die Adresse und den anzuzeigenden Text. Lassen Sie das Textfeld leer,
wird die Adresse zum Text; mit nur einem Caret und keiner Auswahl ist der gesamte Link-Mark, in dem
der Caret steht, das Ziel (dieselbe Regel wie bei Hervorhebung und Textfarbe).

## Ein bestehender Link wird in der Kontextzeile bearbeitet

Steht der Caret innerhalb eines Links, erscheinen **zwei Textfelder** in der Kontextzeile — keine
Schaltfläche, die die Ebene öffnet, sondern Eingabefelder, die direkt in der Zeile stehen (`kind:
'text'`). Sie erscheinen mit den aktuellen Werten gefüllt, und Enter drücken oder anderswo klicken
übernimmt sie. Ist ein Wert unverändert, geschieht nichts.

| Feld | Was es tut |
|---|---|
| Adresse | Ändert nur die Adresse. Der angezeigte Text bleibt, wie er ist. |
| Anzeigename | Ändert nur den angezeigten Text. Adresse und Anhang-Kennzeichen bleiben, wie sie sind. |

**Ein Anhang (ein Datei-Link) bekommt kein Adressfeld** — diese Adresse wurde vom Upload
entschieden, kein von Hand zu korrigierender Wert. Das Namensfeld erscheint für einen gewöhnlichen
Link und für einen Anhang auf dieselbe Weise. Ein leerer Name wird abgelehnt — einen Link ohne Namen
zu erzeugen ist kein Umbenennen, sondern ein Löschen.

## Atomar auf dem Bildschirm

Ein Anhang verhält sich als ein einziges Ding. Klicken Sie ihn an, wird die gesamte Spanne anvisiert,
statt dass der Caret hineinfällt; drücken Sie daneben Rücktaste oder Entf, geht der ganze Link weg.
Ihn zu bearbeiten ist Aufgabe der Kontextzeile, nicht des Caret. Dies trägt der Flügel in seinem
eigenen `attach`, das `mountSurface` verdrahtet — es gibt nichts zusätzlich zu mounten.

## Das Anhang-Kennzeichen

Ein Link, der über einen Upload ankam, trägt ein `data-nabi-file`-Kennzeichen (sein Wert ist die
Endung) — dieses Kennzeichen ist es, was das Stylesheet veranlasst, einen Büroklammer-Kasten statt
einer Unterstreichung zu zeichnen. Ändern Sie den Namen oder die Adresse, folgt das Kennzeichen mit.
Selbst Formatierung löschen lässt einen Anhang in Ruhe — die Hülle abzustreifen würde den Anhang zu
totem reinem Text machen.

::: warning Ausgehende Links sind immer streng
Ein editorweites `allowLocalUrls` erreicht Bilder und Einbettungen, **nicht Links.** Auf dem Weg
hinaus wird das `href` eines Links ohne Ausnahme gegen `http`/`https` (und einfache relative Pfade)
geprüft, sodass eine `blob:`- oder `data:`-Adresse nie in das gespeicherte HTML überlebt — sie fällt
zu reinem Text zurück. Ein an einer `blob:`-Adresse hängender Anhang ist eine Vorschau, die nur so
lange lebt wie die Seite; geben Sie ihm vor dem Speichern eine echte Adresse.
:::

## Anwendungsbeispiel

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, linkWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// Die Flügelliste baut Sortenwissen, Commands und Baukästen zusammen — das ist die `registry`
const { nabi, registry } = createNabiWith([linkWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Demo

<WingDemo path="/wing/inline/link" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
