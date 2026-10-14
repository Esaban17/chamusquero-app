import type { Team } from "@penalitosgt/shared";

/** Escudo genérico con los colores del equipo (no usamos escudos oficiales). */
export function Crest({ team, size = 48 }: { team: Pick<Team, "short" | "colors" | "name">; size?: number }) {
  const [primary, secondary] = team.colors;
  const ink = isLight(primary) ? "#111111" : "#FFFFFF";
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 40 46" role="img" aria-label={team.name}>
      <path d="M20 1 L38 7 V22 C38 34 29 41 20 45 C11 41 2 34 2 22 V7 Z" fill={primary} stroke={secondary} strokeWidth="2.5" />
      <path d="M2 22 H38" stroke={secondary} strokeWidth="2" opacity="0.6" />
      <text
        x="20"
        y="30"
        textAnchor="middle"
        fontSize="10"
        fontWeight="800"
        fill={ink}
        fontFamily="system-ui, sans-serif"
      >
        {team.short}
      </text>
    </svg>
  );
}

/** Luminancia aproximada para elegir texto claro u oscuro sobre el color del escudo. */
function isLight(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 160;
}
