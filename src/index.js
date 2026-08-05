import fs from 'node:fs';

const normalizationFindings = Symbol('normalizationFindings');

export function loadFixture(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return normalizeFixture(JSON.parse(raw));
}

export function normalizeFixture(fixture) {
  const findings = [];
  const source = isRecord(fixture) ? fixture : {};
  if (!isRecord(fixture)) findings.push(finding('error', 'fixture', 'Fixture root must be an object.'));

  const normalized = {
    skill: normalizeTextFields(normalizeObject(source.skill, 'skill', findings), 'skill', ['name', 'when'], findings),
    files: normalizeObjectArray(source.files, 'files', findings)
      .map((file, index) => normalizeTextFields(file, `files[${index}]`, ['path', 'purpose'], findings)),
    commands: normalizeObjectArray(source.commands, 'commands', findings)
      .map((command, index) => normalizeTextFields(command, `commands[${index}]`, ['name', 'command', 'sideEffect'], findings)),
    cases: normalizeObjectArray(source.cases, 'cases', findings)
      .map((testCase, index) => normalizeTextFields(testCase, `cases[${index}]`, ['name', 'expectedEvidence'], findings)),
  };
  Object.defineProperty(normalized, normalizationFindings, { value: findings });
  return normalized;
}

export function validateFixture(fixture) {
  const findings = [...(fixture[normalizationFindings] ?? [])];
  if (!fixture.skill.name) findings.push(finding('error', 'skill.name', 'Skill name is required.'));
  if (!fixture.skill.when) findings.push(finding('error', 'skill.when', 'Skill trigger guidance is required.'));
  if (fixture.files.length === 0) findings.push(finding('error', 'files', 'At least one required file must be declared.'));
  for (const file of fixture.files) {
    if (!file.path) findings.push(finding('error', 'files.path', 'Each file declaration needs a path.'));
    if (!file.purpose) findings.push(finding('warning', file.path ?? 'files', 'File declarations should explain purpose.'));
  }
  if (fixture.commands.length === 0) findings.push(finding('warning', 'commands', 'Declare at least one verification command.'));
  for (const command of fixture.commands) {
    if (!command.name || !command.command) findings.push(finding('error', 'commands', 'Commands need name and command fields.'));
    if (!['read-only', 'writes-local', 'external'].includes(command.sideEffect)) findings.push(finding('error', command.name ?? 'commands', 'Command sideEffect must be read-only, writes-local, or external.'));
  }
  if (fixture.cases.length === 0) findings.push(finding('error', 'cases', 'At least one acceptance case is required.'));
  for (const testCase of fixture.cases) {
    if (!testCase.name) findings.push(finding('error', 'cases.name', 'Each case needs a name.'));
    if (!testCase.expectedEvidence) findings.push(finding('warning', testCase.name ?? 'cases', 'Case should declare expectedEvidence.'));
  }
  return { ok: findings.every((item) => item.severity !== 'error'), counts: countBySeverity(findings), findings, plan: buildPlan(fixture) };
}

function normalizeObject(value, path, findings) {
  if (value === undefined) return {};
  if (isRecord(value)) return value;
  findings.push(finding('error', path, `${path} must be an object.`));
  return {};
}

function normalizeObjectArray(value, path, findings) {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    findings.push(finding('error', path, `${path} must be an array.`));
    return [];
  }
  return value.map((item, index) => {
    if (isRecord(item)) return item;
    findings.push(finding('error', `${path}[${index}]`, `Each ${path} entry must be an object.`));
    return {};
  });
}

function normalizeTextFields(record, path, fields, findings) {
  const normalized = { ...record };
  for (const field of fields) {
    if (record[field] === undefined || typeof record[field] === 'string') continue;
    findings.push(finding('error', `${path}.${field}`, `${path}.${field} must be a string.`));
    normalized[field] = undefined;
  }
  return normalized;
}

function isRecord(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }

function finding(severity, path, message) { return { severity, path, message }; }
function countBySeverity(findings) { return findings.reduce((acc, item) => { acc[item.severity] = (acc[item.severity] ?? 0) + 1; return acc; }, { error: 0, warning: 0 }); }
function buildPlan(fixture) { return fixture.commands.map((command) => ({ name: command.name, command: command.command, sideEffect: command.sideEffect, execute: false })); }
