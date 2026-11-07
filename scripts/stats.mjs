/**
 * Lit uniquement les données PF2e nécessaires à l'infobulle.
 *
 * @param {object | null | undefined} actor - Acteur associé au token (y compris acteur synthétique).
 * @param {object | null | undefined} user - Utilisateur courant.
 * @returns {{ ac: number, hp: number, hpMax: number } | null}
 */
export function getVisibleStats(actor, user) {
  if (!actor || !user || typeof actor.canUserModify !== "function") return null;

  // Le niveau OBSERVER/lecture ne suffit pas : le joueur doit pouvoir modifier l'acteur.
  if (!actor.canUserModify(user, "update")) return null;

  const attributes = actor.system?.attributes;
  const ac = attributes?.ac?.value;
  const hp = attributes?.hp?.value;
  const hpMax = attributes?.hp?.max;

  // On n'invente pas de valeurs pour les types d'acteurs dépourvus de CA/PV.
  if (![ac, hp, hpMax].every((value) => typeof value === "number" && Number.isFinite(value))) {
    return null;
  }

  return { ac, hp, hpMax };
}

/** @param {number} value @param {number} max */
export function getHealthPercent(value, max) {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}
