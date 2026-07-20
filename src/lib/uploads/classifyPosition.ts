import type { PositionGroup } from "@/generated/prisma/enums";

// SICS a veces exporta el rol con el nombre duplicado pegado (ej.
// "CentrodelanteroCentrodelantero" en vez de "Centrodelantero") — lo
// detectamos y lo colapsamos antes de clasificar.
function dedupeDoubled(value: string): string {
  const n = value.length;
  if (n > 0 && n % 2 === 0) {
    const half = n / 2;
    if (value.slice(0, half) === value.slice(half)) return value.slice(0, half);
  }
  return value;
}

const GK_KEYWORDS = ["portero", "arquero", "guardameta", "golero"];
const DEF_KEYWORDS = ["defensa", "defensor", "central", "lateral", "líbero", "libero", "carrilero"];
// Se chequea antes que FWD a propósito: "mediapunta" contiene "punta" (palabra
// clave de delantero) y queremos que gane el match de mediocampista.
const MID_KEYWORDS = [
  "centrocampista",
  "mediocampista",
  "mediocentro",
  "mediapunta",
  "media punta",
  "volante",
  "interior",
  "pivote",
  "enganche",
];
const FWD_KEYWORDS = ["delantero", "extremo", "ariete", "atacante", "punta"];

export function classifyPositionGroup(rawRole: string | undefined): PositionGroup {
  const cleaned = dedupeDoubled((rawRole ?? "").trim()).toLowerCase();
  if (!cleaned) return "MID" as PositionGroup;

  if (GK_KEYWORDS.some((k) => cleaned.includes(k))) return "GK" as PositionGroup;
  if (DEF_KEYWORDS.some((k) => cleaned.includes(k))) return "DEF" as PositionGroup;
  if (MID_KEYWORDS.some((k) => cleaned.includes(k))) return "MID" as PositionGroup;
  if (FWD_KEYWORDS.some((k) => cleaned.includes(k))) return "FWD" as PositionGroup;

  return "MID" as PositionGroup;
}
