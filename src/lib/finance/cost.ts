// El costo total de temporada se asume monthlySalary * 12 (contrato de año
// completo) salvo indicación contraria — es una simplificación consciente
// para no tener que pedir fecha de inicio/fin de contrato en el MVP.
export function seasonCost(monthlySalary: number): number {
  return monthlySalary * 12;
}

export function costPerMinute(monthlySalary: number, minutesPlayed: number): number | null {
  if (minutesPlayed <= 0) return null;
  return seasonCost(monthlySalary) / minutesPlayed;
}
