import type { LeagueSettings, Position, StarterSlot } from '../engine/types';

const API_ROOT = 'https://api.sleeper.app/v1';

export interface SleeperLeague {
  league_id: string;
  name: string;
  total_rosters: number;
  roster_positions: string[];
  scoring_settings: Record<string, number>;
}

export interface SleeperDraft {
  draft_id: string;
  league_id: string | null;
  status: 'pre_draft' | 'drafting' | 'paused' | 'complete';
  type: string;
  settings: { teams: number; rounds: number; pick_timer?: number };
  draft_order: Record<string, number> | null;
  slot_to_roster_id: Record<string, number> | null;
}

export interface SleeperPick {
  player_id: string;
  picked_by: string;
  roster_id?: string;
  round: number;
  draft_slot: number;
  pick_no: number;
  is_keeper?: boolean | null;
  metadata?: {
    first_name?: string;
    last_name?: string;
    position?: string;
    team?: string;
  };
}

export interface SleeperTradedPick {
  round: number;
  roster_id: number;
  previous_owner_id: number;
  owner_id: number;
}

export interface DraftBundle {
  draft: SleeperDraft;
  league: SleeperLeague | null;
  picks: SleeperPick[];
  tradedPicks: SleeperTradedPick[];
  fetchedAt: string;
}

export interface NormalizedPick {
  playerId: string;
  pickNumber: number;
  round: number;
  draftSlot: number;
  rosterId: number | null;
  userId: string | null;
  isKeeper: boolean;
  playerName: string | null;
  position: Position | null;
  team: string | null;
}

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

async function readJson<T>(fetcher: FetchLike, path: string): Promise<T> {
  const response = await fetcher(`${API_ROOT}${path}`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Sleeper request failed (${response.status}) for ${path}`);
  return response.json() as Promise<T>;
}

export async function loadSleeperDraft(
  draftId: string,
  fetcher: FetchLike = fetch,
): Promise<DraftBundle> {
  const draft = await readJson<SleeperDraft>(fetcher, `/draft/${encodeURIComponent(draftId)}`);
  if (draft.type !== 'snake') throw new Error(`Roster Pilot currently supports snake drafts, not ${draft.type}.`);

  const [picks, tradedPicks, league] = await Promise.all([
    readJson<SleeperPick[]>(fetcher, `/draft/${encodeURIComponent(draftId)}/picks`),
    readJson<SleeperTradedPick[]>(fetcher, `/draft/${encodeURIComponent(draftId)}/traded_picks`),
    draft.league_id
      ? readJson<SleeperLeague>(fetcher, `/league/${encodeURIComponent(draft.league_id)}`)
      : Promise.resolve(null),
  ]);

  return { draft, picks, tradedPicks, league, fetchedAt: new Date().toISOString() };
}

const starterMap: Record<string, StarterSlot | undefined> = {
  QB: 'QB', RB: 'RB', WR: 'WR', TE: 'TE', K: 'K', DEF: 'DST',
  FLEX: 'FLEX', WRRB_FLEX: 'FLEX', REC_FLEX: 'FLEX',
};

export function normalizeLeagueSettings(bundle: DraftBundle): LeagueSettings {
  const sourcePositions = bundle.league?.roster_positions ?? [];
  const starters = sourcePositions
    .filter((position) => position !== 'BN' && position !== 'IR' && position !== 'TAXI')
    .map((position) => starterMap[position])
    .filter((position): position is StarterSlot => Boolean(position));

  if (starters.length === 0) {
    throw new Error('The Sleeper league does not expose any supported starting roster positions.');
  }

  return { teams: bundle.draft.settings.teams, starters };
}

export function normalizeSleeperPicks(picks: SleeperPick[]): NormalizedPick[] {
  return [...picks]
    .sort((left, right) => left.pick_no - right.pick_no)
    .map((pick) => {
      const position = pick.metadata?.position;
      const normalizedPosition = position === 'DEF' ? 'DST' : position;
      const supported = ['QB', 'RB', 'WR', 'TE', 'K', 'DST'].includes(normalizedPosition ?? '')
        ? normalizedPosition as Position
        : null;
      const playerName = [pick.metadata?.first_name, pick.metadata?.last_name].filter(Boolean).join(' ') || null;
      return {
        playerId: pick.player_id,
        pickNumber: pick.pick_no,
        round: pick.round,
        draftSlot: pick.draft_slot,
        rosterId: pick.roster_id ? Number(pick.roster_id) : null,
        userId: pick.picked_by || null,
        isKeeper: Boolean(pick.is_keeper),
        playerName,
        position: supported,
        team: pick.metadata?.team ?? null,
      };
    });
}

export function slotForUser(draft: SleeperDraft, userId: string): number | null {
  return draft.draft_order?.[userId] ?? null;
}

