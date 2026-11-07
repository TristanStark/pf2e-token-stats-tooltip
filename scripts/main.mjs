import { getVisibleStats, getHealthPercent } from "./stats.mjs";

const MODULE_ID = "pf2e-token-stats-tooltip";

/**
 * Infobulle locale au navigateur de chaque utilisateur : aucun socket, aucune
 * modification du token et aucune révélation des données aux non-propriétaires.
 */
class TokenStatsTooltip {
  /** @type {HTMLElement | null} */
  element = null;

  /** @type {object | null} */
  hoveredToken = null;

  /** Crée une unique infobulle réutilisée pour tous les tokens. */
  ensureElement() {
    if (this.element) return this.element;

    const element = document.createElement("div");
    element.id = MODULE_ID;
    element.className = "pf2e-token-stats-tooltip";
    element.hidden = true;
    element.setAttribute("role", "tooltip");
    element.innerHTML = `
      <div class="pf2e-token-stats-tooltip__content">
        <div class="pf2e-token-stats-tooltip__stat">
          <span class="pf2e-token-stats-tooltip__label">CA</span>
          <strong data-role="ac"></strong>
        </div>
        <div class="pf2e-token-stats-tooltip__divider" aria-hidden="true"></div>
        <div class="pf2e-token-stats-tooltip__stat">
          <span class="pf2e-token-stats-tooltip__label">PV</span>
          <strong data-role="hp"></strong>
        </div>
      </div>
      <div class="pf2e-token-stats-tooltip__health" aria-hidden="true">
        <div class="pf2e-token-stats-tooltip__health-fill" data-role="health-bar"></div>
      </div>
    `;

    document.body.append(element);
    this.element = element;
    return element;
  }

  /** @param {object} token @param {boolean} hovered */
  onHover(token, hovered) {
    if (!hovered) {
      if (token === this.hoveredToken) this.hide();
      return;
    }

    // Ne pas réafficher les tokens masqués aux joueurs non-MJ.
    if (!canvas.ready || token.isVisible === false || (token.document?.hidden && !game.user?.isGM)) {
      this.hide();
      return;
    }

    const stats = getVisibleStats(token.actor, game.user);
    if (!stats) {
      this.hide();
      return;
    }

    this.hoveredToken = token;
    this.render(stats);
  }

  /** @param {{ ac: number, hp: number, hpMax: number }} stats */
  render(stats) {
    const element = this.ensureElement();
    const hpPercent = getHealthPercent(stats.hp, stats.hpMax);

    element.querySelector('[data-role="ac"]').textContent = String(stats.ac);
    element.querySelector('[data-role="hp"]').textContent = `${stats.hp} / ${stats.hpMax}`;
    element.querySelector('[data-role="health-bar"]').style.width = `${hpPercent}%`;
    element.dataset.health = hpPercent <= 25 ? "critical" : hpPercent <= 50 ? "low" : "normal";
    element.setAttribute("aria-label", `Classe d'armure ${stats.ac}, points de vie ${stats.hp} sur ${stats.hpMax}`);

    // Mesurer l'élément hors écran visuel évite un flash lors d'un nouveau survol.
    element.hidden = false;
    element.style.visibility = "hidden";
    this.updatePosition();
    element.style.visibility = "visible";
  }

  /** Repositionne la bulle au-dessus du token, ou en dessous si nécessaire. */
  updatePosition() {
    const token = this.hoveredToken;
    const element = this.element;
    if (!token || !element || element.hidden || !canvas.ready) return;

    // API v14 : conversion de coordonnées de scène en pixels de la fenêtre.
    const centerX = token.center?.x ?? (token.document.x + token.w / 2);
    const tokenY = token.document.y;
    const toClient = canvas.clientCoordinatesFromCanvas?.bind(canvas);
    if (typeof toClient !== "function") {
      this.hide();
      return;
    }

    const top = toClient({ x: centerX, y: tokenY });
    const bottom = toClient({ x: centerX, y: tokenY + token.h });
    const rect = element.getBoundingClientRect();
    const margin = 8;
    const gap = 10;

    let x = top.x - rect.width / 2;
    x = Math.max(margin, Math.min(x, window.innerWidth - rect.width - margin));

    let y = top.y - rect.height - gap;
    if (y < margin) y = bottom.y + gap;
    y = Math.max(margin, Math.min(y, window.innerHeight - rect.height - margin));

    element.style.left = `${Math.round(x)}px`;
    element.style.top = `${Math.round(y)}px`;
  }

  /** Relit le document après une modification de PV/CA/droits. */
  refresh() {
    if (!this.hoveredToken) return;

    const token = this.hoveredToken;
    if (!canvas.ready || token.isVisible === false || (token.document?.hidden && !game.user?.isGM)) {
      this.hide();
      return;
    }

    const stats = getVisibleStats(token.actor, game.user);
    if (!stats) {
      this.hide();
      return;
    }
    this.render(stats);
  }

  hide() {
    this.hoveredToken = null;
    if (this.element) this.element.hidden = true;
  }
}

Hooks.once("ready", () => {
  // Le module est volontairement limité à Pathfinder 2e.
  if (game.system?.id !== "pf2e") return;

  const tooltip = new TokenStatsTooltip();

  Hooks.on("hoverToken", (token, hovered) => tooltip.onHover(token, hovered));
  Hooks.on("canvasPan", () => tooltip.updatePosition());
  Hooks.on("refreshToken", (token) => {
    if (token === tooltip.hoveredToken) tooltip.refresh();
  });

  Hooks.on("updateActor", (actor) => {
    const hoveredActor = tooltip.hoveredToken?.actor;
    if (hoveredActor && (hoveredActor === actor || hoveredActor.id === actor.id)) {
      tooltip.refresh();
    }
  });

  Hooks.on("updateToken", (tokenDocument) => {
    if (tooltip.hoveredToken?.document === tokenDocument) tooltip.refresh();
  });

  Hooks.on("deleteToken", (tokenDocument) => {
    if (tooltip.hoveredToken?.document === tokenDocument) tooltip.hide();
  });

  Hooks.on("canvasTearDown", () => tooltip.hide());
  window.addEventListener("resize", () => tooltip.updatePosition());
  window.addEventListener("blur", () => tooltip.hide());
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) tooltip.hide();
  });

  console.info(`${MODULE_ID} | Module actif (PF2e / Foundry v14).`);
});
