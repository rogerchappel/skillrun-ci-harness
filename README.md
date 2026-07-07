# skillrun-ci-harness

Local-first acceptance harness for agent skill fixtures. It checks that a skill declares its trigger, required files, dry-run verification commands, side-effect labels, and expected evidence before release.

## Quickstart

```bash
npm install
npm run smoke
node bin/skillrun-ci-harness.js examples/skill-fixture.json --format json
```

## Release readiness

Run the same checks as CI before publishing or tagging:

```bash
npm run release:check
npm run package:smoke
```

`npm run package:smoke` performs an `npm pack --dry-run` and verifies that the
published tarball contains the CLI, source files, fixture, skill instructions,
README, license, and manifest.

## Fixture shape

A fixture contains `skill`, `files`, `commands`, and `cases`. Commands are declarations only; the harness never executes them.

## Limitations

- JSON fixtures only in the initial release.
- No connector writes, issue creation, or command execution.
- File paths are validated structurally, not checked for existence unless a future adapter adds that behavior.

## Safety

This tool is safe for CI because it reads fixture data and prints reports. Treat any declared command with `writes-local` or `external` as requiring separate approval before execution.
