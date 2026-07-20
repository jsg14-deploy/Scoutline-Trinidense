// Los 9 tipos de evento que ingerimos desde exports de SICS (mismo recorte que
// usaba el loader de StatsBomb del scaffold viejo, adaptado a la fuente nueva).
export const TRACKED_EVENT_TYPES = [
  "Pass",
  "Shot",
  "Carry",
  "Pressure",
  "Interception",
  "Dribble",
  "Ball Receipt",
  "Clearance",
  "Duel",
] as const;

export type TrackedEventType = (typeof TRACKED_EVENT_TYPES)[number];

// Claves de stats por-90 derivadas de esos eventos.
export const STAT_KEYS = [
  "passes_p90",
  "shots_p90",
  "xg_total_p90",
  "carries_p90",
  "pressures_p90",
  "interceptions_p90",
  "dribbles_p90",
  "clearances_p90",
  "duels_p90",
] as const;

export type StatKey = (typeof STAT_KEYS)[number];

// Features usadas por el motor de similitud, por grupo de posición.
// GK queda con solo 2 features porque no capturamos eventos específicos de
// arquero (atajadas) en este recorte de 9 tipos — es una limitación de datos,
// no un recorte arbitrario.
export const POSITION_FEATURES: Record<string, StatKey[]> = {
  GK: ["clearances_p90", "duels_p90"],
  DEF: ["clearances_p90", "interceptions_p90", "duels_p90", "passes_p90", "pressures_p90"],
  MID: [
    "passes_p90",
    "carries_p90",
    "pressures_p90",
    "interceptions_p90",
    "dribbles_p90",
    "duels_p90",
    "shots_p90",
  ],
  FWD: [
    "shots_p90",
    "xg_total_p90",
    "dribbles_p90",
    "passes_p90",
    "carries_p90",
    "duels_p90",
    "pressures_p90",
  ],
};
