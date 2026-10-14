"use client";

import { Game } from "./game";
import type { Identity } from "./use-game";

const ACCOUNT: Identity = { kind: "account" };

export function AccountGame() {
  return <Game identity={ACCOUNT} />;
}
