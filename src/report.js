export function toJsonReport(result) {
  return JSON.stringify(result, null, 2);
}

function renderControls(value) {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('\r', '\\r')
    .replaceAll('\n', '\\n')
    .replaceAll('\t', '\\t');
}

function markdownText(value) {
  return renderControls(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replace(/([`*_{}\[\]()#+.!|~-])/g, '\\$1');
}

function markdownCode(value) {
  const rendered = renderControls(value);
  const longestRun = Math.max(0, ...[...rendered.matchAll(/`+/g)].map((match) => match[0].length));
  const fence = '`'.repeat(longestRun + 1);
  const padding = /^[ `]|[ `]$/.test(rendered) ? ' ' : '';
  return `${fence}${padding}${rendered}${padding}${fence}`;
}

export function toMarkdownReport(result) {
  const lines = ['# Skill Fixture Harness Report', '', result.ok ? 'Status: PASS' : 'Status: FAIL', '', `Errors: ${result.counts.error ?? 0}`, `Warnings: ${result.counts.warning ?? 0}`, ''];
  lines.push('## Findings');
  if (result.findings.length === 0) lines.push('- No findings.');
  for (const finding of result.findings) lines.push(`- ${finding.severity.toUpperCase()} ${finding.path}: ${finding.message}`);
  lines.push('', '## Dry-run Command Plan');
  if (result.plan.length === 0) lines.push('- No commands declared.');
  for (const item of result.plan) {
    lines.push(`- ${markdownText(item.name)}: ${markdownCode(item.command)} (${item.sideEffect}, execute=${item.execute})`);
  }
  return lines.join('\n');
}
