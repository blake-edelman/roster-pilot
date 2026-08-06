# Roster Pilot

Roster Pilot is an explainable live draft assistant for Sleeper fantasy football leagues. It combines projected lineup value, roster construction, positional tiers, and the estimated cost of waiting into actionable recommendations.

## Development

```bash
pnpm install
pnpm dev
pnpm test
pnpm build
```

## Current MVP

- Flex-aware lineup optimization against position-level replacement players
- Conditional ADP survival estimates for the next user pick
- Explainable score components and player-specific draft guidance
- Position filters, recent-pick context, roster tracking, and safe-to-wait callouts
- Deterministic practice draft data with interactive pick submission
- Responsive desktop and mobile layouts

The recommendation engine is independent of the UI so it can later run unchanged inside an Electron desktop shell and accept normalized Sleeper draft state.
