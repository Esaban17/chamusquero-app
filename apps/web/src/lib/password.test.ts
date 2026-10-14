import assert from "node:assert/strict";
import { test } from "node:test";
import { hashPassword, verifyPassword } from "./password.ts";

test("la contraseña correcta pasa y una distinta no", async () => {
  const stored = await hashPassword("penal-al-angulo");
  assert.match(stored, /^scrypt\$16384\$[\w-]+\$[\w-]+$/);
  assert.equal(await verifyPassword("penal-al-angulo", stored), true);
  assert.equal(await verifyPassword("penal-al-angulO", stored), false);
});

test("cada hash usa su propia sal", async () => {
  assert.notEqual(await hashPassword("misma-clave"), await hashPassword("misma-clave"));
});

test("un hash con formato desconocido no valida", async () => {
  assert.equal(await verifyPassword("x", "md5$abc"), false);
});
