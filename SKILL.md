# skillrun-ci-harness

Use this skill when an agent skill needs a repeatable acceptance check before release.

## Inputs
A JSON fixture with `skill`, `files`, `commands`, and `cases`.

## Side effects
Read-only. The CLI reads local fixture files and prints reports. It does not execute fixture commands or call external APIs.

## Approval
No approval is needed for local validation. Human approval is required before separately running commands that mutate files or contact services.

## Validation
Run `npm test`, `npm run check`, and `npm run smoke`.
