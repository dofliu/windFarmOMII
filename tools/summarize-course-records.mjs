import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 教師端 Course Record 彙整／核對工具。
// 讀取學生匯出的 OWM_COURSE_RECORD JSON，重算 recordDigest 與分項總分、核對摘要欄位與內嵌 record 一致，
// 並以「學生 × 週次 × 嘗試」表格輸出四欄 Debrief 完成度、分數、提示與程序練習違序次數。
// 這裡的核對只把偽造門檻從「記事本」提高到「要會寫腳本」；評分仍以四欄 Debrief 為主、機器欄位為佐證。

export const COURSE_RECORD_FORMAT = 'OWM_COURSE_RECORD';
export const LEARNER_CODE_PATTERN = /^OWM-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
export const DEBRIEF_SCORE_WEIGHTS = { safety: 0.25, completion: 0.3, evidence: 0.15, time: 0.1, fatigue: 0.1, cost: 0.1 };
export const EXPLANATION_FIELDS = ['conclusion', 'evidence', 'uncertainty', 'residualRisk'];

// 與 src/domain/digest.ts 相同的 canonical 規則：鍵排序、略過 undefined、無空白。
export function canonicalJson(value) {
  if (value === null || typeof value !== 'object') {
    return value === undefined ? 'null' : JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item)).join(',')}]`;
  const entries = Object.entries(value)
    .filter(([, item]) => item !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`).join(',')}}`;
}

export function sha256Hex(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

export function recordDigest(record) {
  return sha256Hex(canonicalJson(record));
}

export function debriefTotalScore(components) {
  return Math.round(Object.entries(DEBRIEF_SCORE_WEIGHTS).reduce((sum, [key, weight]) => sum + components[key] * weight, 0));
}

export function debriefGrade(total) {
  return total >= 90 ? 'S' : total >= 80 ? 'A' : total >= 70 ? 'B' : total >= 60 ? 'C' : 'D';
}

function verifyScores(scores) {
  if (!scores || typeof scores !== 'object') return { ok: false, reason: 'scores missing' };
  for (const key of Object.keys(DEBRIEF_SCORE_WEIGHTS)) {
    const value = scores[key];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100) {
      return { ok: false, reason: `${key} out of range` };
    }
  }
  const total = debriefTotalScore(scores);
  const grade = debriefGrade(total);
  if (scores.total !== total || scores.grade !== grade) {
    return { ok: false, reason: `declared ${scores.total}/${scores.grade} but components give ${total}/${grade}`, total, grade };
  }
  return { ok: true, total, grade };
}

const sameJson = (left, right) => canonicalJson(left ?? null) === canonicalJson(right ?? null);

export function parseCourseExport(value, sourceFile = 'unknown.json', options = {}) {
  const errors = [];
  const warnings = [];
  if (!value || typeof value !== 'object') return { ok: false, sourceFile, errors: ['Root must be an object.'], warnings };
  if (value.format !== COURSE_RECORD_FORMAT) errors.push(`format must be ${COURSE_RECORD_FORMAT}.`);
  if (value.schemaVersion !== 1 && value.schemaVersion !== 2) errors.push('schemaVersion must be 1 or 2.');
  const record = value.record;
  if (!record || typeof record !== 'object') {
    errors.push('record must be an object.');
    return { ok: false, sourceFile, errors, warnings };
  }
  if (record.mode !== 'assessment') errors.push('record.mode must be assessment.');
  if (value.schemaVersion === 2 && record.schemaVersion !== 2) errors.push('v2 export must embed a v2 record.');
  if (!Array.isArray(record.attempts)) errors.push('record.attempts must be an array.');
  if (!Array.isArray(record.events)) errors.push('record.events must be an array.');
  const learnerCode = typeof record.learnerCode === 'string' ? record.learnerCode.trim().toUpperCase() : '';
  if (!learnerCode) errors.push('record.learnerCode is required.');
  else if (!LEARNER_CODE_PATTERN.test(learnerCode)) warnings.push(`learner code ${learnerCode} is not in OWM-XXXX-XXXX form (possible name or student ID).`);
  if (value.learnerCode !== record.learnerCode) errors.push('summary learnerCode differs from record.learnerCode.');
  if (value.courseCode !== record.courseCode) errors.push('summary courseCode differs from record.courseCode.');
  if (value.configVersion !== record.configVersion) errors.push('summary configVersion differs from record.configVersion.');
  if (value.schemaVersion === 2) {
    if (record.integrityOrigin !== 'native_v2') errors.push('v2 export record.integrityOrigin must be native_v2.');
    if (value.integrityPolicy?.decisionOrder !== 'LEARNER_ASSESSMENT_RUNTIME_ONLY') errors.push('v2 integrityPolicy.decisionOrder is invalid.');
    if (value.integrityPolicy?.authenticity !== 'CLIENT_LOCAL_UNVERIFIED_NOT_TAMPER_EVIDENT') errors.push('v2 authenticity boundary is missing.');
  }
  if (errors.length) return { ok: false, sourceFile, errors, warnings };

  // 摘要欄位必須能由 record 重算；偽造者不一定會改到一致。
  if (value.attemptCount !== record.attempts.length) errors.push(`attemptCount ${value.attemptCount} differs from record.attempts.length ${record.attempts.length}.`);
  const hintTotal = record.attempts.reduce((sum, attempt) => sum + (Number.isInteger(attempt.hintUsedCount) ? attempt.hintUsedCount : 0), 0);
  if (value.hintUsage?.total !== hintTotal) errors.push(`hintUsage.total ${value.hintUsage?.total} differs from record ${hintTotal}.`);
  if (Array.isArray(value.componentScores)) {
    value.componentScores.forEach((entry, index) => {
      if (!sameJson(entry?.scores, record.attempts[index]?.scores ?? null)) errors.push(`componentScores[${index}] differs from record.attempts[${index}].scores.`);
    });
  }
  if (Array.isArray(value.studentExplanations)) {
    value.studentExplanations.forEach((entry, index) => {
      const explanation = record.attempts[index]?.studentExplanation ?? {};
      for (const field of EXPLANATION_FIELDS) {
        if ((entry?.[field] ?? '') !== (explanation[field] ?? '')) errors.push(`studentExplanations[${index}].${field} differs from record.`);
      }
    });
  }
  if (Array.isArray(value.decisionOrder)) {
    value.decisionOrder.forEach((entry, index) => {
      if (!sameJson(entry?.decisions, record.attempts[index]?.decisionOrder ?? [])) errors.push(`decisionOrder[${index}] differs from record.`);
    });
  }

  let digestStatus = 'MISSING';
  if (typeof value.recordDigest === 'string') {
    digestStatus = value.recordDigest === recordDigest(record) ? 'VERIFIED' : 'MISMATCH';
    if (digestStatus === 'MISMATCH') errors.push('recordDigest does not match the embedded record (edited after export).');
  } else {
    warnings.push('recordDigest missing (export predates digest support); integrity cannot be verified.');
  }

  let previousSequence = 0;
  record.events.forEach((event, index) => {
    if (!event || typeof event !== 'object' || event.sequence !== index + 1) errors.push(`events[${index}].sequence must be ${index + 1}.`);
    else previousSequence = event.sequence;
  });
  if (previousSequence !== record.events.length) errors.push('events sequence does not end at events.length.');

  if (value.schemaVersion === 2) {
    const decisionKinds = new Set(['DIAGNOSIS_SELECTED', 'EVIDENCE_VIEWED', 'HINT_USED', 'JSA_COMPLETED', 'LOTO_VERIFIED', 'WORK_ORDER_CREATED']);
    record.attempts.forEach((attempt, index) => {
      const formalEvents = record.events.filter((event) => (
        decisionKinds.has(event.kind)
        && event.context === 'assessment_runtime'
        && event.actor === 'learner'
        && event.assignmentId === attempt.assignmentId
        && event.missionId === attempt.missionId
        && event.attemptNumber === attempt.attemptNumber
      ));
      const decisionOrder = formalEvents.map((event) => event.kind);
      const hintUsedCount = formalEvents.filter((event) => event.kind === 'HINT_USED').length;
      if (!sameJson(attempt.decisionOrder, decisionOrder)) errors.push(`attempts[${index}].decisionOrder does not match learner assessment events.`);
      if (attempt.hintUsedCount !== hintUsedCount) errors.push(`attempts[${index}].hintUsedCount does not match learner assessment events.`);
    });
  }

  const weekByAssignment = new Map((options.assignments ?? []).map((assignment) => [assignment.id, assignment.weekId]));
  const unlockedAtExport = Array.isArray(value.unlockedWeekIdsAtExport) ? value.unlockedWeekIdsAtExport : null;
  const unlockedNow = Array.isArray(options.unlockedWeekIds) ? options.unlockedWeekIds : null;
  const attempts = record.attempts.map((attempt, index) => {
    const weekId = typeof attempt.weekId === 'string' ? attempt.weekId : (weekByAssignment.get(attempt.assignmentId) ?? null);
    const flags = [];
    const scoreCheck = attempt.scores ? verifyScores(attempt.scores) : null;
    if (scoreCheck && !scoreCheck.ok) {
      errors.push(`attempts[${index}] scores invalid: ${scoreCheck.reason}.`);
      flags.push('SCORE_MISMATCH');
    }
    const completed = typeof attempt.completedAt === 'string';
    const explanation = attempt.studentExplanation ?? {};
    const filledFields = EXPLANATION_FIELDS.filter((field) => typeof explanation[field] === 'string' && explanation[field].trim().length > 0);
    if (completed && filledFields.length < EXPLANATION_FIELDS.length) flags.push('DEBRIEF_INCOMPLETE');
    if (!completed) flags.push('NOT_SETTLED');
    if ((attempt.hintUsedCount ?? 0) > 0) {
      flags.push('HINT_USED');
      warnings.push(`attempts[${index}] recorded ${attempt.hintUsedCount} HINT_USED despite REC_AND_GUIDE_DISABLED.`);
    }
    if (weekId && unlockedAtExport && !unlockedAtExport.includes(weekId)) flags.push('AHEAD_OF_RELEASE_AT_EXPORT');
    if (weekId && unlockedNow && !unlockedNow.includes(weekId)) flags.push('WEEK_NOT_IN_CURRENT_CONFIG');
    if (!weekId) flags.push('WEEK_UNKNOWN');
    const labEvents = record.events.filter((event) => event.assignmentId === attempt.assignmentId && event.details?.source === 'COURSE_ENGINEERING_LAB');
    const lotoEvents = labEvents.filter((event) => event.kind === 'LOTO_VERIFIED');
    const workOrderEvents = labEvents.filter((event) => event.kind === 'WORK_ORDER_CREATED');
    const sumRejected = (events) => events.reduce((sum, event) => sum + (Number.isInteger(event.details?.rejectedActions) ? event.details.rejectedActions : 0), 0);
    return {
      index,
      assignmentId: attempt.assignmentId,
      weekId,
      missionId: attempt.missionId,
      attemptNumber: attempt.attemptNumber,
      configVersion: attempt.configVersion ?? null,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt ?? null,
      completed,
      scores: attempt.scores ?? null,
      recomputed: scoreCheck ? { total: scoreCheck.total ?? null, grade: scoreCheck.grade ?? null } : null,
      hintUsedCount: attempt.hintUsedCount ?? 0,
      decisionCount: Array.isArray(attempt.decisionOrder) ? attempt.decisionOrder.length : 0,
      debriefFields: filledFields.length,
      studentExplanation: Object.fromEntries(EXPLANATION_FIELDS.map((field) => [field, typeof explanation[field] === 'string' ? explanation[field] : ''])),
      lab: {
        lotoVerified: lotoEvents.length,
        lotoRejectedActions: sumRejected(lotoEvents),
        workOrdersClosed: workOrderEvents.filter((event) => event.details?.closed === true || Array.isArray(event.details?.lifecycle) && event.details.lifecycle.length === 6).length,
        workOrderRejectedActions: sumRejected(workOrderEvents),
      },
      flags,
    };
  });

  return {
    ok: errors.length === 0,
    sourceFile,
    errors,
    warnings,
    export: {
      exportedAt: value.exportedAt ?? null,
      version: value.version ?? record.releaseVersion ?? null,
      courseCode: record.courseCode,
      learnerCode,
      configVersion: record.configVersion ?? null,
      platform: record.platform ?? null,
      digestStatus,
      unlockedWeekIdsAtExport: unlockedAtExport,
      attempts,
      eventCount: record.events.length,
    },
  };
}

export function buildCourseSummary(parsed, options = {}) {
  const valid = parsed.filter((item) => item.ok);
  const invalid = parsed.filter((item) => !item.ok);
  const byLearner = new Map();
  for (const item of valid) {
    const list = byLearner.get(item.export.learnerCode) ?? [];
    list.push(item);
    byLearner.set(item.export.learnerCode, list);
  }
  const learners = [...byLearner.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([learnerCode, files]) => {
    // 同一代碼多份匯出：取 exportedAt 最新的一份為準，其餘列為 superseded。
    const ordered = [...files].sort((a, b) => String(b.export.exportedAt ?? '').localeCompare(String(a.export.exportedAt ?? '')));
    const [latest, ...superseded] = ordered;
    return {
      learnerCode,
      sourceFile: latest.sourceFile,
      supersededFiles: superseded.map((item) => item.sourceFile),
      platform: latest.export.platform,
      configVersion: latest.export.configVersion,
      digestStatus: latest.export.digestStatus,
      warnings: latest.warnings,
      attempts: latest.export.attempts,
      weeks: [...new Set(latest.export.attempts.map((attempt) => attempt.weekId).filter(Boolean))].sort(),
    };
  });
  const rows = learners.flatMap((learner) => learner.attempts.map((attempt) => ({ learnerCode: learner.learnerCode, digestStatus: learner.digestStatus, ...attempt })));
  const weekIds = [...new Set(rows.map((row) => row.weekId).filter(Boolean))].sort();
  const byWeek = weekIds.map((weekId) => {
    const weekRows = rows.filter((row) => row.weekId === weekId);
    const settled = weekRows.filter((row) => row.completed);
    const graded = settled.filter((row) => row.scores && !row.flags.includes('SCORE_MISMATCH'));
    return {
      weekId,
      learners: new Set(weekRows.map((row) => row.learnerCode)).size,
      attempts: weekRows.length,
      settled: settled.length,
      debriefComplete: settled.filter((row) => row.debriefFields === EXPLANATION_FIELDS.length).length,
      averageTotal: graded.length ? Math.round(graded.reduce((sum, row) => sum + row.scores.total, 0) / graded.length) : null,
    };
  });
  const integrity = {
    files: parsed.length,
    valid: valid.length,
    invalid: invalid.length,
    digestVerified: valid.filter((item) => item.export.digestStatus === 'VERIFIED').length,
    digestMissing: valid.filter((item) => item.export.digestStatus === 'MISSING').length,
    digestMismatch: invalid.filter((item) => item.errors.some((error) => error.startsWith('recordDigest'))).length,
    scoreMismatch: rows.filter((row) => row.flags.includes('SCORE_MISMATCH')).length,
    aheadOfRelease: rows.filter((row) => row.flags.includes('AHEAD_OF_RELEASE_AT_EXPORT') || row.flags.includes('WEEK_NOT_IN_CURRENT_CONFIG')).length,
    nonStandardCodes: learners.filter((learner) => !LEARNER_CODE_PATTERN.test(learner.learnerCode)).length,
  };
  return {
    generatedAt: options.now ? options.now.toISOString() : new Date().toISOString(),
    courseCode: options.courseCode ?? valid[0]?.export.courseCode ?? null,
    configVersion: options.configVersion ?? null,
    unlockedWeekIds: options.unlockedWeekIds ?? null,
    integrity,
    allVerified: invalid.length === 0 && integrity.digestMissing === 0 && integrity.scoreMismatch === 0,
    learners,
    byWeek,
    rows,
    invalidFiles: invalid.map((item) => ({ sourceFile: item.sourceFile, errors: item.errors })),
  };
}

const cell = (value) => String(value ?? '—').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');

export function renderCourseSummary(summary) {
  const lines = [
    '# OWM Course Record Summary',
    '',
    `Generated: ${summary.generatedAt}`,
    `Course: ${summary.courseCode ?? '—'}${summary.configVersion ? ` · config ${summary.configVersion}` : ''}${summary.unlockedWeekIds ? ` · unlocked ${summary.unlockedWeekIds.join(', ') || 'NONE'}` : ''}`,
    `Status: **${summary.allVerified ? 'ALL VERIFIED' : 'REVIEW FLAGS'}**`,
    '',
    '## Integrity',
    '',
    '| Files | Valid | Invalid | Digest verified | Digest missing | Digest mismatch | Score mismatch | Ahead of release | Non-standard codes |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    `| ${summary.integrity.files} | ${summary.integrity.valid} | ${summary.integrity.invalid} | ${summary.integrity.digestVerified} | ${summary.integrity.digestMissing} | ${summary.integrity.digestMismatch} | ${summary.integrity.scoreMismatch} | ${summary.integrity.aheadOfRelease} | ${summary.integrity.nonStandardCodes} |`,
    '',
    '## By week',
    '',
    '| Week | Learners | Attempts | Settled | Debrief 4/4 | Avg total |',
    '| --- | --- | --- | --- | --- | --- |',
    ...summary.byWeek.map((week) => `| ${week.weekId} | ${week.learners} | ${week.attempts} | ${week.settled} | ${week.debriefComplete} | ${cell(week.averageTotal)} |`),
    '',
    '## Attempts',
    '',
    '| Learner | Week | Mission | # | Config | Settled | Score | Debrief | Hints | Decisions | LOTO (rejected) | WO closed (rejected) | Digest | Flags |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...summary.rows.map((row) => [
      row.learnerCode,
      row.weekId ?? '—',
      row.missionId,
      row.attemptNumber,
      row.configVersion ?? '—',
      row.completed ? row.completedAt.slice(0, 16).replace('T', ' ') : 'NO',
      row.scores ? `${row.scores.grade} · ${row.scores.total}` : '—',
      `${row.debriefFields}/${EXPLANATION_FIELDS.length}`,
      row.hintUsedCount,
      row.decisionCount,
      `${row.lab.lotoVerified} (${row.lab.lotoRejectedActions})`,
      `${row.lab.workOrdersClosed} (${row.lab.workOrderRejectedActions})`,
      row.digestStatus,
      row.flags.join(' ') || '—',
    ].map(cell).join(' | ')).map((line) => `| ${line} |`),
    '',
  ];
  if (summary.invalidFiles.length) {
    lines.push('## Invalid files', '');
    for (const item of summary.invalidFiles) {
      lines.push(`- \`${item.sourceFile}\``);
      for (const error of item.errors) lines.push(`  - ${error}`);
    }
    lines.push('');
  }
  const warned = summary.learners.filter((learner) => learner.warnings.length || learner.supersededFiles.length);
  if (warned.length) {
    lines.push('## Warnings', '');
    for (const learner of warned) {
      for (const warning of learner.warnings) lines.push(`- ${learner.learnerCode}: ${warning}`);
      for (const file of learner.supersededFiles) lines.push(`- ${learner.learnerCode}: older export \`${file}\` superseded by \`${learner.sourceFile}\`.`);
    }
    lines.push('');
  }
  lines.push(
    '## Field trust',
    '',
    '- Primary grading evidence: the four student explanation fields (conclusion / evidence / uncertainty / residual risk).',
    '- Verified by this tool: recordDigest (SHA-256 over the canonical record), component-score totals and grades, summary/record consistency, event sequence.',
    '- Supporting only: attemptCount (reset or a new browser restarts it), decisionCount (includes automatic JSA/LOTO/WO stamps), Lab LOTO/WO events (practice, not the assessment mission).',
    '- Not tamper-proof: a static site cannot prevent a scripted forgery; combine with in-class observation or an oral check for high-stakes grading.',
    '',
  );
  return lines.join('\n');
}

async function readJsonFiles(directory) {
  const names = (await readdir(directory)).filter((name) => name.toLowerCase().endsWith('.json') && !name.startsWith('COURSE_SUMMARY'));
  const results = [];
  for (const name of names.sort()) {
    const file = path.join(directory, name);
    try {
      results.push(parseTarget(JSON.parse(await readFile(file, 'utf8')), name));
    } catch (error) {
      results.push({ ok: false, sourceFile: name, errors: [`Unreadable JSON: ${error instanceof Error ? error.message : String(error)}`], warnings: [] });
    }
  }
  return results;
}

let parseTarget = parseCourseExport;

async function main() {
  const args = process.argv.slice(2);
  const configFlag = args.indexOf('--config');
  const configPath = configFlag >= 0 ? args.splice(configFlag, 2)[1] : path.join('public', 'course', 'course-config.json');
  const inputDirectory = path.resolve(args[0] ?? 'course-results');
  const outputMarkdown = path.resolve(args[1] ?? path.join(inputDirectory, 'COURSE_SUMMARY.md'));
  const outputJson = outputMarkdown.replace(/\.md$/i, '.json');
  let config = null;
  try {
    config = JSON.parse(await readFile(path.resolve(configPath), 'utf8'));
  } catch {
    config = null;
  }
  const options = config
    ? { assignments: config.assignments, unlockedWeekIds: config.unlockedWeekIds, courseCode: config.courseCode, configVersion: config.configVersion }
    : {};
  parseTarget = (value, name) => parseCourseExport(value, name, options);
  const parsed = await readJsonFiles(inputDirectory);
  const summary = buildCourseSummary(parsed, options);
  await writeFile(outputMarkdown, renderCourseSummary(summary), 'utf8');
  await writeFile(outputJson, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  console.log(`Course summary: ${outputMarkdown}`);
  console.log(`Course summary JSON: ${outputJson}`);
  console.log(`Files: ${summary.integrity.files} (valid ${summary.integrity.valid}, invalid ${summary.integrity.invalid}); digest verified ${summary.integrity.digestVerified}, missing ${summary.integrity.digestMissing}, mismatch ${summary.integrity.digestMismatch}; score mismatch ${summary.integrity.scoreMismatch}.`);
  console.log(`Status: ${summary.allVerified ? 'ALL VERIFIED' : 'REVIEW FLAGS'}`);
  if (parsed.some((item) => item.errors.some((error) => error.startsWith('Unreadable JSON')))) process.exitCode = 1;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  await main();
}
