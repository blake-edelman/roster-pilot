function erf(value: number): number {
  const sign = value < 0 ? -1 : 1;
  const x = Math.abs(value);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * x);
  const approximation = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x));
  return sign * approximation;
}

export function normalCdf(value: number, mean: number, deviation: number): number {
  if (deviation <= 0) return value < mean ? 0 : 1;
  return 0.5 * (1 + erf((value - mean) / (deviation * Math.SQRT2)));
}

/** Probability a player reaches targetPick, conditioned on being available now. */
export function conditionalSurvival(
  meanAdp: number,
  deviation: number,
  currentPick: number,
  targetPick: number,
): number {
  if (targetPick <= currentPick) return 1;
  const survivesCurrent = 1 - normalCdf(currentPick - 0.5, meanAdp, deviation);
  const survivesTarget = 1 - normalCdf(targetPick - 0.5, meanAdp, deviation);
  if (survivesCurrent <= 1e-9) return 0;
  return Math.max(0, Math.min(1, survivesTarget / survivesCurrent));
}

