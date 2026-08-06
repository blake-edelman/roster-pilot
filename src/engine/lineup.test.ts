import { describe, expect, it } from 'vitest';
import { marginalLineupValue, optimalLineupPoints } from './lineup';
import type { LeagueSettings, Player } from './types';

const league: LeagueSettings = {
  teams: 10,
  starters: ['QB', 'RB', 'RB', 'WR', 'WR', 'TE', 'FLEX'],
};

const player = (id: string, position: Player['position'], projectedPoints: number): Player => ({
  id,
  name: id,
  position,
  projectedPoints,
  team: 'TST',
});

describe('optimalLineupPoints', () => {
  it('assigns the flex to the highest-value eligible player', () => {
    const roster = [
      player('rb1', 'RB', 250), player('rb2', 'RB', 220), player('rb3', 'RB', 210),
      player('wr1', 'WR', 240), player('wr2', 'WR', 200), player('wr3', 'WR', 100),
      player('qb1', 'QB', 300), player('te1', 'TE', 150),
    ];
    expect(optimalLineupPoints(roster, league)).toBe(1570);
  });

  it('measures the actual lineup displacement caused by a candidate', () => {
    const roster = [player('rb1', 'RB', 200), player('rb2', 'RB', 180), player('rb3', 'RB', 170)];
    expect(marginalLineupValue(player('rb4', 'RB', 190), roster, league)).toBe(20);
  });
});

