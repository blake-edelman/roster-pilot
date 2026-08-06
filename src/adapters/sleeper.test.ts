import { describe, expect, it, vi } from 'vitest';
import { loadSleeperDraft, normalizeLeagueSettings, normalizeSleeperPicks, slotForUser } from './sleeper';
import type { SleeperDraft, SleeperLeague, SleeperPick } from './sleeper';

const draft: SleeperDraft = {
  draft_id: 'draft-1',
  league_id: 'league-1',
  status: 'drafting',
  type: 'snake',
  settings: { teams: 10, rounds: 16, pick_timer: 90 },
  draft_order: { 'user-8': 8 },
  slot_to_roster_id: { '8': 3 },
};

const league: SleeperLeague = {
  league_id: 'league-1',
  name: 'Gridiron Masters',
  total_rosters: 10,
  roster_positions: ['QB', 'RB', 'RB', 'WR', 'WR', 'TE', 'FLEX', 'BN', 'BN', 'IR'],
  scoring_settings: { rec: 1 },
};

const picks: SleeperPick[] = [
  { player_id: 'wr-1', picked_by: 'user-8', roster_id: '3', round: 1, draft_slot: 8, pick_no: 8, metadata: { first_name: 'Alpha', last_name: 'Receiver', position: 'WR', team: 'AAA' } },
  { player_id: 'def-1', picked_by: '', round: 1, draft_slot: 1, pick_no: 1, metadata: { first_name: 'Buffalo', last_name: 'Bills', position: 'DEF', team: 'BUF' } },
];

describe('Sleeper adapter', () => {
  it('loads a draft bundle from documented endpoints', async () => {
    const responses: Record<string, unknown> = {
      '/draft/draft-1': draft,
      '/draft/draft-1/picks': picks,
      '/draft/draft-1/traded_picks': [],
      '/league/league-1': league,
    };
    const fetcher = vi.fn(async (url: string) => {
      const path = new URL(url).pathname.replace('/v1', '');
      return new Response(JSON.stringify(responses[path]), { status: responses[path] ? 200 : 404 });
    });

    const bundle = await loadSleeperDraft('draft-1', fetcher);
    expect(bundle.league?.name).toBe('Gridiron Masters');
    expect(bundle.picks).toHaveLength(2);
    expect(fetcher).toHaveBeenCalledTimes(4);
  });

  it('normalizes supported starter slots and discards bench positions', () => {
    const bundle = { draft, league, picks, tradedPicks: [], fetchedAt: new Date(0).toISOString() };
    expect(normalizeLeagueSettings(bundle).starters).toEqual(['QB', 'RB', 'RB', 'WR', 'WR', 'TE', 'FLEX']);
  });

  it('sorts and normalizes picks including DEF to DST', () => {
    const normalized = normalizeSleeperPicks(picks);
    expect(normalized[0]).toMatchObject({ pickNumber: 1, position: 'DST', userId: null });
    expect(normalized[1]).toMatchObject({ pickNumber: 8, rosterId: 3, playerName: 'Alpha Receiver' });
  });

  it('resolves the user draft slot', () => {
    expect(slotForUser(draft, 'user-8')).toBe(8);
    expect(slotForUser(draft, 'unknown')).toBeNull();
  });
});

