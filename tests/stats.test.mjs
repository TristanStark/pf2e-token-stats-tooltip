import test from "node:test";
import assert from "node:assert/strict";
import { getVisibleStats, getHealthPercent } from "../scripts/stats.mjs";

const user = { id: "player" };
const actor = (permitted, ac = 24, hp = 17, max = 35) => ({
  canUserModify(actualUser, action) {
    assert.equal(actualUser, user);
    assert.equal(action, "update");
    return permitted;
  },
  system: { attributes: { ac: { value: ac }, hp: { value: hp, max } } }
});

test("authorized player sees AC and current/max HP", () => {
  assert.deepEqual(getVisibleStats(actor(true), user), { ac: 24, hp: 17, hpMax: 35 });
});

test("observer without update permission receives no stats", () => {
  assert.equal(getVisibleStats(actor(false), user), null);
});

test("missing actor or user receives no stats", () => {
  assert.equal(getVisibleStats(null, user), null);
  assert.equal(getVisibleStats(actor(true), null), null);
});

test("actor types without AC/HP are ignored", () => {
  assert.equal(getVisibleStats({ canUserModify: () => true, system: { attributes: {} } }, user), null);
});

test("zero HP and zero max are legitimate values", () => {
  assert.deepEqual(getVisibleStats(actor(true, 15, 0, 0), user), { ac: 15, hp: 0, hpMax: 0 });
  assert.equal(getHealthPercent(0, 0), 0);
});

test("health meter stays within 0-100 percent", () => {
  assert.equal(getHealthPercent(17, 34), 50);
  assert.equal(getHealthPercent(70, 34), 100);
  assert.equal(getHealthPercent(-3, 34), 0);
});
