import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cliPath = fileURLToPath(new URL('../bin/skillrun-ci-harness.js', import.meta.url));
const fixturePath = fileURLToPath(new URL('../examples/skill-fixture.json', import.meta.url));

function runCli(...args) {
  return spawnSync(process.execPath, [cliPath, fixturePath, ...args], {
    encoding: 'utf8',
  });
}

test('CLI emits JSON for the json format', () => {
  const result = runCli('--format', 'json');

  assert.equal(result.status, 0);
  assert.equal(JSON.parse(result.stdout).ok, true);
  assert.equal(result.stderr, '');
});

test('CLI emits Markdown for the markdown format', () => {
  const result = runCli('--format', 'markdown');

  assert.equal(result.status, 0);
  assert.match(result.stdout, /^# Skill Fixture Harness Report/m);
  assert.equal(result.stderr, '');
});

test('CLI rejects an unknown format', () => {
  const result = runCli('--format', 'yaml');

  assert.equal(result.status, 64);
  assert.match(result.stderr, /Unsupported format: yaml/);
  assert.match(result.stderr, /Usage:/);
  assert.equal(result.stdout, '');
});

test('CLI rejects a missing format value', () => {
  const result = runCli('--format');

  assert.equal(result.status, 64);
  assert.match(result.stderr, /Missing value for --format/);
  assert.match(result.stderr, /Usage:/);
  assert.equal(result.stdout, '');
});
