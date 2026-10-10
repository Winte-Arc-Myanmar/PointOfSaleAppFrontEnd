/** Tax rates are stored as fractions (0.05); people read and type percents (5). */
export function taxPercent(fraction: string | number | null | undefined): string {
  const value = Number(fraction);
  if (!Number.isFinite(value)) return "";
  return String(Number((value * 100).toFixed(2)));
}

export function taxFraction(percent: string): string {
  return (Number(percent) / 100).toFixed(4);
}

export function isTaxPercent(percent: string): boolean {
  const value = Number(percent.trim());
  return percent.trim() !== "" && Number.isFinite(value) && value >= 0 && value <= 100;
}
