// Percentil por rango promedio (0-100), mismo criterio que pandas `.rank(pct=True)`:
// empates comparten el rango promedio en vez de desempatar por orden de aparición.
export function percentileRanks(values: number[]): number[] {
  const n = values.length;
  if (n === 0) return [];
  if (n === 1) return [100];

  const indexed = values.map((v, i) => ({ v, i }));
  indexed.sort((a, b) => a.v - b.v);

  const ranks = new Array<number>(n);
  let idx = 0;
  while (idx < n) {
    let j = idx;
    while (j + 1 < n && indexed[j + 1].v === indexed[idx].v) j++;
    const avgRank = (idx + j) / 2;
    for (let k = idx; k <= j; k++) ranks[indexed[k].i] = avgRank;
    idx = j + 1;
  }

  return ranks.map((r) => (r / (n - 1)) * 100);
}

// Dado un cohorte de { id, statsByKey }, devuelve percentiles por clave dentro del cohorte.
export function percentilesForCohort<K extends string>(
  cohort: { id: string; stats: Record<K, number> }[],
  keys: K[],
): Map<string, Record<K, number>> {
  const result = new Map<string, Record<K, number>>();
  for (const item of cohort) result.set(item.id, {} as Record<K, number>);

  for (const key of keys) {
    const values = cohort.map((c) => c.stats[key] ?? 0);
    const percentiles = percentileRanks(values);
    cohort.forEach((c, i) => {
      result.get(c.id)![key] = percentiles[i];
    });
  }

  return result;
}
