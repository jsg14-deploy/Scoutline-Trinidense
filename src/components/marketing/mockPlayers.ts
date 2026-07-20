// Datos de muestra para el carrusel del hero — se reemplaza por jugadores
// reales (Player + MarketData) apenas haya datos cargados vía SICS.
export type MockPlayerCard = {
  league: string;
  flag: string;
  name: string;
  positionCode: string;
  age: number;
  status: string;
  marketValueRange: string;
  salaryRange: string;
  foot: string;
  tag: string;
};

export const MOCK_PLAYER_CARDS: MockPlayerCard[] = [
  {
    league: "Primera División PY",
    flag: "🇵🇾",
    name: "Ríos, Iván",
    positionCode: "ED",
    age: 21,
    status: "Profesional · Bajo contrato",
    marketValueRange: "€180k - 220k",
    salaryRange: "€2.5k - 4k",
    foot: "Derecho",
    tag: "Extremo veloz",
  },
  {
    league: "Primera Nacional ARG",
    flag: "🇦🇷",
    name: "Duarte, Facundo",
    positionCode: "MC",
    age: 23,
    status: "Profesional · Bajo contrato",
    marketValueRange: "€300k - 380k",
    salaryRange: "€4k - 6k",
    foot: "Izquierdo",
    tag: "Mediocentro box-to-box",
  },
  {
    league: "Primera División URU",
    flag: "🇺🇾",
    name: "Ferreira, Bruno",
    positionCode: "DFC",
    age: 25,
    status: "Profesional · Libre en 2026",
    marketValueRange: "€150k - 190k",
    salaryRange: "€2k - 3.5k",
    foot: "Derecho",
    tag: "Central salida limpia",
  },
  {
    league: "Liga MX Expansión",
    flag: "🇲🇽",
    name: "Cabrera, Santiago",
    positionCode: "DC",
    age: 20,
    status: "Profesional · Bajo contrato",
    marketValueRange: "€400k - 500k",
    salaryRange: "€3k - 5k",
    foot: "Izquierdo",
    tag: "Delantero área desequilibrante",
  },
  {
    league: "Categoría Primera B COL",
    flag: "🇨🇴",
    name: "Mosquera, Andrés",
    positionCode: "LI",
    age: 22,
    status: "Profesional · Bajo contrato",
    marketValueRange: "€120k - 160k",
    salaryRange: "€1.8k - 3k",
    foot: "Izquierdo",
    tag: "Lateral proyección ofensiva",
  },
  {
    league: "Liga Pro ECU",
    flag: "🇪🇨",
    name: "Suárez, Kevin",
    positionCode: "MCO",
    age: 24,
    status: "Profesional · Libre en 2027",
    marketValueRange: "€250k - 320k",
    salaryRange: "€3k - 4.5k",
    foot: "Ambidiestro",
    tag: "Enganche creativo",
  },
];
