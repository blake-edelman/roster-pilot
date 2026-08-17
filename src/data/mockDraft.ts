import type { DraftContext, LeagueSettings, Player, Position } from '../engine/types';

export const mockLeague: LeagueSettings = {
  teams: 10,
  starters: ['QB', 'RB', 'RB', 'WR', 'WR', 'TE', 'FLEX'],
};

export const mockPlayers: Player[] = [
  { id: 'puka', name: 'Puka Nacua', position: 'WR', team: 'LAR', projectedPoints: 304, adp: 3.4, adpDeviation: 2.3, tier: 1 },
  { id: 'chase', name: 'Ja’Marr Chase', position: 'WR', team: 'CIN', projectedPoints: 300, adp: 4.1, adpDeviation: 2.8, tier: 1 },
  { id: 'gibbs', name: 'Jahmyr Gibbs', position: 'RB', team: 'DET', projectedPoints: 294, adp: 1.8, adpDeviation: 1.5, tier: 1 },
  { id: 'bijan', name: 'Bijan Robinson', position: 'RB', team: 'ATL', projectedPoints: 289, adp: 2.2, adpDeviation: 1.8, tier: 1 },
  { id: 'amonra', name: 'Amon-Ra St. Brown', position: 'WR', team: 'DET', projectedPoints: 283, adp: 7.5, adpDeviation: 3.1, tier: 1 },
  { id: 'ceedee', name: 'CeeDee Lamb', position: 'WR', team: 'DAL', projectedPoints: 281, adp: 9.2, adpDeviation: 3.4, tier: 1 },
  { id: 'achane', name: 'De’Von Achane', position: 'RB', team: 'MIA', projectedPoints: 278, adp: 9.8, adpDeviation: 3.6, tier: 1 },
  { id: 'london', name: 'Drake London', position: 'WR', team: 'ATL', projectedPoints: 269, adp: 11.6, adpDeviation: 4.1, tier: 2 },
  { id: 'nico', name: 'Nico Collins', position: 'WR', team: 'HOU', projectedPoints: 263, adp: 14.8, adpDeviation: 4.8, tier: 2 },
  { id: 'jeanty', name: 'Ashton Jeanty', position: 'RB', team: 'LV', projectedPoints: 259, adp: 13.6, adpDeviation: 4.4, tier: 2 },
  { id: 'saquon', name: 'Saquon Barkley', position: 'RB', team: 'PHI', projectedPoints: 256, adp: 15.9, adpDeviation: 5.2, tier: 2 },
  { id: 'jsn', name: 'Jaxon Smith-Njigba', position: 'WR', team: 'SEA', projectedPoints: 251, adp: 17.4, adpDeviation: 5.4, tier: 2 },
  { id: 'brock', name: 'Brock Bowers', position: 'TE', team: 'LV', projectedPoints: 244, adp: 18.8, adpDeviation: 5.1, tier: 1 },
  { id: 'nabers', name: 'Malik Nabers', position: 'WR', team: 'NYG', projectedPoints: 246, adp: 21.5, adpDeviation: 6.2, tier: 2 },
  { id: 'jacobs', name: 'Josh Jacobs', position: 'RB', team: 'GB', projectedPoints: 244, adp: 22.9, adpDeviation: 6.5, tier: 2 },
  { id: 'ajbrown', name: 'A.J. Brown', position: 'WR', team: 'PHI', projectedPoints: 241, adp: 24.4, adpDeviation: 6.3, tier: 2 },
  { id: 'breece', name: 'Breece Hall', position: 'RB', team: 'NYJ', projectedPoints: 238, adp: 27.8, adpDeviation: 7.2, tier: 3 },
  { id: 'mcbride', name: 'Trey McBride', position: 'TE', team: 'ARI', projectedPoints: 232, adp: 29.5, adpDeviation: 6.8, tier: 1 },
  { id: 'hurts', name: 'Jalen Hurts', position: 'QB', team: 'PHI', projectedPoints: 361, adp: 31.2, adpDeviation: 8.1, tier: 1 },
  { id: 'allen', name: 'Josh Allen', position: 'QB', team: 'BUF', projectedPoints: 356, adp: 34.1, adpDeviation: 8.4, tier: 1 },
  { id: 'cook', name: 'James Cook', position: 'RB', team: 'BUF', projectedPoints: 230, adp: 35.7, adpDeviation: 8.6, tier: 3 },
  { id: 'waddle', name: 'Jaylen Waddle', position: 'WR', team: 'MIA', projectedPoints: 228, adp: 38.2, adpDeviation: 9.1, tier: 3 },
  { id: 'laporta', name: 'Sam LaPorta', position: 'TE', team: 'DET', projectedPoints: 213, adp: 43.4, adpDeviation: 9.7, tier: 2 },
  { id: 'tyson', name: 'Jordyn Tyson', position: 'WR', team: 'NO', projectedPoints: 198, adp: 72.8, adpDeviation: 13.4, tier: 4 },
  { id: 'branch', name: 'Zachariah Branch', position: 'WR', team: 'ATL', projectedPoints: 164, adp: 112.6, adpDeviation: 18.2, tier: 5 },
];

export const initialDraftedIds = new Set([
  'gibbs', 'bijan', 'puka', 'chase', 'amonra', 'achane', 'ceedee', 'london', 'nico', 'jeanty', 'saquon', 'jsn',
]);

export const userRoster = [mockPlayers.find((player) => player.id === 'amonra')!];

export const replacementPoints: Partial<Record<Position, number>> = {
  QB: 302,
  RB: 178,
  WR: 184,
  TE: 162,
  K: 125,
  DST: 118,
};

export function createMockContext(draftedPlayerIds = initialDraftedIds): DraftContext {
  return {
    currentPick: 13,
    nextUserPick: 28,
    roster: userRoster,
    draftedPlayerIds,
    replacementPoints,
  };
}

export const recentPicks = [
  { pick: 8, player: 'Amon-Ra St. Brown', position: 'WR', manager: 'You' },
  { pick: 9, player: 'De’Von Achane', position: 'RB', manager: 'Gridiron Ghosts' },
  { pick: 10, player: 'CeeDee Lamb', position: 'WR', manager: 'Fourth & Long' },
  { pick: 11, player: 'Drake London', position: 'WR', manager: 'Sunday Scaries' },
  { pick: 12, player: 'Nico Collins', position: 'WR', manager: 'The Waiver Wire' },
] as const;
