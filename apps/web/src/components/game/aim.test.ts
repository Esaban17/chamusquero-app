import assert from "node:assert/strict";
import { test } from "node:test";
import { aimFromSwipe, diveFromDrag } from "./aim.ts";

test("arrastre corto o hacia abajo no es tiro", () => {
  assert.equal(aimFromSwipe(0, -3), null);
  assert.equal(aimFromSwipe(0, 10), null);
});

test("recto hacia arriba: centro, abajo si es corto y arriba si es largo", () => {
  assert.deepEqual(aimFromSwipe(0, -15), { column: "C", height: "low" });
  assert.deepEqual(aimFromSwipe(0, -35), { column: "C", height: "high" });
});

test("en diagonal elige el lado", () => {
  assert.deepEqual(aimFromSwipe(-10, -15), { column: "L", height: "low" });
  assert.deepEqual(aimFromSwipe(10, -35), { column: "R", height: "high" });
});

test("lo que se pasa de la portería se ajusta a la zona más cercana", () => {
  assert.deepEqual(aimFromSwipe(-60, -80), { column: "L", height: "high" });
  assert.deepEqual(aimFromSwipe(60, -8), { column: "R", height: "low" });
});

test("portero: un clic sin arrastre no es estirada", () => {
  assert.equal(diveFromDrag(1, -1), null);
});

test("portero: de lado elige la columna y hacia arriba se lanza alto", () => {
  assert.deepEqual(diveFromDrag(-12, 0), { column: "L", height: "low" });
  assert.deepEqual(diveFromDrag(12, -10), { column: "R", height: "high" });
  assert.deepEqual(diveFromDrag(0, -10), { column: "C", height: "high" });
  assert.deepEqual(diveFromDrag(0, 8), { column: "C", height: "low" });
});

test("portero: lo que se pasa de la portería se ajusta", () => {
  assert.deepEqual(diveFromDrag(-60, -60), { column: "L", height: "high" });
});
