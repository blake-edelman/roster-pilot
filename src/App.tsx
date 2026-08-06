import { useEffect, useMemo, useRef, useState } from 'react';
import { createMockContext, initialDraftedIds, mockLeague, mockPlayers, recentPicks, userRoster } from './data/mockDraft';
import { rankPlayers } from './engine/recommend';
import type { Player, Position } from './engine/types';
import { ChevronDownIcon, ClockIcon, CompassIcon, RadioIcon, SparkIcon } from './components/Icons';
import { SleeperDraftPoller } from './live/poller';
import type { DraftBundle } from './adapters/sleeper';

type Filter = 'ALL' | Position;

const filters: Filter[] = ['ALL', 'RB', 'WR', 'QB', 'TE'];

function positionClass(position: Position): string {
  return `position position--${position.toLowerCase()}`;
}

function probabilityLabel(probability: number | null): string {
  if (probability === null) return 'No ADP';
  if (probability >= 0.7) return `${Math.round(probability * 100)}% likely`;
  if (probability >= 0.35) return `${Math.round(probability * 100)}% toss-up`;
  return `${Math.round(probability * 100)}% unlikely`;
}

export function App() {
  const [filter, setFilter] = useState<Filter>('ALL');
  const [selectedId, setSelectedId] = useState<string>('brock');
  const [draftedIds, setDraftedIds] = useState(() => new Set(initialDraftedIds));
  const [roster, setRoster] = useState<Player[]>(userRoster);
  const [isOnClock, setIsOnClock] = useState(true);
  const [setupOpen, setSetupOpen] = useState(false);
  const [draftId, setDraftId] = useState('');
  const [connectionState, setConnectionState] = useState<'mock' | 'connecting' | 'live' | 'error'>('mock');
  const [connectionMessage, setConnectionMessage] = useState('Practice data');
  const [leagueName, setLeagueName] = useState('Gridiron Masters');
  const pollerRef = useRef<SleeperDraftPoller | null>(null);

  useEffect(() => () => pollerRef.current?.stop(), []);

  const recommendations = useMemo(() => {
    const context = { ...createMockContext(draftedIds), roster, currentPick: isOnClock ? 13 : 14 };
    return rankPlayers(mockPlayers, context, mockLeague);
  }, [draftedIds, roster, isOnClock]);

  const visibleRecommendations = filter === 'ALL'
    ? recommendations
    : recommendations.filter(({ player }) => player.position === filter);
  const selected = recommendations.find(({ player }) => player.id === selectedId) ?? recommendations[0];
  const safestWait = recommendations
    .filter((item) => item.survivalProbability !== null)
    .sort((a, b) => (b.survivalProbability ?? 0) - (a.survivalProbability ?? 0))[0];
  const rosterBySlot = useMemo(() => {
    const assignments = new Map<number, Player>();
    const remaining = [...roster];
    mockLeague.starters.forEach((slot, index) => {
      const exact = remaining.findIndex((player) => player.position === slot);
      if (exact >= 0) assignments.set(index, remaining.splice(exact, 1)[0]);
    });
    mockLeague.starters.forEach((slot, index) => {
      if (slot !== 'FLEX' || assignments.has(index)) return;
      const flex = remaining.findIndex((player) => ['RB', 'WR', 'TE'].includes(player.position));
      if (flex >= 0) assignments.set(index, remaining.splice(flex, 1)[0]);
    });
    return assignments;
  }, [roster]);

  function draftPlayer(player: Player) {
    setDraftedIds((current) => new Set(current).add(player.id));
    setRoster((current) => [...current, player]);
    setIsOnClock(false);
    const next = recommendations.find((item) => item.player.id !== player.id);
    if (next) setSelectedId(next.player.id);
  }

  function applyLiveBundle(bundle: DraftBundle) {
    const names = new Set(bundle.picks.map((pick) => `${pick.metadata?.first_name ?? ''} ${pick.metadata?.last_name ?? ''}`.trim().toLowerCase()));
    const matchedIds = mockPlayers.filter((player) => names.has(player.name.toLowerCase())).map((player) => player.id);
    setDraftedIds(new Set(matchedIds));
    setLeagueName(bundle.league?.name ?? 'Sleeper draft');
    setConnectionState('live');
    setConnectionMessage(`${bundle.picks.length} picks · synced just now`);
    setIsOnClock(bundle.draft.status === 'drafting');
  }

  function connectSleeper(event: React.FormEvent) {
    event.preventDefault();
    const cleanId = draftId.trim();
    if (!cleanId) return;
    pollerRef.current?.stop();
    setConnectionState('connecting');
    setConnectionMessage('Connecting…');
    const poller = new SleeperDraftPoller(cleanId, {
      onData: (bundle) => {
        applyLiveBundle(bundle);
        setSetupOpen(false);
      },
      onError: (error, retryMs) => {
        setConnectionState('error');
        setConnectionMessage(`${error.message} Retrying in ${Math.round(retryMs / 1000)}s.`);
      },
    });
    pollerRef.current = poller;
    poller.start();
  }

  function usePracticeMode() {
    pollerRef.current?.stop();
    setDraftedIds(new Set(initialDraftedIds));
    setRoster(userRoster);
    setIsOnClock(true);
    setConnectionState('mock');
    setConnectionMessage('Practice data');
    setLeagueName('Gridiron Masters');
    setSetupOpen(false);
  }

  return (
    <div className="app-frame">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Roster Pilot home">
          <span className="brand-mark"><CompassIcon /></span>
          <span>ROSTER <b>PILOT</b></span>
        </a>

        <div className="league-switcher" aria-label="Current league">
          <span className="league-avatar">GM</span>
          <span><strong>{leagueName}</strong><small>10 Team · PPR</small></span>
          <ChevronDownIcon />
        </div>

        <button className={`connection connection--${connectionState}`} onClick={() => setSetupOpen(true)}>
          <span /> {connectionState === 'live' ? 'Sleeper live' : connectionState === 'error' ? 'Sync issue' : connectionState === 'connecting' ? 'Connecting' : 'Practice mode'}
        </button>
      </header>

      <main id="top" className="workspace">
        <section className={`clock-banner ${isOnClock ? '' : 'clock-banner--waiting'}`}>
          <div className="clock-round"><small>ROUND</small><strong>02</strong></div>
          <div className="clock-copy">
            <span className="live-label"><RadioIcon /> {isOnClock ? 'You’re on the clock' : 'Pick recorded'}</span>
            <h1>{isOnClock ? 'Make pick 2.03' : 'Next pick: 3.08'}</h1>
            <p>{isOnClock ? 'Your next selection is 15 picks away.' : 'Roster Pilot is watching the room.'}</p>
          </div>
          <div className="timer" aria-label="Time remaining"><ClockIcon /><strong>{isOnClock ? '1:24' : '--:--'}</strong><small>remaining</small></div>
          <div className="pick-route" aria-label="Upcoming picks">
            <span className="route-stop route-stop--active">13<small>Now</small></span>
            <i />
            <span className="route-stop">28<small>Next</small></span>
            <i />
            <span className="route-stop">33<small>Then</small></span>
          </div>
        </section>

        <div className="content-grid">
          <section className="board panel" aria-labelledby="recommendations-title">
            <div className="panel-header">
              <div>
                <p className="section-kicker"><SparkIcon /> Decision board</p>
                <h2 id="recommendations-title">Recommended pilots</h2>
              </div>
              <span className="data-freshness">Updated just now</span>
            </div>

            <div className="filters" aria-label="Filter recommendations by position">
              {filters.map((item) => (
                <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>
                  {item === 'ALL' ? 'All players' : item}
                </button>
              ))}
            </div>

            <div className="table-head" aria-hidden="true">
              <span>Rank / player</span><span>Projected</span><span>Survives</span><span>Edge</span>
            </div>
            <div className="recommendation-list">
              {visibleRecommendations.slice(0, 8).map((recommendation, index) => {
                const { player, components, survivalProbability } = recommendation;
                const isSelected = selected?.player.id === player.id;
                return (
                  <button
                    className={`player-row ${isSelected ? 'player-row--selected' : ''}`}
                    key={player.id}
                    onClick={() => setSelectedId(player.id)}
                    aria-pressed={isSelected}
                  >
                    <span className="rank">{String(index + 1).padStart(2, '0')}</span>
                    <span className="player-main">
                      <span className={positionClass(player.position)}>{player.position}</span>
                      <span><strong>{player.name}</strong><small>{player.team} · Tier {player.tier ?? '—'} · ADP {player.adp?.toFixed(1) ?? '—'}</small></span>
                    </span>
                    <span className="metric"><strong>{player.projectedPoints}</strong><small>pts</small></span>
                    <span className={`survival ${survivalProbability !== null && survivalProbability < .35 ? 'survival--low' : ''}`}>
                      <strong>{survivalProbability === null ? '—' : `${Math.round(survivalProbability * 100)}%`}</strong>
                      <small>{probabilityLabel(survivalProbability).split(' ')[1] ?? 'chance'}</small>
                    </span>
                    <span className="edge-score"><strong>+{recommendation.score.toFixed(1)}</strong><small>{components.lineupGain} lineup</small></span>
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="decision-rail">
            {selected && (
              <section className="decision-card panel" aria-labelledby="selection-title">
                <p className="section-kicker">Flight plan</p>
                <div className="selection-title">
                  <span className={positionClass(selected.player.position)}>{selected.player.position}</span>
                  <div><h2 id="selection-title">{selected.player.name}</h2><p>{selected.player.team} · Projected {selected.player.projectedPoints} pts</p></div>
                </div>

                <div className="score-orbit">
                  <div><strong>{selected.score.toFixed(1)}</strong><span>Roster Pilot edge</span></div>
                  <p>{selected.reasons[0]}</p>
                </div>

                <dl className="score-breakdown">
                  <div><dt>Lineup gain</dt><dd>+{selected.components.lineupGain}</dd></div>
                  <div><dt>Over replacement</dt><dd>+{selected.components.valueOverReplacement}</dd></div>
                  <div><dt>Cost of waiting</dt><dd>+{selected.components.costOfWaiting}</dd></div>
                  <div><dt>Roster fit</dt><dd>+{selected.components.rosterFit}</dd></div>
                </dl>

                <div className="insight"><SparkIcon /><p><strong>Pilot’s read</strong>{selected.reasons[1]} {selected.reasons[2]}</p></div>
                <button className="draft-button" disabled={!isOnClock} onClick={() => draftPlayer(selected.player)}>
                  {isOnClock ? `Draft ${selected.player.name}` : 'Pick submitted'}
                </button>
                <p className="button-note">Practice mode · no external pick will be made</p>
              </section>
            )}

            <section className="wait-card panel">
              <span className="wait-icon">↘</span>
              <div><p className="section-kicker">Safe to wait</p><h3>{safestWait?.player.name}</h3><p>{Math.round((safestWait?.survivalProbability ?? 0) * 100)}% chance to reach pick 28</p></div>
            </section>
          </aside>
        </div>

        <section className="lower-grid">
          <div className="roster-strip panel">
            <div className="panel-header compact"><div><p className="section-kicker">Your build</p><h2>Starting roster</h2></div><span>{roster.length}/7 filled</span></div>
            <div className="roster-slots">
              {mockLeague.starters.map((slot, index) => {
                const rostered = rosterBySlot.get(index);
                return <div className={rostered ? 'slot slot--filled' : 'slot'} key={`${slot}-${index}`}><small>{slot}</small><strong>{rostered?.name ?? 'Open slot'}</strong>{rostered && <span>{rostered.team} · {rostered.projectedPoints} pts</span>}</div>;
              })}
            </div>
          </div>

          <div className="recent panel">
            <div className="panel-header compact"><div><p className="section-kicker">Radar</p><h2>Recent picks</h2></div><span className="run-alert">WR run · 4 of 5</span></div>
            <ol>
              {[...recentPicks].reverse().map((pick) => <li key={pick.pick}><span className="pick-number">{pick.pick}</span><span className={positionClass(pick.position as Position)}>{pick.position}</span><span><strong>{pick.player}</strong><small>{pick.manager}</small></span></li>)}
            </ol>
          </div>
        </section>
      </main>

      {setupOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSetupOpen(false)}>
          <section className="setup-modal panel" role="dialog" aria-modal="true" aria-labelledby="setup-title">
            <button className="modal-close" aria-label="Close connection setup" onClick={() => setSetupOpen(false)}>×</button>
            <p className="section-kicker"><RadioIcon /> Draft source</p>
            <h2 id="setup-title">Connect Roster Pilot</h2>
            <p className="setup-lede">Sleeper’s public API is read-only. Roster Pilot watches picks, but never submits them.</p>
            <form onSubmit={connectSleeper}>
              <label htmlFor="draft-id">Sleeper draft ID</label>
              <input id="draft-id" value={draftId} onChange={(event) => setDraftId(event.target.value)} placeholder="e.g. 123456789012345678" autoFocus />
              <p className={`connection-message connection-message--${connectionState}`}>{connectionMessage}</p>
              <button className="draft-button" type="submit" disabled={connectionState === 'connecting' || !draftId.trim()}>
                {connectionState === 'connecting' ? 'Connecting…' : 'Connect live draft'}
              </button>
            </form>
            <div className="setup-divider"><span>or</span></div>
            <button className="practice-button" onClick={usePracticeMode}>Continue with practice draft</button>
          </section>
        </div>
      )}
    </div>
  );
}
