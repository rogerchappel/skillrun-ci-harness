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

test('markdown report includes side-effect boundary', () => {
  const result = validateFixture(normalizeFixture({ skill: { name: 'x', when: 'on request' }, files: [{ path: 'SKILL.md', purpose: 'instructions' }], commands: [{ name: 'smoke', command: 'npm run smoke', sideEffect: 'read-only' }], cases: [{ name: 'case', expectedEvidence: 'report' }] }));
  assert.match(toMarkdownReport(result), /execute=false/);
});
