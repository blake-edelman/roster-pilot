export interface PickWindow {
  currentPick: number;
  nextPick: number;
  followingPick: number;
}

export function overallPickFor(round: number, slot: number, teams: number): number {
  if (round < 1 || slot < 1 || slot > teams || teams < 2) {
    throw new Error('Invalid snake draft coordinates.');
  }
  const roundStart = (round - 1) * teams;
  return roundStart + (round % 2 === 1 ? slot : teams - slot + 1);
}

export function userPickWindow(currentPick: number, slot: number, teams: number): PickWindow {
  const candidates: number[] = [];
  const currentRound = Math.max(1, Math.floor((currentPick - 1) / teams) + 1);

  for (let round = currentRound; candidates.length < 3; round += 1) {
    const pick = overallPickFor(round, slot, teams);
    if (pick >= currentPick) candidates.push(pick);
  }

  const [onOrAfterCurrent, second, third] = candidates;
  if (onOrAfterCurrent === currentPick) {
    return { currentPick, nextPick: second, followingPick: third };
  }
  return { currentPick, nextPick: onOrAfterCurrent, followingPick: second };
}

