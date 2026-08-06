# Building Roster Pilot

## Requirements

- Node.js 22 or newer
- pnpm 11
- Windows for the native Windows packaging workflow

## Development

Run the browser-testable renderer:

```bash
pnpm install
pnpm dev
```

To run the Electron shell during development, start the renderer first and then launch Electron with the development URL:

```powershell
$env:ROSTER_PILOT_DEV_URL='http://127.0.0.1:5173'
pnpm desktop
```

Without `ROSTER_PILOT_DEV_URL`, `pnpm desktop` loads the production files from `dist`, so run `pnpm build` first.

## Verification

```bash
pnpm test
pnpm build
```

The automated suite covers snake-pick math, flex-aware lineup optimization, conditional survival, recommendation scoring, Sleeper response normalization, retry behavior, filtering, and practice-pick roster updates.

## Windows portable build

```bash
pnpm dist:win
```

The executable is written to `release/Roster-Pilot-<version>-Windows-x64.exe`. The executable is intentionally ignored by Git; distribute it through a release artifact rather than repository history.

The build uses Electron context isolation, disables renderer Node integration, enables the Chromium sandbox, and packages application files into ASAR. Production distribution should add a custom icon and a trusted code-signing certificate to reduce Windows SmartScreen warnings.
