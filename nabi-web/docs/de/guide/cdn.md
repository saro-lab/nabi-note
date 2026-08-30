---
title: Verwendung von CDN
description: Laden Sie den Browser-Build von NABI NOTE ohne Build-Tool.
---

<script setup>
import CdnDemo from '../../.vitepress/ui/CdnDemo.vue'
</script>

# Verwendung von CDN

Für eine statische Seite, bei der die Installation eines Pakets unpraktisch ist, laden Sie den Browser-Build und das zugehörige CSS von einem CDN. Das folgende Demo liest die Paketversion während des Builds der Site und erstellt einen Editor über das globale `NabiNote`-Objekt.

<CdnDemo />

## Hinweise zu NABI NOTE

- Verwenden Sie in bereitgestelltem Code CSS und Browser-JavaScript mit derselben Version. Eine URL ohne Versionsangabe, wie z. B. `latest`, kann sich ändern, wenn eine neue Veröffentlichung erscheint.
- Das Browser-Bundle stellt die Root-API über `window.NabiNote` zur Verfügung. `nabi-note/ssr`, `nabi-note/viewer` und `nabi-note/diff` sind keine separaten globalen Bundles.
- Das Speichern von Dateien und der lokale Verlauf in diesem Demo laufen im Browser des Benutzers. Senden Sie die Ausgabe von `getJson()` an Ihre Anwendungs-API für die serverseitige Speicherung oder das Synchronisieren mit dem Konto.
- Der Upload erfordert den `upload`-Wing, eine echte Upload-Funktion sowie die erforderlichen Image- oder Link-Wings. Ihr Upload-Server ist für die Dateivalidierung verantwortlich.
- Der Browser-Build bindet seinen HTML-Parser intern ein. `setHtml()`, das Öffnen einer HTML-Datei und das Einfügen von HTML benötigen keine Parser-Option oder eine private API.

Das Laden über CDN ändert nur, wie die Bibliothek geladen wird. Ihr Speicherformat und die Eingabevalidierung sind dieselben wie beim npm-Paket; siehe auch [Grundlegende Verwendung](/de/guide/getting-started).
