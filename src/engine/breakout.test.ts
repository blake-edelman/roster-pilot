import { describe, expect, it } from 'vitest';
import { breakoutScore, classifyBreakout, rankBreakoutCandidates, upsideScore } from './breakout';
import type { BreakoutProfile, BreakoutSignals } from './breakout';
import type { Player } from './types';

const strongRole: BreakoutSignals = {
  opportunity: 88, talent: 82, roleQuality: 78, ageCurve: 90,
  offense: 70, priceDiscount: 72, contingentUpside: 80, roleCertainty: 84,
};
const uncertainCeiling: BreakoutSignals = {
  opportunity: 56, talent: 78, roleQuality: 48, ageCurve: 92,
  offense: 68, priceDiscount: 88, contingentUpside: 96, roleCertainty: 38,
};

describe('breakout radar', () => {
  it('uses the documented weighted breakout formula', () => {
    expect(breakoutScore(strongRole)).toBe(82);
  });

  it('separates bankable breakouts from contingent dark horses', () => {
    expect(classifyBreakout(strongRole)).toBe('BREAKOUT');
    expect(upsideScore(uncertainCeiling)).toBeGreaterThanOrEqual(68);
    expect(classifyBreakout(uncertainCeiling)).toBe('DARK_HORSE');
  });

  it('clamps malformed signal values to the zero-to-100 range', () => {
    expect(breakoutScore({ ...strongRole, opportunity: 500 })).toBeLessThanOrEqual(100);
    expect(breakoutScore({ ...strongRole, opportunity: -500 })).toBeGreaterThanOrEqual(0);
  });

  it('excludes drafted players and preserves evidence', () => {
    const players: Player[] = [
      { id: 'a', name: 'Available', position: 'WR', team: 'AAA', projectedPoints: 200 },
      { id: 'b', name: 'Drafted', position: 'RB', team: 'BBB', projectedPoints: 190 },
    ];
    const profiles: BreakoutProfile[] = [
      { playerId: 'a', signals: strongRole, evidence: ['Clear path to full-time routes.'] },
      { playerId: 'b', signals: uncertainCeiling, evidence: ['Contingent role.'] },
    ];
    const result = rankBreakoutCandidates(players, profiles, new Set(['b']));
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ player: { id: 'a' }, evidence: ['Clear path to full-time routes.'] });
  });
});

