import { describe, expect, it } from 'vitest';
import { conditionalSurvival } from './statistics';

describe('conditionalSurvival', () => {
  it('is one for a target that is not later than the current pick', () => {
    expect(conditionalSurvival(20, 5, 13, 13)).toBe(1);
  });

  it('decreases as the target pick moves later', () => {
    const next = conditionalSurvival(25, 7, 10, 18);
    const following = conditionalSurvival(25, 7, 10, 28);
    expect(next).toBeGreaterThan(following);
    expect(following).toBeGreaterThanOrEqual(0);
  });

  it('conditions on the player already being available', () => {
    const probability = conditionalSurvival(8, 4, 15, 20);
    expect(probability).toBeGreaterThan(0);
    expect(probability).toBeLessThan(1);
  });
});

