import { describe, expect, it } from 'vitest';
import { overallPickFor, userPickWindow } from './draft';

describe('snake draft math', () => {
  it('calculates slot 8 picks in a 10-team draft', () => {
    expect([1, 2, 3, 4, 5].map((round) => overallPickFor(round, 8, 10))).toEqual([8, 13, 28, 33, 48]);
  });

  it('returns the next two user picks while on the clock', () => {
    expect(userPickWindow(13, 8, 10)).toEqual({ currentPick: 13, nextPick: 28, followingPick: 33 });
  });

  it('returns the upcoming pick while another manager is on the clock', () => {
    expect(userPickWindow(20, 8, 10)).toEqual({ currentPick: 20, nextPick: 28, followingPick: 33 });
  });
});

