"use client";

import { useMemo } from "react";
import { Game } from "./game";
import type { Identity } from "./use-game";

export function AccountGame({ token }: { token: string }) {
  const identity = useMemo<Identity>(() => ({ kind: "account", token }), [token]);
  return <Game identity={identity} />;
}
