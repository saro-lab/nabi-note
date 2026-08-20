---
title: Lien
---

# Lien

## Description

`linkWing` (id `a`) est propriétaire de `<a href>`. Appuyez sur le bouton et un panneau de
saisie d'adresse s'ouvre près du caret ; seule une adresse commençant par `http` ou `https`
active le bouton de confirmation — cette vérification par liste blanche **est** la défense
contre le XSS (un schéma comme `javascript:` ne passe jamais du tout). Un `href` qui échoue la
validation n'est pas enregistré, et dans ce cas le texte sort en clair, sans balise `<a>` autour.

Le panneau a deux champs — l'adresse et le texte à afficher. Laissez le champ de texte vide et
l'adresse devient le texte ; avec seulement un caret et aucune sélection, c'est toute la marque
de lien où se tient le caret qui est la cible (la même règle que pour le surlignage et la couleur
de texte).

## Un lien existant se modifie depuis la ligne contextuelle

Quand le caret se tient à l'intérieur d'un lien, **deux champs de texte** apparaissent sur la
ligne contextuelle — pas un bouton qui ouvre le panneau, mais des champs de saisie qui se
tiennent directement dans la ligne (`kind: 'text'`). Ils apparaissent déjà remplis des valeurs
actuelles, et appuyer sur Entrée ou cliquer ailleurs les valide. Si une valeur est inchangée, rien
ne se passe.

| Champ | Ce qu'il fait |
|---|---|
| Adresse | Change seulement l'adresse. Le texte affiché reste tel quel. |
| Nom affiché | Change seulement le texte affiché. L'adresse et la marque de pièce jointe restent telles quelles. |

**Une pièce jointe (un lien de fichier) n'a pas de champ d'adresse** — cette adresse a été
décidée par le téléversement, ce n'est pas une valeur à corriger à la main. Le champ de nom
apparaît de la même façon pour un lien ordinaire et pour une pièce jointe. Un nom vide est
refusé — faire un lien sans nom n'est pas le renommer, c'est le supprimer.

## Atomique à l'écran

Une pièce jointe se comporte comme un seul bloc. Cliquez dessus et c'est toute la portée qui est
visée plutôt que le caret qui atterrit à l'intérieur ; appuyez sur Retour arrière ou Suppr à côté
et tout le lien disparaît. Le modifier est le travail de la ligne contextuelle, pas celui du
caret. Ceci est porté par l'`attach` propre à la wing, que `mountSurface` branche — il n'y a rien
de plus à monter.

## La marque de pièce jointe

Un lien arrivé par un téléversement porte une marque `data-nabi-file` (sa valeur est
l'extension) — c'est cette marque qui fait dessiner par la feuille une boîte trombone au lieu
d'un soulignement. Changez le nom ou changez l'adresse et la marque suit. Même effacer la mise en
forme laisse une pièce jointe tranquille — retirer son enveloppe ferait de la pièce jointe un
texte brut mort.

::: warning Les liens sortants sont toujours stricts
Un `allowLocalUrls` valable pour tout l'éditeur atteint les images et les inclusions, **pas les
liens.** À la sortie, le `href` d'un lien est vérifié contre `http`/`https` (et les chemins
relatifs simples) sans aucune exception, donc une adresse `blob:` ou `data:` ne survit jamais
dans le HTML enregistré — elle retombe en texte brut. Une pièce jointe tenue par une adresse
`blob:` est un aperçu qui ne vit que le temps de la page ; donnez-lui une vraie adresse avant
d'enregistrer.
:::

## Exemple d'utilisation

```ts
import { createNabiWith, mountSurface, mountToolbar, mountContextToolbar, linkWing } from 'nabi-note'
import 'nabi-note/nabi.css'

const surface = document.querySelector<HTMLElement>('#editor')!

// La liste des wings bâtit ensemble la connaissance des sortes, les commandes et les assembleurs — c'est le `registry`
const { nabi, registry } = createNabiWith([linkWing])

mountSurface({ nabi, registry, root: surface })
mountToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#toolbar')! })
mountContextToolbar({ nabi, registry, surface, root: document.querySelector<HTMLElement>('#context')! })

// nabi.onChange(() => user_callback(nabi.getHtml()))
```

## Démo

<WingDemo path="/wing/inline/link" />

<script setup lang="ts">
import WingDemo from '../../../.vitepress/ui/WingDemo.vue'
</script>
