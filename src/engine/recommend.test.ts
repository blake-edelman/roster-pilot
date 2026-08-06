import { describe, expect, it } from 'vitest';
import { rankPlayers } from './recommend';
import type { DraftContext, LeagueSettings, Player } from './types';

const league: LeagueSettings = { teams: 10, starters: ['QB', 'RB', 'RB', 'WR', 'WR', 'TE', 'FLEX'] };
const players: Player[] = [
  { id: 'alpha', name: 'Alpha Receiver', position: 'WR', team: 'AAA', projectedPoints: 250, adp: 14, adpDeviation: 4 },
  { id: 'steady', name: 'Steady Runner', position: 'RB', team: 'BBB', projectedPoints: 238, adp: 29, adpDeviation: 6 },
  { id: 'taken', name: 'Taken Player', position: 'RB', team: 'CCC', projectedPoints: 300, adp: 5 },
];
const context: DraftContext = {
  currentPick: 13,
  nextUserPick: 28,
  roster: [],
  draftedPlayerIds: new Set(['taken']),
  replacementPoints: { RB: 160, WR: 165 },
};

describe('rankPlayers', () => {
  it('never recommends drafted players and exposes score components', () => {
    const recommendations = rankPlayers(players, context, league);
    expect(recommendations.map((item) => item.player.id)).not.toContain('taken');
    expect(recommendations[0].components.lineupGain).toBeGreaterThan(0);
    expect(recommendations[0].reasons.length).toBeGreaterThanOrEqual(2);
  });

  it('raises urgency for a player unlikely to survive', () => {
    const recommendations = rankPlayers(players, context, league);
    const alpha = recommendations.find((item) => item.player.id === 'alpha')!;
    const steady = recommendations.find((item) => item.player.id === 'steady')!;
    expect(alpha.components.costOfWaiting).toBeGreaterThan(steady.components.costOfWaiting);
  });
});

