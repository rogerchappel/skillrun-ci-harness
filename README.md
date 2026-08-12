# skillrun-ci-harness

Local-first acceptance harness for agent skill fixtures. It checks that a skill declares its trigger, required files, dry-run verification commands, side-effect labels, and expected evidence before release.

## Quickstart

```bash
npm ci
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
npm ci
npm run release:check
```

The tracked `package-lock.json` is the reproducible dependency contract for a
fresh checkout. CI installs exactly that dependency graph with `npm ci` before
running `release:check`; rerun both commands locally after changing the
manifest or lockfile.

`npm run release:check` includes `package:smoke`, which performs an
`npm pack --dry-run` and verifies that the published tarball contains the CLI,
source files, fixture, skill instructions, README, license, and manifest.

## Fixture shape

A fixture is a JSON object containing an object-valued `skill` plus arrays of
object-valued `files`, `commands`, and `cases`. Shape errors—including a null
root or null/scalar array entries—are returned as structured validation
findings. Commands are declarations only; the harness never executes them.

The following fields are strings:

- `skill.name` and `skill.when`
- each `files[].path` and `files[].purpose`
- each `commands[].name`, `commands[].command`, and `commands[].sideEffect`
- each `cases[].name` and `cases[].expectedEvidence`

Names, trigger guidance, file paths, command text, and case names must be
non-empty after surrounding whitespace is trimmed; whitespace-only values are
treated as empty and omitted from the dry-run command plan. File purpose and
expected evidence are recommended and produce warnings when empty.
`commands[].sideEffect` must be `read-only`,
`writes-local`, or `external`. Nulls, numbers, booleans, arrays, and objects in
these fields produce path-specific errors such as `commands[0].command`; they
are removed during normalization and never enter the dry-run plan.

## Limitations

- JSON fixtures only in the initial release.
- No connector writes, issue creation, or command execution.
- File paths are validated structurally, not checked for existence unless a future adapter adds that behavior.

## Safety

This tool is safe for CI because it reads fixture data and prints reports. Treat any declared command with `writes-local` or `external` as requiring separate approval before execution.

## Security

See [SECURITY.md](SECURITY.md) for supported reporting paths and local-first scope. Do not include private fixtures, credentials, or unreleased connector payloads in public issues.
