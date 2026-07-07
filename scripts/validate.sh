#!/usr/bin/env bash
set -euo pipefail
npm test
npm run check
npm run smoke >/tmp/skillrun-ci-harness-smoke.md
test -s /tmp/skillrun-ci-harness-smoke.md
npm run package:smoke
