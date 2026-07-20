export type SkinfoldSites = {
  tricepsMm?: number | null;
  subscapularMm?: number | null;
  suprailiacMm?: number | null;
  abdominalMm?: number | null;
  thighMm?: number | null;
  calfMm?: number | null;
};

export const SKINFOLD_SITE_LABELS: Record<keyof SkinfoldSites, string> = {
  tricepsMm: "Tríceps",
  subscapularMm: "Subescapular",
  suprailiacMm: "Suprailíaco",
  abdominalMm: "Abdominal",
  thighMm: "Muslo",
  calfMm: "Pantorrilla",
};

// Fórmula de Yuhasz (6 pliegues) para estimar % de grasa en deportistas a
// partir de la sumatoria — es una estimación de campo, no un valor de
// laboratorio (DEXA/hidrostático), así que siempre se debe mostrar como tal.
export function computeSkinfoldSummary(sites: SkinfoldSites): { sumMm: number; bodyFatPercent: number | null } {
  const values = Object.values(sites).filter((v): v is number => typeof v === "number" && !Number.isNaN(v));
  const sumMm = values.reduce((a, b) => a + b, 0);

  const allSixPresent = Object.keys(SKINFOLD_SITE_LABELS).every(
    (key) => typeof sites[key as keyof SkinfoldSites] === "number",
  );
  const bodyFatPercent = allSixPresent ? Math.round((sumMm * 0.1051 + 2.585) * 10) / 10 : null;

  return { sumMm: Math.round(sumMm * 10) / 10, bodyFatPercent };
}
