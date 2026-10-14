"use client";

import type { KickOutcome } from "@penalitosgt/shared";

/** Sonidos sintetizados con Web Audio: sin archivos de audio ni dependencias. */
let ctx: AudioContext | null = null;

/**
 * Crea o reanuda el AudioContext. Llamarlo dentro de un gesto del usuario (clic o al soltar el tiro):
 * Safari en iOS solo deja sonar audio si el contexto se activó durante uno.
 */
export function unlockAudio() {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    ctx = null;
  }
}

export function playKick(outcome: KickOutcome) {
  if (!ctx || ctx.state !== "running") return;
  if (outcome === "goal") {
    crowd(ctx, 2.2, 0.35, 900);
    fanfare(ctx);
  } else {
    if (outcome === "saved") thump(ctx);
    crowd(ctx, 1.2, 0.2, 500);
  }
}

/** Ruido blanco filtrado: el rugido (o el lamento) de la tribuna. */
function crowd(ac: AudioContext, seconds: number, peak: number, freq: number) {
  const buffer = ac.createBuffer(1, Math.floor(ac.sampleRate * seconds), ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const noise = ac.createBufferSource();
  noise.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = freq;
  filter.Q.value = 0.7;
  const gain = envelope(ac, 0.15, peak, seconds);
  noise.connect(filter).connect(gain).connect(ac.destination);
  noise.start();
}

/** Tres notas subiendo para celebrar el gol. */
function fanfare(ac: AudioContext) {
  [523, 659, 784].forEach((freq, i) => {
    const osc = ac.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const gain = envelope(ac, 0.02, 0.18, 0.35, i * 0.12);
    osc.connect(gain).connect(ac.destination);
    osc.start(ac.currentTime + i * 0.12);
    osc.stop(ac.currentTime + i * 0.12 + 0.4);
  });
}

/** Golpe seco del balón contra los guantes. */
function thump(ac: AudioContext) {
  const osc = ac.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(160, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, ac.currentTime + 0.18);
  const gain = envelope(ac, 0.005, 0.6, 0.25);
  osc.connect(gain).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + 0.3);
}

function envelope(ac: AudioContext, attack: number, peak: number, seconds: number, delay = 0) {
  const gain = ac.createGain();
  const t = ac.currentTime + delay;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  return gain;
}
