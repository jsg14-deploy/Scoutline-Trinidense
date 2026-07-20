export type StandardVar = { key: string; label: string; required?: boolean };

// SICS.tv exporta distintos reportes con nombres de columna distintos para el
// mismo dato ("Jugador" en SmartSearch vs. "Jugadores" en el reporte de
// jugadores, "Rol" vs. "Posición", etc.) — acá se listan las variantes
// conocidas de cada campo para que el mapeo automático las reconozca sin que
// el usuario tenga que mapear a mano cada vez que cambia de reporte.
export const PLAYER_REPORT_COLUMN_SYNONYMS: Record<string, string[]> = {
  player_name: ["jugador", "jugadores"],
  team_name: ["equipo", "equipo del jugador"],
  position_raw: ["rol", "posicion", "posición"],
  minutes_played: ["tiempo de juego", "minutos jugados"],
  nationality: ["pais del jugador", "país del jugador", "nacionalidad"],
  foot: ["pie"],
  age: ["edad"],
  market_value: ["valor de mercado"],
  goals: ["goles"],
  goals_p90: ["goles p90"],
  shots: ["tiros"],
  shots_on_target: ["tiro de gol"],
  key_passes: ["pases claves", "pases clave"],
  lateral_passes: ["pases laterales"],
  dribbles: ["drible", "dribles"],
  duels: ["duelos"],
  fouls: ["faltas"],
  fouls_won: ["faltas sufridas"],
  negative_actions: ["acciones decisivas negativas"],
  negative_actions_p90: ["acciones decisivas negativas p90"],
  positive_actions: ["acciones decisivas positivas"],
  positive_actions_p90: ["acciones decisivas positivas p90"],
  recoveries: ["recuperaciones del balon", "recuperaciones del balón"],
  recoveries_p90: ["recuperaciones del balon p90", "recuperaciones del balón p90"],
  attacking_recoveries: ["recuperaciones de balon en ataque", "recuperaciones de balón en ataque"],
  attacking_recoveries_p90: [
    "recuperaciones de balon en ataque p90",
    "recuperaciones de balón en ataque p90",
  ],
};

// Variables estándar para exports físicos (GPS: Catapult, STATSports, Wimu, GPExe...).
// Un archivo = una sesión de UN jugador; jugador y fecha se cargan una sola vez
// en el formulario (no se mapean por columna, igual criterio que en eventos).
export const PHYSICAL_STANDARD_VARS: StandardVar[] = [
  { key: "distance_total_m", label: "Distancia total (m)" },
  { key: "distance_hsr_m", label: "Distancia carrera alta intensidad (m)" },
  { key: "sprints_count", label: "Cantidad de sprints" },
  { key: "max_speed_kmh", label: "Velocidad máxima (km/h)" },
  { key: "player_load", label: "Player load" },
  { key: "acc_decel_count", label: "Aceleraciones/desaceleraciones" },
];

// Variables estándar para exports de eventos de partido (SICS). Un archivo =
// un partido, así que equipo/rival/liga/temporada/fecha se cargan una sola
// vez en el formulario en vez de mapearse por columna.
export const MATCH_EVENT_STANDARD_VARS: StandardVar[] = [
  { key: "player_name", label: "Nombre del jugador", required: true },
  { key: "event_type", label: "Tipo de evento", required: true },
  { key: "minutes_played", label: "Minutos jugados (del partido)" },
  { key: "position_group", label: "Posición (GK/DEF/MID/FWD)" },
  { key: "x", label: "Coordenada X (0-120)" },
  { key: "y", label: "Coordenada Y (0-80)" },
  { key: "end_x", label: "Coordenada X final" },
  { key: "end_y", label: "Coordenada Y final" },
  { key: "xg", label: "xG del disparo" },
];

// Sinónimos de columnas para planillas de salario — Jonathan puede traer
// esto de un Excel de RRHH con nombres de columna variados.
export const SALARY_COLUMN_SYNONYMS: Record<string, string[]> = {
  player_name: ["jugador", "jugadores", "nombre", "apellido y nombre", "empleado"],
  monthly_salary: ["salario", "sueldo", "salario mensual", "sueldo mensual", "monto", "salary"],
  currency: ["moneda", "currency", "divisa"],
};

// Variables estándar para el reporte comparativo de jugadores de SICS.tv
// ("SmartSearch"): una fila = un jugador, con métricas de temporada ya
// calculadas por SICS (no eventos crudos por partido). Es el formato real
// que Jonathan tiene disponible, a diferencia de MATCH_EVENT_STANDARD_VARS.
export const PLAYER_REPORT_STANDARD_VARS: StandardVar[] = [
  { key: "player_name", label: "Nombre del jugador", required: true },
  { key: "team_name", label: "Equipo del jugador", required: true },
  { key: "position_raw", label: "Rol / posición (SICS)", required: true },
  { key: "minutes_played", label: "Minutos jugados (temporada)", required: true },
  { key: "nationality", label: "País del jugador" },
  { key: "foot", label: "Pie" },
  { key: "age", label: "Edad" },
  { key: "market_value", label: "Valor de mercado" },
  { key: "goals", label: "Goles (total temporada)" },
  { key: "goals_p90", label: "Goles por 90'" },
  { key: "shots", label: "Tiros (total)" },
  { key: "shots_on_target", label: "Tiro de gol / tiros a puerta (total)" },
  { key: "key_passes", label: "Pases clave (total)" },
  { key: "lateral_passes", label: "Pases laterales (total)" },
  { key: "dribbles", label: "Regates / drible (total)" },
  { key: "duels", label: "Duelos (total)" },
  { key: "fouls", label: "Faltas cometidas (total)" },
  { key: "fouls_won", label: "Faltas sufridas (total)" },
  { key: "negative_actions", label: "Acciones decisivas negativas (total)" },
  { key: "negative_actions_p90", label: "Acciones decisivas negativas por 90'" },
  { key: "positive_actions", label: "Acciones decisivas positivas (total)" },
  { key: "positive_actions_p90", label: "Acciones decisivas positivas por 90'" },
  { key: "recoveries", label: "Recuperaciones de balón (total)" },
  { key: "recoveries_p90", label: "Recuperaciones de balón por 90'" },
  { key: "attacking_recoveries", label: "Recuperaciones en ataque (total)" },
  { key: "attacking_recoveries_p90", label: "Recuperaciones en ataque por 90'" },
];

// Variables estándar para la planilla de salarios: una fila = un jugador.
// El jugador tiene que existir ya en el catálogo (cargado vía SICS) — la
// planilla de salario no crea jugadores nuevos, solo les asocia un costo.
export const SALARY_STANDARD_VARS: StandardVar[] = [
  { key: "player_name", label: "Nombre del jugador", required: true },
  { key: "monthly_salary", label: "Salario mensual", required: true },
  { key: "currency", label: "Moneda (USD, PYG, etc.)" },
];

export const NUTRITION_STANDARD_VARS: StandardVar[] = [
  { key: "player_name", label: "Nombre del jugador", required: true },
  { key: "measured_at", label: "Fecha de medición (AAAA-MM-DD)", required: true },
  { key: "weight_kg", label: "Peso (kg)" },
  { key: "height_cm", label: "Talla (cm)" },
  { key: "triceps_mm", label: "Pliegue Tríceps (mm)" },
  { key: "subscapular_mm", label: "Pliegue Subescapular (mm)" },
  { key: "suprailiac_mm", label: "Pliegue Suprailíaco (mm)" },
  { key: "abdominal_mm", label: "Pliegue Abdominal (mm)" },
  { key: "thigh_mm", label: "Pliegue Muslo (mm)" },
  { key: "calf_mm", label: "Pliegue Pantorrilla (mm)" },
  { key: "notes", label: "Notas" },
];

export const MEDICAL_STANDARD_VARS: StandardVar[] = [
  { key: "player_name", label: "Nombre del jugador", required: true },
  { key: "diagnosis", label: "Diagnóstico / Lesión", required: true },
  { key: "body_part", label: "Zona del cuerpo", required: true },
  { key: "occurred_at", label: "Fecha de lesión (AAAA-MM-DD)", required: true },
  { key: "severity", label: "Severidad (mild/moderate/severe)" },
  { key: "status", label: "Estado (active/recovering/recovered)" },
  { key: "expected_return_at", label: "Fecha estimada retorno" },
  { key: "actual_return_at", label: "Fecha alta médica" },
  { key: "notes", label: "Notas" },
];
