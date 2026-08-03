import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const cliPath = fileURLToPath(new URL('../bin/skillrun-ci-harness.js', import.meta.url));
const fixturePath = fileURLToPath(new URL('../examples/skill-fixture.json', import.meta.url));

function runCli(...args) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    encoding: 'utf8',
  });
}

test('CLI emits JSON for the json format', () => {
  const result = runCli(fixturePath, '--format', 'json');

  assert.equal(result.status, 0);
  assert.equal(JSON.parse(result.stdout).ok, true);
  assert.equal(result.stderr, '');
});

test('CLI emits Markdown for the markdown format', () => {
  const result = runCli(fixturePath, '--format', 'markdown');

  assert.equal(result.status, 0);
  assert.match(result.stdout, /^# Skill Fixture Harness Report/m);
  assert.equal(result.stderr, '');
});

test('CLI rejects an unknown format', () => {
  const result = runCli(fixturePath, '--format', 'yaml');

  assert.equal(result.status, 64);
  assert.match(result.stderr, /Unsupported format: yaml/);
  assert.match(result.stderr, /Usage:/);
  assert.equal(result.stdout, '');
});

test('CLI rejects a missing format value', () => {
  const result = runCli(fixturePath, '--format');

  assert.equal(result.status, 64);
  assert.match(result.stderr, /Missing value for --format/);
  assert.match(result.stderr, /Usage:/);
  assert.equal(result.stdout, '');
});

test('CLI rejects unknown options', () => {
  const result = runCli(fixturePath, '--bogus');

  assert.equal(result.status, 64);
  assert.match(result.stderr, /Unknown option: --bogus/);
  assert.match(result.stderr, /Usage:/);
  assert.equal(result.stdout, '');
});

test('CLI rejects extra and duplicate positional arguments', () => {
  for (const args of [[fixturePath, 'extra.json'], [fixturePath, fixturePath]]) {
    const result = runCli(...args);

    assert.equal(result.status, 64);
    assert.match(result.stderr, /Unexpected argument:/);
    assert.equal(result.stdout, '');
  }
});

test('CLI rejects duplicate format options', () => {
  const result = runCli(fixturePath, '--format', 'json', '--format', 'markdown');

  assert.equal(result.status, 64);
  assert.match(result.stderr, /Duplicate option: --format/);
  assert.equal(result.stdout, '');
});

test('CLI reports invalid JSON without a stack trace', () => {
  const directory = mkdtempSync(join(tmpdir(), 'skillrun-cli-'));
  const invalidFixture = join(directory, 'invalid.json');
  writeFileSync(invalidFixture, '{invalid');

  try {
    const result = runCli(invalidFixture);
    assert.equal(result.status, 65);
    assert.match(result.stderr, /Invalid JSON/);
    assert.doesNotMatch(result.stderr, /\n\s+at /);
    assert.equal(result.stdout, '');
  } finally {
    rmSync(directory, { recursive: true });
  }
});

test('CLI reports fixture read failures without a stack trace', () => {
  const missingFixture = join(tmpdir(), `missing-skillrun-${process.pid}.json`);
  const result = runCli(missingFixture);

  assert.equal(result.status, 66);
  assert.match(result.stderr, /Unable to read fixture:/);
  assert.doesNotMatch(result.stderr, /\n\s+at /);
  assert.equal(result.stdout, '');
});

test('CLI returns structured findings for null roots and entries', () => {
  const directory = mkdtempSync(join(tmpdir(), 'skillrun-cli-'));

  try {
    for (const [name, contents, path] of [
      ['null.json', 'null', 'fixture'],
      ['entries.json', '{"files":[null]}', 'files[0]'],
    ]) {
      const fixture = join(directory, name);
      writeFileSync(fixture, contents);
      const result = runCli(fixture);
      assert.equal(result.status, 2);
      assert.ok(JSON.parse(result.stdout).findings.some((item) => item.path === path));
      assert.equal(result.stderr, '');
    }
  } finally {
    rmSync(directory, { recursive: true });
  }
});
