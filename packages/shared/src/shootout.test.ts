import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveKick, winner, nextShooter, score, type Kick, type KickOutcome, type Side } from "./shootout.ts";

const never = () => 0.99;
const always = () => 0;

test("el portero ataja si adivina lado y altura", () => {
  assert.equal(resolveKick({ column: "L", height: "low" }, { column: "L", height: "low" }, never), "saved");
  assert.equal(resolveKick({ column: "L", height: "low" }, { column: "L", height: "high" }, never), "goal");
  assert.equal(resolveKick({ column: "L", height: "low" }, { column: "R", height: "low" }, never), "goal");
});

test("al centro el portero ataja sin importar la altura", () => {
  assert.equal(resolveKick({ column: "C", height: "high" }, { column: "C", height: "low" }, never), "saved");
});

test("un tiro alto puede irse afuera", () => {
  assert.equal(resolveKick({ column: "R", height: "high" }, { column: "L", height: "low" }, always), "miss");
  assert.equal(resolveKick({ column: "R", height: "low" }, { column: "L", height: "low" }, always), "goal");
});

const kicks = (outcomes: KickOutcome[]): Kick[] =>
  outcomes.map((outcome, i) => ({
    side: (i % 2) as Side,
    shot: { column: "L", height: "low" },
    dive: { column: "R", height: "low" },
    outcome,
  }));

test("se alternan los tiradores", () => {
  assert.equal(nextShooter([]), 0);
  assert.equal(nextShooter(kicks(["goal"])), 1);
});

test("termina antes de tiempo cuando ya no hay remontada", () => {
  // A: 3 de 3, B: 0 de 3 -> B solo puede llegar a 2.
  assert.equal(winner(kicks(["goal", "saved", "goal", "saved", "goal", "saved"])), 0);
  // A: 3 de 3, B: 0 de 2 -> B aún podría llegar a 3.
  assert.equal(winner(kicks(["goal", "saved", "goal", "saved", "goal"])), null);
});

test("en muerte súbita se decide al cerrar la ronda", () => {
  const tied = kicks(Array(10).fill("goal"));
  assert.equal(winner(tied), null);
  assert.equal(winner([...tied, ...kicks(["goal"]).map((k) => ({ ...k, side: 0 as Side }))]), null);
  const round: Kick[] = [
    { ...kicks(["goal"])[0], side: 0 },
    { ...kicks(["saved"])[0], side: 1 },
  ];
  assert.equal(winner([...tied, ...round]), 0);
  assert.deepEqual(score([...tied, ...round]), [6, 5]);
});

test("una tanda simulada siempre termina", () => {
  let seed = 7;
  const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let game = 0; game < 200; game++) {
    const list: KickOutcome[] = [];
    while (winner(kicks(list)) === null) {
      list.push(random() < 0.7 ? "goal" : "saved");
      assert.ok(list.length < 200);
    }
  }
});
