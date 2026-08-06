import { canFill, marginalLineupValue } from './lineup';
import { conditionalSurvival } from './statistics';
import type { DraftContext, LeagueSettings, Player, Recommendation } from './types';

function round(value: number, places = 1): number {
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}

function rosterFit(player: Player, roster: Player[], league: LeagueSettings): number {
  const matchingSlots = league.starters.filter((slot) => canFill(player.position, slot)).length;
  const matchingRoster = roster.filter((rostered) => rostered.position === player.position).length;
  return Math.max(0, Math.min(3, matchingSlots - matchingRoster)) * 1.5;
}

export function rankPlayers(
  players: Player[],
  context: DraftContext,
  league: LeagueSettings,
): Recommendation[] {
  return players
    .filter((player) => !context.draftedPlayerIds.has(player.id))
    .map((player): Recommendation => {
      const replacement = context.replacementPoints[player.position] ?? player.projectedPoints;
      const valueOverReplacement = Math.max(0, player.projectedPoints - replacement);
      const lineupGain = marginalLineupValue(player, context.roster, league);
      const survivalProbability = player.adp !== undefined
        ? conditionalSurvival(
            player.adp,
            Math.max(1, player.adpDeviation ?? 8),
            context.currentPick,
            context.nextUserPick,
          )
        : null;
      const disappearanceRisk = survivalProbability === null ? 0.5 : 1 - survivalProbability;
      const costOfWaiting = valueOverReplacement * disappearanceRisk;
      const fit = rosterFit(player, context.roster, league);

      const components = {
        lineupGain: round(lineupGain),
        valueOverReplacement: round(valueOverReplacement),
        costOfWaiting: round(costOfWaiting),
        rosterFit: round(fit),
      };
      const score = round(lineupGain * 1.5 + valueOverReplacement * 0.35 + costOfWaiting * 0.8 + fit, 2);
      const reasons = [
        lineupGain > 0
          ? `Adds ${round(lineupGain)} projected points to your best legal lineup.`
          : 'Profiles as depth rather than an immediate lineup upgrade.',
        survivalProbability === null
          ? 'ADP confidence is unavailable; wait cost uses a neutral assumption.'
          : survivalProbability < 0.35
            ? `Only a ${Math.round(survivalProbability * 100)}% estimated chance to reach your next pick.`
            : `${Math.round(survivalProbability * 100)}% estimated chance to reach your next pick.`,
      ];

      if (player.tier !== undefined) reasons.push(`Currently in ${player.position} tier ${player.tier}.`);

      return { player, score, survivalProbability, components, reasons };
    })
    .sort((left, right) => right.score - left.score || right.player.projectedPoints - left.player.projectedPoints);
}

