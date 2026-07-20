// Etiquetas en español para las claves de statsJson/percentilesJson, sin
// importar de qué pipeline vengan (eventos crudos vs. reporte SICS
// SmartSearch) — compartido entre el radar de percentiles del perfil de
// jugador y los gráficos del Asistente IA.
export const STAT_LABELS: Record<string, string> = {
  // Pipeline de eventos (legacy)
  passes_p90: "Pases",
  xg_total_p90: "xG",
  carries_p90: "Conducciones",
  pressures_p90: "Presiones",
  interceptions_p90: "Intercepciones",
  clearances_p90: "Despejes",
  // Pipeline SICS SmartSearch (actual)
  goals_p90: "Goles",
  shots_p90: "Tiros",
  shots_on_target_p90: "Tiros a puerta",
  key_passes_p90: "Pases clave",
  lateral_passes_p90: "Pases laterales",
  dribbles_p90: "Regates",
  duels_p90: "Duelos",
  fouls_p90: "Faltas cometidas",
  fouls_won_p90: "Faltas sufridas",
  negative_actions_p90: "Acciones negativas",
  positive_actions_p90: "Acciones positivas",
  recoveries_p90: "Recuperaciones",
  attacking_recoveries_p90: "Recuperaciones en ataque",
};
