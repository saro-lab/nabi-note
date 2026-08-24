---
title: Image
---

# Image

## Description

`imageWing` (identifiant `img`) est propriétaire de l'élément image (`<img>`). Comme `hr` et
`youtube`, c'est un bloc `place: 'void'` sans rien à l'intérieur. Cliquez sur le bouton de la
barre d'outils et un panneau de saisie d'adresse d'image apparaît.

**L'adresse est validée par son schéma, pas par son extension.** Seuls `http:`, `https:` et les
chemins relatifs sont autorisés — les schémas malveillants comme `javascript:` et les adresses
relatives au protocole (`//example.com/a.png`) sont filtrés. Une adresse d'API dynamique qui
renvoie une image sans extension est prise en charge sans problème.

Le curseur ne peut jamais entrer dans une image, donc cliquer dessus sélectionne l'image entière
et fait apparaître une ligne contextuelle dédiée :

| Contrôle | Description |
|---|---|
| Largeur | un curseur qui règle la largeur de `30 %` à `100 %` par paliers de 10 % (par défaut `60 %`) |
| Voir en grand (visionneuse) | agrandit l'image à sa taille d'origine dans une fenêtre modale |

L'alignement gauche/centre/droite d'une image est une propriété du **paragraphe enveloppe
(`<div data-nabi-p>`)** qui la porte, donc on l'aligne avec les boutons d'alignement de la barre
d'outils principale.

Une image nouvellement insérée est centrée (`data-nabi-align="c"`) par défaut.

```html
<div data-nabi-p data-nabi-align="c"><img src="…" alt="" data-nabi-width="70"/></div>
```

Elle est enregistrée comme attribut sémantique sans `style` en ligne — la taille et l'alignement
réels sont dessinés par `nabi.css`.

### Autoriser les adresses locales (`allowLocalUrls`)

```ts
makeImageWing({ allowLocalUrls?: boolean })
```

Réglez `allowLocalUrls: true` et les adresses locales aux formats `blob:` et `data:image/...`
sont aussi autorisées — utile par exemple pour un aperçu local avant l'envoi d'un fichier (valeur
par défaut `false`).

Si l'adresse d'une image est invalide, ou qu'une adresse blob a expiré et que le chargement
échoue, le crochet `attach` de la wing affiche automatiquement un substitut d'image cassée. Cela
fonctionne sans configuration de montage supplémentaire, et comme c'est une interface purement
visuelle, cela n'a aucun effet sur les données enregistrées.

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

Pour autoriser les adresses `blob:`, utilisez la fonction fabrique :

```ts
makeImageWing({ allowLocalUrls: true })
```

## Démo

<WingDemo path="/wing/block/image" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
