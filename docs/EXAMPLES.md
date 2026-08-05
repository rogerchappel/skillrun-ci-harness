# Examples

## Markdown report

```bash
node bin/skillrun-ci-harness.js examples/skill-fixture.json --format markdown
```

## CI use

```bash
bash scripts/validate.sh
```

Attach the Markdown output to a skill proposal so reviewers can see acceptance coverage and side-effect boundaries.

## Invalid field values

Fixture fields documented in the README must contain JSON strings. For
example, `{"commands":[{"command":{}}]}` produces an error at
`commands[0].command`, exits with status 2, and does not copy the object into
the dry-run plan.
