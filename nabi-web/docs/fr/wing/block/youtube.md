---
title: YouTube
---

# YouTube

## Description

`youtubeWing` (nom `youtube`, sans raccourci) est propriétaire de l'inclusion YouTube
(`<iframe>`). Comme `hr` et `img`, c'est **un bloc sans intérieur** (`place: 'void'`). Appuyez
sur le bouton et un panneau de saisie d'adresse apparaît ; seules les adresses YouTube au format
`watch?v=`, `youtu.be/`, `/embed/`, `/shorts/`, `/v/`, `/live/` passent (préfixes `www.`, `m.`,
`music.` compris, ainsi que `youtube-nocookie.com`) — le jugement se fait par analyse `URL()`
plutôt que par simple recherche de sous-chaîne, donc une adresse comme
`youtube.com.evil.test` n'est pas acceptée.

Plutôt que de faire confiance à l'adresse reçue, elle n'en extrait et n'enregistre que l'**id de
la vidéo, sur 11 caractères**. L'adresse ne survit pas dans la valeur enregistrée — seul reste
`{"w":"youtube","a":{"v":"<id>","w":"70"}}`, et à la sortie elle est réassemblée dans la seule
forme `https://www.youtube-nocookie.com/embed/<id>`.

Pour la même raison que `hr`, le caret n'entre pas à l'intérieur, et appuyer sur Retour arrière ou
Suppr juste avant ou après la fait disparaître entièrement. Une inclusion qui n'est pas YouTube
est **rejetée en bloc** à l'entrée — aucun document étranger ne se dresse à l'intérieur du nôtre.

## Ligne contextuelle

Cliquer sur la vidéo fait apparaître deux champs.

| Contrôle | Champ |
|---|---|
| Largeur | six paliers `50` `60` `70` `80` `90` `100` (par défaut `70`) — une échelle, avec la valeur actuelle affichée |
| Adresse | un panneau de saisie déjà rempli de l'id de la vidéo actuelle |

**Les champs gauche, centre et droite ne sont pas ici.** L'emplacement d'une vidéo est porté non
par la vidéo mais par **le paragraphe enveloppe qui la tient**, donc ce sont les boutons
d'alignement de la barre d'outils qui font ce travail. Une vidéo nouvellement insérée se dresse
avec son paragraphe enveloppe portant l'alignement centré (`c`).

À la sortie, la largeur se pose donc sur la vidéo et l'alignement sur le paragraphe qui
l'enveloppe.

```html
<div data-nabi-p data-nabi-align="c">
  <iframe src="https://www.youtube-nocookie.com/embed/<id>" title="YouTube"
          allowfullscreen loading="lazy" data-nabi-width="70"></iframe>
</div>
```

Aucun `style` en ligne ne sort. Si l'hôte veut l'insérer via sa propre interface, il appelle la
commande directement — `applyCommand('insertYoutube', { v: adresse, w: '80' })`, ou pour ne
changer que la largeur, `applyCommand('setYoutubeWidth', { w: '80' })`. Une largeur hors liste
est refusée.

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, youtubeWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// La liste des wings bâtit ensemble la connaissance des sortes, les commandes et les assembleurs — c'est le `registry`
const { nabi, registry } = createNabiWith([youtubeWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Démo

<WingDemo path="/wing/block/youtube" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
