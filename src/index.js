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
  for (const [index, file] of fixture.files.entries()) {
    if (!file.path) findings.push(finding('error', `files[${index}].path`, 'Each file declaration needs a path.'));
    if (!file.purpose) findings.push(finding('warning', `files[${index}].purpose`, 'File declarations should explain purpose.'));
  }
  if (fixture.commands.length === 0) findings.push(finding('warning', 'commands', 'Declare at least one verification command.'));
  for (const [index, command] of fixture.commands.entries()) {
    if (!command.name) findings.push(finding('error', `commands[${index}].name`, 'Each command needs a name.'));
    if (!command.command) findings.push(finding('error', `commands[${index}].command`, 'Each command needs command text.'));
    if (!['read-only', 'writes-local', 'external'].includes(command.sideEffect)) findings.push(finding('error', `commands[${index}].sideEffect`, 'Command sideEffect must be read-only, writes-local, or external.'));
  }
  if (fixture.cases.length === 0) findings.push(finding('error', 'cases', 'At least one acceptance case is required.'));
  for (const [index, testCase] of fixture.cases.entries()) {
    if (!testCase.name) findings.push(finding('error', `cases[${index}].name`, 'Each case needs a name.'));
    if (!testCase.expectedEvidence) findings.push(finding('warning', `cases[${index}].expectedEvidence`, 'Case should declare expectedEvidence.'));
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
    if (record[field] === undefined) continue;
    if (typeof record[field] === 'string') {
      normalized[field] = record[field].trim() || undefined;
      continue;
    }
    findings.push(finding('error', `${path}.${field}`, `${path}.${field} must be a string.`));
    normalized[field] = undefined;
  }
  return normalized;
}

function isRecord(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }

function finding(severity, path, message) { return { severity, path, message }; }
function countBySeverity(findings) { return findings.reduce((acc, item) => { acc[item.severity] = (acc[item.severity] ?? 0) + 1; return acc; }, { error: 0, warning: 0 }); }
function buildPlan(fixture) {
  return fixture.commands.map((command) => ({
    ...(command.name === undefined ? {} : { name: command.name }),
    ...(command.command === undefined ? {} : { command: command.command }),
    ...(command.sideEffect === undefined ? {} : { sideEffect: command.sideEffect }),
    execute: false,
  }));
}
