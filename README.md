# PF2e - Token Stats Tooltip (Foundry VTT v14)

Petit module client pour **Pathfinder 2e** : au survol d'un token sur la scène, affiche une infobulle contenant :

- **CA** (classe d'armure) ;
- **PV actuels / PV maximum** ;
- une petite jauge de PV, colorée selon leur pourcentage.

## Confidentialité et permissions

L'infobulle est affichée **uniquement** si `actor.canUserModify(game.user, "update")` retourne `true`. Un utilisateur avec un simple droit de lecture/observation ne la voit pas. Les MJ, qui peuvent modifier les acteurs, la voient également.

Les données proviennent du `token.actor` de PF2e : cela fonctionne aussi avec les tokens **non liés** au personnage d'origine (acteurs synthétiques). Aucun changement dans les fiches, les tokens ou les droits n'est nécessaire. Aucun socket, aucun transfert d'information vers d'autres joueurs.

Si un acteur ne possède pas à la fois une CA et des PV, aucune infobulle n'est affichée.

## Installation manuelle

1. Décompresser l'archive ZIP : elle contient un dossier `pf2e-token-stats-tooltip`.
2. Copier ce dossier dans le répertoire `Data/modules/` de Foundry VTT.
3. Redémarrer Foundry VTT si nécessaire, puis ouvrir le monde PF2e.
4. Dans **Gérer les modules**, activer **PF2e - Token Stats Tooltip**.
5. Survoler un token associé à un acteur que votre compte peut modifier.

**Important :** l'archive est prévue pour une installation *manuelle* et non via une URL de manifeste en ligne. Pour l'installation par URL, il faut publier le module et héberger ses fichiers/son ZIP.

## Compatibilité

- Foundry VTT : **v14 uniquement**.
- Système : **Pathfinder Second Edition** (`pf2e`).
- Utilise les API `hoverToken`, `canvas.clientCoordinatesFromCanvas` et `actor.canUserModify` de Foundry v14.
- Testé par tests unitaires Node.js ; **pas encore testé dans une instance Foundry v14 réelle**.

## Fonctionnement

L'infobulle apparaît au-dessus du token (en dessous si elle ne tient pas en haut de l'écran), suit la caméra lors des déplacements/zooms et disparaît à la sortie du survol. Les statistiques sont relues lors des mises à jour de l'acteur ou du token. Elle ne gêne pas les clics grâce à `pointer-events: none`.

## Tests de logique

Avec Node.js récent :

```bash
node --test tests/stats.test.mjs
```

## Licence

MIT (voir `LICENSE`).
