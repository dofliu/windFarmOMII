import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DECISION_KINDS = new Set([
  'DIAGNOSIS_SELECTED',
  'EVIDENCE_VIEWED',
  'HINT_USED',
  'JSA_COMPLETED',
  'LOTO_VERIFIED',
  'WORK_ORDER_CREATED',
]);

const attemptKey = (assignmentId, attemptNumber) => `${assignmentId}::${attemptNumber}`;

const hasValidScores = (scores) => Boolean(
  scores
  && typeof scores === 'object'
  && ['completion', 'safety', 'evidence', 'time', 'fatigue', 'cost', 'total']
    .every((key) => Number.isFinite(scores[key]))
  && typeof scores.grade === 'string'
  && scores.grade.trim().length > 0,
);

export function summarizeCourseRecordExport(value) {
  if (!value || typeof value !== 'object') throw new Error('Course Record input must be a JSON object.');
  const record = value.record && typeof value.record === 'object' ? value.record : value;
  if (!Array.isArray(record.events) || !Array.isArray(record.attempts)) {
    throw new Error('Course Record must contain events and attempts arrays.');
  }

  const schemaVersion = Number(value.schemaVersion ?? record.schemaVersion ?? 1);
  const integrityOrigin = value.integrityPolicy?.origin ?? record.integrityOrigin ?? (schemaVersion < 2 ? 'migrated_v1' : 'unknown');
  const findings = [];
  const attemptKeys = new Set();
  const latestAttemptByAssignment = new Map();
  for (const attempt of record.attempts) {
    const key = attemptKey(attempt?.assignmentId, attempt?.attemptNumber);
    const expected = (latestAttemptByAssignment.get(attempt?.assignmentId) ?? 0) + 1;
    if (
      typeof attempt?.assignmentId !== 'string'
      || !attempt.assignmentId.trim()
      || typeof attempt?.missionId !== 'string'
      || !attempt.missionId.trim()
      || !Number.isInteger(attempt?.attemptNumber)
      || attempt.attemptNumber <= 0
      || attemptKeys.has(key)
      || attempt.attemptNumber !== expected
    ) {
      findings.push({
        severity: 'ERROR',
        code: 'ATTEMPT_ID_INVALID',
        assignmentId: attempt?.assignmentId ?? null,
        attemptNumber: attempt?.attemptNumber ?? null,
        message: 'Attempt identity must be unique, positive, and contiguous per assignment.',
      });
    } else {
      attemptKeys.add(key);
      latestAttemptByAssignment.set(attempt.assignmentId, attempt.attemptNumber);
    }
  }
  if (!record.attempts.length) {
    findings.push({
      severity: 'ERROR',
      code: 'NO_ATTEMPTS',
      message: 'Course Record contains no Assessment attempts.',
    });
  }
  const settlementCounts = new Map();
  const settlementByAttempt = new Map();
  for (const event of record.events) {
    if (event?.kind !== 'MISSION_SETTLED' || typeof event.assignmentId !== 'string') continue;
    if (schemaVersion >= 2 && (
      !Number.isInteger(event.attemptNumber)
      || event.attemptNumber <= 0
      || event.context !== 'assessment_runtime'
      || event.actor !== 'system'
    )) {
      findings.push({
        severity: 'ERROR',
        code: 'SETTLEMENT_PROVENANCE_INVALID',
        assignmentId: event.assignmentId,
        attemptNumber: event.attemptNumber ?? null,
        message: 'Native v2 settlement requires assessment_runtime/system provenance and a positive attemptNumber.',
      });
      continue;
    }
    const occurrence = (settlementCounts.get(event.assignmentId) ?? 0) + 1;
    settlementCounts.set(event.assignmentId, occurrence);
    const number = Number.isInteger(event.attemptNumber) && event.attemptNumber > 0
      ? event.attemptNumber
      : occurrence;
    const key = attemptKey(event.assignmentId, number);
    const linkedAttempt = record.attempts.find((attempt) => attemptKey(attempt.assignmentId, attempt.attemptNumber) === key);
    if (schemaVersion >= 2 && (!linkedAttempt || event.missionId !== linkedAttempt.missionId)) {
      findings.push({
        severity: 'ERROR',
        code: 'SETTLEMENT_PROVENANCE_INVALID',
        assignmentId: event.assignmentId,
        attemptNumber: number,
        message: 'Native v2 settlement missionId must match exactly one attempt.',
      });
      continue;
    }
    if (settlementByAttempt.has(key)) {
      findings.push({
        severity: 'ERROR',
        code: 'SETTLEMENT_DUPLICATE',
        assignmentId: event.assignmentId,
        attemptNumber: number,
        message: 'Each attempt must have exactly one MISSION_SETTLED event.',
      });
    } else {
      settlementByAttempt.set(key, event);
    }
  }

  const attempts = record.attempts.map((attempt) => {
    const settlement = settlementByAttempt.get(attemptKey(attempt.assignmentId, attempt.attemptNumber));
    const explanation = attempt.studentExplanation ?? {};
    const debriefComplete = ['conclusion', 'evidence', 'uncertainty', 'residualRisk']
      .every((key) => typeof explanation[key] === 'string' && explanation[key].trim().length > 0);
    const success = typeof settlement?.details?.success === 'boolean' ? settlement.details.success : null;
    const round = Number.isInteger(settlement?.details?.round) && settlement.details.round > 0 ? settlement.details.round : null;
    if (!settlement || success === null || round === null) {
      findings.push({
        severity: 'ERROR',
        code: 'OUTCOME_MISSING',
        assignmentId: attempt.assignmentId,
        attemptNumber: attempt.attemptNumber,
        message: 'MISSION_SETTLED success/round cannot be resolved.',
      });
    }
    if (!attempt.completedAt || !hasValidScores(attempt.scores) || !debriefComplete) {
      findings.push({
        severity: 'ERROR',
        code: 'EXPORT_GATE_INCOMPLETE',
        assignmentId: attempt.assignmentId,
        attemptNumber: attempt.attemptNumber,
        message: 'Attempt is not settled with scores and a complete four-field Debrief.',
      });
    }
    return {
      assignmentId: attempt.assignmentId,
      missionId: attempt.missionId,
      attemptNumber: attempt.attemptNumber,
      success,
      round,
      score: attempt.scores?.total ?? null,
      grade: attempt.scores?.grade ?? null,
      decisionCount: Array.isArray(attempt.decisionOrder) ? attempt.decisionOrder.length : 0,
      hintUsedCount: Number.isInteger(attempt.hintUsedCount) ? attempt.hintUsedCount : 0,
      debriefComplete,
    };
  });

  if (schemaVersion < 2 || integrityOrigin !== 'native_v2') {
    findings.push({
      severity: 'WARNING',
      code: 'LEGACY_PROVENANCE_UNVERIFIED',
      message: 'Record provenance is not native v2; treat decision evidence as historical only.',
    });
  } else {
    const formalEvents = record.events.filter((event) => (
      DECISION_KINDS.has(event?.kind)
      && event.context === 'assessment_runtime'
      && event.actor === 'learner'
    ));
    if (formalEvents.some((event) => record.attempts.filter((attempt) => (
      event.assignmentId === attempt.assignmentId
      && event.missionId === attempt.missionId
      && event.attemptNumber === attempt.attemptNumber
    )).length !== 1)) {
      findings.push({
        severity: 'ERROR',
        code: 'DECISION_PROVENANCE_VIOLATION',
        message: 'A learner assessment_runtime decision is not linked to exactly one matching attempt.',
      });
    }
    for (const attempt of record.attempts) {
      const attemptFormalEvents = formalEvents.filter((event) => (
        event.assignmentId === attempt.assignmentId
        && event.missionId === attempt.missionId
        && event.attemptNumber === attempt.attemptNumber
      ));
      const expectedDecisions = attemptFormalEvents.map((event) => event.kind);
      const actualDecisions = Array.isArray(attempt.decisionOrder) ? attempt.decisionOrder : [];
      const expectedHints = attemptFormalEvents.filter((event) => event.kind === 'HINT_USED').length;
      const diagnosisCount = attemptFormalEvents.filter((event) => event.kind === 'DIAGNOSIS_SELECTED').length;
      if (diagnosisCount > 1 || JSON.stringify(actualDecisions) !== JSON.stringify(expectedDecisions) || attempt.hintUsedCount !== expectedHints) {
        findings.push({
          severity: 'ERROR',
          code: 'DECISION_PROVENANCE_VIOLATION',
          assignmentId: attempt.assignmentId,
          attemptNumber: attempt.attemptNumber,
          message: 'decisionOrder or hintUsedCount does not exactly match learner assessment_runtime events.',
        });
      }
    }
  }

  return {
    format: 'OWM_COURSE_RECORD_SUMMARY',
    schemaVersion: 1,
    sourceSchemaVersion: schemaVersion,
    integrityOrigin,
    authenticity: 'CLIENT_LOCAL_UNVERIFIED_NOT_TAMPER_EVIDENT',
    courseCode: record.courseCode ?? value.courseCode ?? null,
    learnerCode: record.learnerCode ?? value.learnerCode ?? null,
    releaseVersion: record.releaseVersion ?? value.version ?? null,
    attemptCount: attempts.length,
    missionCount: new Set(attempts.map((attempt) => attempt.missionId)).size,
    integrityPassed: !findings.some((finding) => finding.severity === 'ERROR'),
    attempts,
    findings,
  };
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) throw new Error('Usage: node tools/summarize-course-record.mjs <OWM_COURSE_RECORD.json>');
  const resolved = path.resolve(inputPath);
  const summary = summarizeCourseRecordExport(JSON.parse(await readFile(resolved, 'utf8')));
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  if (!summary.integrityPassed) process.exitCode = 1;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
