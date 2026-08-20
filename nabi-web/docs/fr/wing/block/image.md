---
title: Image
---

# Image

## Description

`imageWing` (nom `img`) est propriétaire de l'image (`<img>`). Comme `hr` et `youtube`, c'est
**un bloc sans intérieur**. Appuyez sur le bouton et un panneau de saisie d'adresse apparaît.

**L'adresse est filtrée par son schéma, pas par son extension.** Seuls `http:`, `https:` et les
chemins relatifs passent ; une adresse relative au protocole comme `//example.com/a.png` est
refusée. Que l'adresse se termine par `.png` **n'est vérifié par personne** — car il est courant
qu'une adresse serve une image sans extension.

Le caret ne peut jamais entrer dans une image, donc cliquer dessus sélectionne l'image entière et
fait apparaître la ligne contextuelle.

| Contrôle | Champ |
|---|---|
| Largeur | huit paliers de dix en dix, de `30` à `100` (par défaut `60`) — une échelle, avec la valeur actuelle affichée |
| Aperçu | l'image seule, en grand — ne change rien au document |

**La ligne contextuelle ne contient que ces deux-là.** Les champs gauche, centre et droite ne
sont pas ici — l'emplacement d'une image est porté non par l'image mais par **le paragraphe
enveloppe qui la tient**, donc ce sont les boutons d'alignement de la barre d'outils qui font ce
travail.

**Une image nouvellement insérée est centrée** — parce que `insertLump` pose l'alignement `c`
sur le paragraphe enveloppe en la dressant.

À la sortie, la largeur se pose sur l'image et l'alignement sur le paragraphe qui l'enveloppe.

```html
<div data-nabi-p data-nabi-align="c"><img src="…" alt="" data-nabi-width="70"/></div>
```

Les valeurs d'alignement sont `l`, `c` et `r`. Aucun `style` en ligne ne sort — l'allure réelle
est dessinée par la feuille qui lit cet attribut à l'intérieur d'un `.nabi-content` où `nabi.css`
est lié.

```ts
makeImageWing({ allowLocalUrls?: boolean })
```

Activez `allowLocalUrls` et les adresses `blob:` et `data:image/...` sont aussi permises —
n'activez cela que pour des démos et des scénarios de téléversement qui prévisualisent un fichier
sans serveur. C'est désactivé par défaut.

Quand une image est cassée (une adresse morte, expirée, ou un blob disparu), un substitut
apparaît tout seul — la wing porte cela dans son propre `attach`, et `mountSurface` branche
l'`attach` de chaque wing enregistrée. **Il n'y a rien de plus à monter.** Cette marque est
réservée à l'écran et ne survit jamais dans la valeur enregistrée.

Vous pouvez l'activer à deux endroits — pour tout l'éditeur avec
`createNabiWith(wings, { allowLocalUrls: true })`, ou pour la seule wing image avec
`makeImageWing({ allowLocalUrls: true })`.

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, imageWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// La liste des wings bâtit ensemble la connaissance des sortes, les commandes et les assembleurs — c'est le `registry`
const { nabi, registry } = createNabiWith([imageWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

Pour laisser ouvert tel quel un fichier reçu d'un téléversement (une adresse `blob:`) :

```ts
makeImageWing({ allowLocalUrls: true })
```

## Démo

<WingDemo path="/wing/block/image" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>