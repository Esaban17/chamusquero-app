"use client";

import { useEffect, useState } from "react";

/** Segundos que faltan para `deadline` (epoch en ms), actualizándose solos. */
export function useSecondsLeft(deadline: number | null) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (!deadline) return;
    const tick = () => setLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [deadline]);
  return deadline ? left : 0;
}
