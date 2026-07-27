#!/usr/bin/env node
import { loadFixture, validateFixture } from '../src/index.js';
import { toJsonReport, toMarkdownReport } from '../src/report.js';

const args = process.argv.slice(2);
const fixturePath = args[0];
const formatIndex = args.indexOf('--format');
const format = formatIndex >= 0 ? args[formatIndex + 1] : 'json';
const usage = 'Usage: skillrun-ci-harness <fixture.json> [--format json|markdown]';
if (!fixturePath || args.includes('--help')) {
  console.log(usage);
  process.exit(fixturePath ? 0 : 1);
}
if (formatIndex >= 0 && format === undefined) {
  console.error(`Missing value for --format\n${usage}`);
  process.exit(64);
}
if (!['json', 'markdown'].includes(format)) {
  console.error(`Unsupported format: ${format}\n${usage}`);
  process.exit(64);
}
const result = validateFixture(loadFixture(fixturePath));
console.log(format === 'markdown' ? toMarkdownReport(result) : toJsonReport(result));
process.exit(result.ok ? 0 : 2);
