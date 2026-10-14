import { test } from "node:test";
import assert from "node:assert/strict";
import { applyResult, newProgress, type Progress } from "./divisions.ts";
import { TEAMS, SELECTABLE_TEAMS, teamsInDivision } from "./teams.ts";

const play = (start: Progress, results: boolean[]) =>
  results.reduce<{ progress: Progress; events: string[] }>(
    (acc, won) => {
      const { progress, event } = applyResult(acc.progress, won);
      return { progress, events: [...acc.events, String(event)] };
    },
    { progress: start, events: [] },
  );

test("se empieza en Tercera", () => {
  assert.equal(newProgress().division, "tercera");
});

test("tres victorias ascienden", () => {
  const { progress, events } = play(newProgress(), [true, false, true, true]);
  assert.equal(progress.division, "segunda");
  assert.equal(events.at(-1), "promoted");
  assert.equal(progress.seasonWins, 0);
});

test("cuatro derrotas descienden, salvo en la división más baja", () => {
  const primera: Progress = { division: "primera", seasonWins: 0, seasonLosses: 0, titles: 0 };
  assert.equal(play(primera, [false, false, false, false]).progress.division, "segunda");
  assert.equal(play(newProgress(), [false, false, false, false]).progress.division, "tercera");
});

test("2-3 en la temporada: se queda y empieza otra", () => {
  const { progress, events } = play(newProgress(), [true, false, true, false, false]);
  assert.equal(progress.division, "tercera");
  assert.equal(events.at(-1), "new-season");
});

test("ganar Liga Nacional suma un título", () => {
  const liga: Progress = { division: "liga-nacional", seasonWins: 2, seasonLosses: 0, titles: 1 };
  const { progress, event } = applyResult(liga, true);
  assert.equal(event, "champion");
  assert.equal(progress.titles, 2);
  assert.equal(progress.division, "liga-nacional");
});

test("de Tercera a campeón con 12 victorias", () => {
  const { progress } = play(newProgress(), Array(12).fill(true));
  assert.equal(progress.division, "liga-nacional");
  assert.equal(progress.titles, 1);
});

test("datos de equipos consistentes", () => {
  const ids = new Set(TEAMS.map((t) => t.id));
  assert.equal(ids.size, TEAMS.length, "ids repetidos");
  assert.equal(teamsInDivision("liga-nacional").length, 12);
  assert.equal(teamsInDivision("primera").length, 20);
  for (const d of ["tercera", "segunda", "primera", "liga-nacional"] as const) {
    assert.ok(teamsInDivision(d).length >= 2, d);
  }
  assert.ok(SELECTABLE_TEAMS.every((t) => t.division !== "tercera"));
  assert.ok(TEAMS.every((t) => t.short.length === 3));
});
