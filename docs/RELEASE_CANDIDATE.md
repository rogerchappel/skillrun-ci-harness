# Release Candidate

## Classification

ship

## Verification

- `npm ci`: pass
- `npm test`: pass
- `npm run check`: pass
- `npm run smoke`: pass
- `npm run package:smoke`: pass

## Notes

Initial public build includes a read-only fixture validator, JSON and Markdown reports, fixture-backed tests, CLI quickstart, and side-effect policy docs. Release verification starts from the dependency graph pinned in `package-lock.json`; CI runs `npm ci` before the complete `npm run release:check` suite.
