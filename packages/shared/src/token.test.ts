import assert from "node:assert/strict";
import { test } from "node:test";
import { signSession, verifySession } from "./token.ts";

const user = { id: "c0ffee00-0000-4000-8000-000000000001", name: "Chamusquero" };

test("una sesión firmada se verifica con el mismo secreto y audiencia", () => {
  const token = signSession(user, "web", "secreto", 60);
  assert.deepEqual(
    { ...verifySession(token, "web", "secreto"), exp: 0 },
    { sub: user.id, name: user.name, aud: "web", exp: 0 },
  );
});

test("rechaza otro secreto, otra audiencia, firma alterada y payload alterado", () => {
  const token = signSession(user, "socket", "secreto", 60);
  const [body, sig] = token.split(".");
  const forged = Buffer.from(JSON.stringify({ sub: "otro", name: "x", aud: "socket", exp: 9e9 })).toString("base64url");
  assert.equal(verifySession(token, "socket", "otro-secreto"), null);
  assert.equal(verifySession(token, "web", "secreto"), null);
  assert.equal(verifySession(`${body}.${sig.slice(0, -2)}AA`, "socket", "secreto"), null);
  assert.equal(verifySession(`${forged}.${sig}`, "socket", "secreto"), null);
  assert.equal(verifySession("basura", "socket", "secreto"), null);
});

test("rechaza sesiones vencidas y secretos vacíos", () => {
  assert.equal(verifySession(signSession(user, "web", "secreto", -1), "web", "secreto"), null);
  assert.equal(verifySession(signSession(user, "web", "secreto", 60), "web", ""), null);
  assert.throws(() => signSession(user, "web", "", 60));
});
