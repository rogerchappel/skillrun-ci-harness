# Safety Notes

The harness does not execute commands. It preserves a dry-run command plan with `execute=false` so agents cannot accidentally turn fixture validation into action.

Recommended reviewer policy:

- `read-only`: may be run in CI.
- `writes-local`: inspect before running.
- `external`: requires explicit approval and credentials review.
