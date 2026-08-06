# Roster Pilot

Roster Pilot is an explainable live draft assistant for Sleeper fantasy football leagues. It combines projected lineup value, roster construction, positional tiers, and the estimated cost of waiting into actionable recommendations.

## Development

```bash
pnpm install
pnpm dev
pnpm test
pnpm build
```

The first implementation milestone is a browser-testable React application. The recommendation engine is kept independent of the UI so it can later run unchanged inside an Electron desktop shell.
