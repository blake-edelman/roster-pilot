import type { Player } from './types';

export type BreakoutLabel = 'BREAKOUT' | 'DARK_HORSE' | 'VALUE' | 'MONITOR';

export interface BreakoutSignals {
  opportunity: number;
  talent: number;
  roleQuality: number;
  ageCurve: number;
  offense: number;
  priceDiscount: number;
  contingentUpside: number;
  roleCertainty: number;
}

export interface BreakoutProfile {
  playerId: string;
  signals: BreakoutSignals;
  evidence: string[];
}

export interface BreakoutCandidate {
  player: Player;
  label: BreakoutLabel;
  breakoutScore: number;
  upsideScore: number;
  signals: BreakoutSignals;
  evidence: string[];
}

const weights = {
  opportunity: 0.30,
  talent: 0.25,
  roleQuality: 0.15,
  ageCurve: 0.10,
  offense: 0.10,
  priceDiscount: 0.10,
} as const;

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function breakoutScore(signals: BreakoutSignals): number {
  return Math.round(
    Object.entries(weights).reduce(
      (total, [signal, weight]) => total + clamp(signals[signal as keyof typeof weights]) * weight,
      0,
    ),
  );
}

export function upsideScore(signals: BreakoutSignals, baseScore = breakoutScore(signals)): number {
  return Math.round(
    baseScore * 0.55
      + clamp(signals.contingentUpside) * 0.30
      + clamp(signals.priceDiscount) * 0.15,
  );
}

export function classifyBreakout(signals: BreakoutSignals): BreakoutLabel {
  const score = breakoutScore(signals);
  const upside = upsideScore(signals, score);
  if (score >= 75 && signals.opportunity >= 65 && signals.roleCertainty >= 60) return 'BREAKOUT';
  if (upside >= 68 && signals.contingentUpside >= 75 && signals.roleCertainty < 60) return 'DARK_HORSE';
  if (signals.priceDiscount >= 70 && score >= 60) return 'VALUE';
  return 'MONITOR';
}

export function rankBreakoutCandidates(
  players: Player[],
  profiles: BreakoutProfile[],
  draftedPlayerIds: Set<string>,
): BreakoutCandidate[] {
  const playersById = new Map(players.map((player) => [player.id, player]));
  return profiles
    .filter((profile) => !draftedPlayerIds.has(profile.playerId) && playersById.has(profile.playerId))
    .map((profile) => {
      const score = breakoutScore(profile.signals);
      return {
        player: playersById.get(profile.playerId)!,
        label: classifyBreakout(profile.signals),
        breakoutScore: score,
        upsideScore: upsideScore(profile.signals, score),
        signals: profile.signals,
        evidence: profile.evidence,
      };
    })
    .sort((left, right) => {
      const leftScore = left.label === 'DARK_HORSE' ? left.upsideScore : left.breakoutScore;
      const rightScore = right.label === 'DARK_HORSE' ? right.upsideScore : right.breakoutScore;
      return rightScore - leftScore;
    });
}

