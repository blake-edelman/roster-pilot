import type { LeagueSettings, Player, Position, StarterSlot } from './types';

export function canFill(position: Position, slot: StarterSlot): boolean {
  return position === slot || (slot === 'FLEX' && (position === 'RB' || position === 'WR' || position === 'TE'));
}

/**
 * Finds the best legal starting lineup. Draft rosters are small enough that an
 * exact search is both clearer and safer than a fixed RB/WR flex allocation.
 */
export function optimalLineupPoints(players: Player[], settings: LeagueSettings): number {
  const memo = new Map<string, number>();

  function search(slotIndex: number, usedMask: bigint): number {
    if (slotIndex >= settings.starters.length) return 0;
    const key = `${slotIndex}:${usedMask}`;
    const cached = memo.get(key);
    if (cached !== undefined) return cached;

    const slot = settings.starters[slotIndex];
    let best = search(slotIndex + 1, usedMask);

    for (let index = 0; index < players.length; index += 1) {
      const bit = 1n << BigInt(index);
      if ((usedMask & bit) !== 0n || !canFill(players[index].position, slot)) continue;
      best = Math.max(best, players[index].projectedPoints + search(slotIndex + 1, usedMask | bit));
    }

    memo.set(key, best);
    return best;
  }

  return search(0, 0n);
}

export function marginalLineupValue(candidate: Player, roster: Player[], settings: LeagueSettings): number {
  return optimalLineupPoints([...roster, candidate], settings) - optimalLineupPoints(roster, settings);
}

export function openEligibleSlots(roster: Player[], settings: LeagueSettings): number {
  const filledPoints = optimalLineupPoints(roster, settings);
  const placeholder: Player = {
    id: '__placeholder__',
    name: 'Replacement starter',
    position: 'RB',
    team: '',
    projectedPoints: 0.001,
  };

  // Kept as a generic signal for the explanation layer. Exact candidate fit is
  // determined by marginalLineupValue, not by this count.
  return filledPoints >= 0 && roster.length < settings.starters.length ? settings.starters.length - roster.length : 0;
}

