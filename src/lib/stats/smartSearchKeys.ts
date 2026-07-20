// Taxonomía de stats para el pipeline de "Reporte de jugadores (SICS
// SmartSearch)": a diferencia de eventTypes.ts (pensado para reconstruir
// stats desde un log de eventos x/y por partido, que Jonathan no tiene
// disponible en la práctica), acá las métricas ya vienen calculadas por SICS
// por jugador/temporada — solo las normalizamos todas a por-90.
export const SMARTSEARCH_STAT_KEYS = [
  "goals_p90",
  "shots_p90",
  "shots_on_target_p90",
  "key_passes_p90",
  "lateral_passes_p90",
  "dribbles_p90",
  "duels_p90",
  "fouls_p90",
  "fouls_won_p90",
  "negative_actions_p90",
  "positive_actions_p90",
  "recoveries_p90",
  "attacking_recoveries_p90",
] as const;

export type SmartSearchStatKey = (typeof SMARTSEARCH_STAT_KEYS)[number];

// Features usadas por el motor de similitud, por grupo de posición.
export const SMARTSEARCH_POSITION_FEATURES: Record<string, SmartSearchStatKey[]> = {
  GK: ["recoveries_p90", "positive_actions_p90", "duels_p90"],
  DEF: ["recoveries_p90", "attacking_recoveries_p90", "duels_p90", "fouls_p90", "negative_actions_p90"],
  MID: [
    "key_passes_p90",
    "lateral_passes_p90",
    "dribbles_p90",
    "positive_actions_p90",
    "negative_actions_p90",
    "recoveries_p90",
    "duels_p90",
  ],
  FWD: [
    "goals_p90",
    "shots_p90",
    "shots_on_target_p90",
    "dribbles_p90",
    "positive_actions_p90",
    "duels_p90",
  ],
};
