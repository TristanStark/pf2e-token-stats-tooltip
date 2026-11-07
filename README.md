# PF2e - Token Stats Tooltip (Foundry VTT v14)

A lightweight client-side module for **Pathfinder Second Edition**. Hovering over a token on the canvas displays a tooltip with:

- **AC** (Armor Class);
- **Current HP / Maximum HP**;
- A compact HP bar whose color changes based on the remaining HP percentage.

## Privacy and permissions

The tooltip appears **only** when `actor.canUserModify(game.user, "update")` returns `true`. Users with read-only or observer permissions cannot see it. Game Masters can also see it, since they can modify actors.

Stats are read from the PF2e `token.actor`, so this also works with **unlinked tokens** (synthetic actors). No changes to character sheets, tokens, or permissions are required. The module does not use sockets or send data to other players.

If an actor does not have both AC and HP values, no tooltip is displayed.

## Manual installation

1. Extract the ZIP archive. It contains a `pf2e-token-stats-tooltip` folder.
2. Copy that folder into your Foundry VTT `Data/modules/` directory.
3. Restart Foundry VTT if necessary, then open your PF2e world.
4. Open **Manage Modules** and enable **PF2e - Token Stats Tooltip**.
5. Hover over a token whose actor your user account has permission to modify.

**Important:** The archive is intended for *manual installation*, not installation through an online manifest URL. To support installation via URL, the module must be published and its files/ZIP hosted online.

## Compatibility

- Foundry VTT: **v14 only**.
- Game system: **Pathfinder Second Edition** (`pf2e`).
- Uses the Foundry v14 APIs `hoverToken`, `canvas.clientCoordinatesFromCanvas`, and `actor.canUserModify`.
- Covered by Node.js unit tests; **not yet tested in a running Foundry VTT v14 instance**.

## How it works

The tooltip appears above the token (or below it if there is not enough room at the top of the screen), follows the canvas when panning or zooming, and disappears when the cursor leaves the token. Stats are read again when the actor or token is updated. The tooltip does not intercept mouse clicks thanks to `pointer-events: none`.

## Logic tests

With a recent version of Node.js:

```bash
node --test tests/stats.test.mjs
```

## License

MIT (see `LICENSE`).
