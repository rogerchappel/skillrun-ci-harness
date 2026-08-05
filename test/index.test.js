import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeFixture, validateFixture } from '../src/index.js';
import { toMarkdownReport } from '../src/report.js';

test('valid fixture passes and creates dry-run plan', () => {
  const fixture = normalizeFixture({ skill: { name: 'x', when: 'on request' }, files: [{ path: 'SKILL.md', purpose: 'instructions' }], commands: [{ name: 'test', command: 'npm test', sideEffect: 'read-only' }], cases: [{ name: 'case', expectedEvidence: 'report' }] });
  const result = validateFixture(fixture);
  assert.equal(result.ok, true);
  assert.equal(result.plan[0].execute, false);
});

test('missing required fields fail with useful paths', () => {
  const result = validateFixture(normalizeFixture({}));
  assert.equal(result.ok, false);
  assert.ok(result.findings.some((item) => item.path === 'skill.name'));
});

test('non-object fixture roots become structured findings', () => {
  for (const fixture of [null, [], 'fixture']) {
    const result = validateFixture(normalizeFixture(fixture));

    assert.equal(result.ok, false);
    assert.ok(result.findings.some((item) => item.path === 'fixture'));
  }
});

test('malformed sections and array entries become structured findings', () => {
  const fixture = normalizeFixture({
    skill: null,
    files: [null, 'file'],
    commands: [42],
    cases: [null],
  });
  const result = validateFixture(fixture);

  assert.equal(result.ok, false);
  for (const path of ['skill', 'files[0]', 'files[1]', 'commands[0]', 'cases[0]']) {
    assert.ok(result.findings.some((item) => item.path === path), `missing finding for ${path}`);
  }
});

test('non-array collection sections become structured findings', () => {
  const result = validateFixture(normalizeFixture({ files: null, commands: {}, cases: 'case' }));

  for (const path of ['files', 'commands', 'cases']) {
    assert.ok(result.findings.some((item) => item.path === path), `missing finding for ${path}`);
  }
});

test('fixture text fields reject non-string values at their exact paths', () => {
  const valid = {
    skill: { name: 'x', when: 'on request' },
    files: [{ path: 'SKILL.md', purpose: 'instructions' }],
    commands: [{ name: 'test', command: 'npm test', sideEffect: 'read-only' }],
    cases: [{ name: 'case', expectedEvidence: 'report' }],
  };
  const fields = [
    ['skill', 'name'], ['skill', 'when'],
    ['files', 'path'], ['files', 'purpose'],
    ['commands', 'name'], ['commands', 'command'], ['commands', 'sideEffect'],
    ['cases', 'name'], ['cases', 'expectedEvidence'],
  ];

  for (const value of [null, 42, true, [], {}]) {
    for (const [section, field] of fields) {
      const fixture = structuredClone(valid);
      const target = Array.isArray(fixture[section]) ? fixture[section][0] : fixture[section];
      target[field] = value;
      const result = validateFixture(normalizeFixture(fixture));
      const path = `${section}${Array.isArray(fixture[section]) ? '[0]' : ''}.${field}`;

      assert.equal(result.ok, false, `${path} accepted ${JSON.stringify(value)}`);
      assert.ok(result.findings.some((item) => item.path === path), `missing finding for ${path}`);
      for (const command of result.plan) {
        assert.notEqual(typeof command.name, 'object');
        assert.notEqual(typeof command.command, 'object');
        assert.notEqual(typeof command.sideEffect, 'object');
      }
    }
  }
});

test('required text fields reject empty strings while valid text remains accepted', () => {
  const fixture = normalizeFixture({
    skill: { name: '', when: '' },
    files: [{ path: '', purpose: '' }],
    commands: [{ name: '', command: '', sideEffect: '' }],
    cases: [{ name: '', expectedEvidence: '' }],
  });
  const result = validateFixture(fixture);

  assert.equal(result.ok, false);
  for (const path of ['skill.name', 'skill.when', 'files.path', 'commands', 'cases.name']) {
    assert.ok(result.findings.some((item) => item.path === path), `missing finding for ${path}`);
  }
});

test('markdown report includes side-effect boundary', () => {
  const result = validateFixture(normalizeFixture({ skill: { name: 'x', when: 'on request' }, files: [{ path: 'SKILL.md', purpose: 'instructions' }], commands: [{ name: 'smoke', command: 'npm run smoke', sideEffect: 'read-only' }], cases: [{ name: 'case', expectedEvidence: 'report' }] }));
  assert.match(toMarkdownReport(result), /execute=false/);
});
