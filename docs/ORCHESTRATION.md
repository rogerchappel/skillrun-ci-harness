# Orchestration

1. Agent receives or creates a skill fixture.
2. Agent runs `skillrun-ci-harness <fixture> --format markdown`.
3. Agent attaches the report to the skill proposal or PR.
4. Human reviewer decides whether to run any declared commands separately.

The harness is intentionally read-only. It treats command fields as declarations and never executes them.
