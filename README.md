# skillrun-ci-harness

Local-first acceptance harness for agent skill fixtures. It checks that a skill declares its trigger, required files, dry-run verification commands, side-effect labels, and expected evidence before release.

## Quickstart

```bash
npm install
npm run smoke
node bin/skillrun-ci-harness.js examples/skill-fixture.json --format json
```

The optional `--format` value must be `json` (the default) or `markdown`.
`--help` prints the usage line. Unknown options, extra fixture paths, duplicate
`--format` options, and unsupported or missing format values print a concise
error plus usage information to stderr and exit with status 64 without
generating a report.

The CLI exits with status 0 for a valid fixture and 2 when a report contains
validation errors. Invalid JSON exits with status 65, while a fixture that
cannot be read exits with status 66; both failures produce a concise stderr
message without a JavaScript stack trace.

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

A fixture is a JSON object containing an object-valued `skill` plus arrays of
object-valued `files`, `commands`, and `cases`. Shape errors—including a null
root or null/scalar array entries—are returned as structured validation
findings. Commands are declarations only; the harness never executes them.

## Limitations

- JSON fixtures only in the initial release.
- No connector writes, issue creation, or command execution.
- File paths are validated structurally, not checked for existence unless a future adapter adds that behavior.

## Safety

This tool is safe for CI because it reads fixture data and prints reports. Treat any declared command with `writes-local` or `external` as requiring separate approval before execution.

## Security

See [SECURITY.md](SECURITY.md) for supported reporting paths and local-first scope. Do not include private fixtures, credentials, or unreleased connector payloads in public issues.
