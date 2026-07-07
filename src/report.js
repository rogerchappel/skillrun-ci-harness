export function toJsonReport(result) {
  return JSON.stringify(result, null, 2);
}

export function toMarkdownReport(result) {
  const lines = ['# Skill Fixture Harness Report', '', result.ok ? 'Status: PASS' : 'Status: FAIL', '', `Errors: ${result.counts.error ?? 0}`, `Warnings: ${result.counts.warning ?? 0}`, ''];
  lines.push('## Findings');
  if (result.findings.length === 0) lines.push('- No findings.');
  for (const finding of result.findings) lines.push(`- ${finding.severity.toUpperCase()} ${finding.path}: ${finding.message}`);
  lines.push('', '## Dry-run Command Plan');
  if (result.plan.length === 0) lines.push('- No commands declared.');
  for (const item of result.plan) lines.push(`- ${item.name}: \`${item.command}\` (${item.sideEffect}, execute=${item.execute})`);
  return lines.join('\n');
}
