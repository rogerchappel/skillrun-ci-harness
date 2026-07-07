#!/usr/bin/env node
import { execFileSync } from 'node:child_process';

const output = execFileSync('npm', ['pack', '--dry-run', '--json'], { encoding: 'utf8' });
const [{ files = [] }] = JSON.parse(output);
const packed = new Set(files.map((file) => file.path));

const required = [
  'bin/skillrun-ci-harness.js',
  'src/index.js',
  'src/report.js',
  'examples/skill-fixture.json',
  'SKILL.md',
  'README.md',
  'LICENSE',
  'package.json'
];

const missing = required.filter((file) => !packed.has(file));
if (missing.length > 0) {
  console.error(`Missing files from npm package: ${missing.join(', ')}`);
  process.exit(1);
}

console.log(`Package smoke passed with ${files.length} files.`);
