# PRD: skillrun-ci-harness

## Goal
Provide a no-network harness that lets agents and maintainers validate skill acceptance fixtures before a skill is proposed or released.

## Users
- Agent builders packaging reusable skills.
- Maintainers reviewing skill pull requests.
- CI jobs that need deterministic reports.

## MVP
Read a JSON fixture, validate required fields, summarize cases, and emit JSON or Markdown reports without executing commands.

## Non-goals
- Running arbitrary commands.
- Writing to GitHub or external services.
- Replacing human review of skill safety boundaries.
