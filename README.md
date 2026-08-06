# Roster Pilot

Roster Pilot is an explainable live draft assistant for Sleeper fantasy football leagues. It combines projected lineup value, roster construction, positional tiers, and the estimated cost of waiting into actionable recommendations.

## Development

```bash
pnpm install
pnpm dev
pnpm test
pnpm build
pnpm desktop
pnpm dist:win
```

## Current MVP

- Flex-aware lineup optimization against position-level replacement players
- Conditional ADP survival estimates for the next user pick
- Explainable score components and player-specific draft guidance
- Position filters, recent-pick context, roster tracking, and safe-to-wait callouts
- Deterministic practice draft data with interactive pick submission
- Responsive desktop and mobile layouts
- Read-only Sleeper draft connection with retry/backoff and practice fallback
- Context-isolated Electron shell and Windows x64 portable packaging

The recommendation engine remains independent of the UI while running unchanged inside the Electron desktop shell and accepting normalized Sleeper draft state.

See [BUILD.md](BUILD.md) for desktop build and release details.
