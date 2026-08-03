#!/usr/bin/env node
import { loadFixture, validateFixture } from '../src/index.js';
import { toJsonReport, toMarkdownReport } from '../src/report.js';

const args = process.argv.slice(2);
const usage = 'Usage: skillrun-ci-harness <fixture.json> [--format json|markdown]';
if (args.length === 1 && args[0] === '--help') {
  console.log(usage);
  process.exit(0);
}

let fixturePath;
let format = 'json';
let formatSeen = false;
for (let index = 0; index < args.length; index += 1) {
  const argument = args[index];
  if (argument === '--format') {
    if (formatSeen) usageError('Duplicate option: --format');
    formatSeen = true;
    const value = args[index + 1];
    if (value === undefined || value.startsWith('--')) usageError('Missing value for --format');
    format = value;
    index += 1;
  } else if (argument.startsWith('-')) {
    usageError(`Unknown option: ${argument}`);
  } else if (fixturePath === undefined) {
    fixturePath = argument;
  } else {
    usageError(`Unexpected argument: ${argument}`);
  }
}
if (!fixturePath) usageError('Fixture path is required.');
if (!['json', 'markdown'].includes(format)) {
  usageError(`Unsupported format: ${format}`);
}

let fixture;
try {
  fixture = loadFixture(fixturePath);
} catch (error) {
  if (error instanceof SyntaxError) {
    console.error(`Invalid JSON in fixture: ${fixturePath}`);
    process.exit(65);
  }
  console.error(`Unable to read fixture: ${fixturePath}`);
  process.exit(66);
}
const result = validateFixture(fixture);
console.log(format === 'markdown' ? toMarkdownReport(result) : toJsonReport(result));
process.exit(result.ok ? 0 : 2);

function usageError(message) {
  console.error(`${message}\n${usage}`);
  process.exit(64);
}
