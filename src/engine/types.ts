export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DST';

export type StarterSlot = Position | 'FLEX';

export interface Player {
  id: string;
  name: string;
  position: Position;
  team: string;
  projectedPoints: number;
  adp?: number;
  adpDeviation?: number;
  tier?: number;
}

export interface LeagueSettings {
  teams: number;
  starters: StarterSlot[];
}

export interface DraftContext {
  currentPick: number;
  nextUserPick: number;
  roster: Player[];
  draftedPlayerIds: Set<string>;
  replacementPoints: Partial<Record<Position, number>>;
}

export interface ScoreComponents {
  lineupGain: number;
  valueOverReplacement: number;
  costOfWaiting: number;
  rosterFit: number;
}

export interface Recommendation {
  player: Player;
  score: number;
  survivalProbability: number | null;
  components: ScoreComponents;
  reasons: string[];
}

