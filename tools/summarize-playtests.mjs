import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const NOTE_FIELDS = ['rotationDecision', 'rstDecision', 'mntDecision', 'facilitatorNotes'];
const DECISIONS = [
  { key: 'rotation', label: 'Crew rotation', eventKinds: ['CREW_ROTATED'], noteField: 'rotationDecision' },
  { key: 'rst', label: 'RST spending', eventKinds: ['RST_SPENT'], noteField: 'rstDecision' },
  { key: 'mnt', label: 'MNT spending', eventKinds: ['EQUIPMENT_REPAIRED', 'FLEET_MAINTAINED'], noteField: 'mntDecision' },
];

export function parsePlaytestExport(value, sourceFile = 'unknown.json') {
  const errors = [];
  if (!value || typeof value !== 'object') return { ok: false, sourceFile, errors: ['Root must be an object.'] };
  if (value.format !== 'OWM_PLAYTEST_SESSION') errors.push('format must be OWM_PLAYTEST_SESSION.');
  if (value.schemaVersion !== 1) errors.push('schemaVersion must be 1.');
  const session = value.session;
  if (!session || typeof session !== 'object') {
    errors.push('session must be an object.');
    return { ok: false, sourceFile, errors };
  }

  const participantCode = typeof session.participantCode === 'string'
    ? session.participantCode.trim().toUpperCase()
    : '';
  if (!/^[A-Z0-9_-]{1,24}$/.test(participantCode)) errors.push('participantCode must be an anonymous A-Z/0-9/_/- code.');
  if (session.platform !== 'desktop' && session.platform !== 'mobile') errors.push('platform must be desktop or mobile.');
  if (session.status !== 'active' && session.status !== 'completed') errors.push('status must be active or completed.');
  if (typeof session.startedAt !== 'string' || Number.isNaN(Date.parse(session.startedAt))) errors.push('startedAt must be an ISO timestamp.');
  if (session.status === 'completed' && (typeof session.completedAt !== 'string' || Number.isNaN(Date.parse(session.completedAt)))) {
    errors.push('completedAt must be an ISO timestamp for completed sessions.');
  }
  if (!Array.isArray(session.events)) errors.push('events must be an array.');
  if (!session.notes || typeof session.notes !== 'object') errors.push('notes must be an object.');
  if (Array.isArray(session.events)) {
    let previousTimestamp = Number.NEGATIVE_INFINITY;
    session.events.forEach((event, index) => {
      if (!event || typeof event !== 'object') {
        errors.push(`events[${index}] must be an object.`);
        return;
      }
      if (event.sequence !== index + 1) errors.push(`events[${index}].sequence must be ${index + 1}.`);
      if (typeof event.kind !== 'string' || !event.kind) errors.push(`events[${index}].kind must be a non-empty string.`);
      const timestamp = typeof event.recordedAt === 'string' ? Date.parse(event.recordedAt) : Number.NaN;
      if (!Number.isFinite(timestamp)) errors.push(`events[${index}].recordedAt must be an ISO timestamp.`);
      if (Number.isFinite(timestamp) && timestamp < previousTimestamp) errors.push(`events[${index}].recordedAt must be monotonic.`);
      if (Number.isFinite(timestamp)) previousTimestamp = timestamp;
      if (!event.details || typeof event.details !== 'object' || Array.isArray(event.details)) {
        errors.push(`events[${index}].details must be an object.`);
      }
    });
    if (session.events[0]?.kind !== 'SESSION_STARTED') errors.push('first event must be SESSION_STARTED.');
    if (session.status === 'completed' && session.events.at(-1)?.kind !== 'SESSION_COMPLETED') {
      errors.push('completed session must end with SESSION_COMPLETED.');
    }
  }
  if (errors.length) return { ok: false, sourceFile, errors };

  const events = session.events.flatMap((event, index) => {
    if (!event || typeof event !== 'object' || typeof event.kind !== 'string') return [];
    return [{
      sequence: Number.isInteger(event.sequence) ? event.sequence : index + 1,
      kind: event.kind,
      recordedAt: typeof event.recordedAt === 'string' ? event.recordedAt : '',
      details: event.details && typeof event.details === 'object' ? event.details : {},
    }];
  });
  const notes = Object.fromEntries(NOTE_FIELDS.map((field) => [
    field,
    typeof session.notes[field] === 'string' ? session.notes[field].trim() : '',
  ]));

  return {
    ok: true,
    sourceFile,
    record: {
      sourceFile,
      build: typeof session.build === 'string' ? session.build : 'UNKNOWN',
      participantCode,
      platform: session.platform,
      status: session.status,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      events,
      notes,
    },
  };
}

export function buildPlaytestSummary(records) {
  const participantCodes = records.map((record) => record.participantCode);
  const duplicateCodes = [...new Set(participantCodes.filter((code, index) => participantCodes.indexOf(code) !== index))];
  const platforms = {
    desktop: records.filter((record) => record.platform === 'desktop').length,
    mobile: records.filter((record) => record.platform === 'mobile').length,
  };
  const participantRows = records.map((record) => {
    const started = Date.parse(record.startedAt);
    const completed = record.completedAt ? Date.parse(record.completedAt) : Number.NaN;
    const durationMinutes = Number.isFinite(started) && Number.isFinite(completed)
      ? Math.max(0, Math.round((completed - started) / 60000))
      : null;
    const missingNotes = NOTE_FIELDS.filter((field) => !record.notes[field]);
    return {
      participantCode: record.participantCode,
      platform: record.platform,
      status: record.status,
      durationMinutes,
      eventCount: record.events.length,
      missingNotes,
      sourceFile: record.sourceFile,
    };
  });
  const decisions = Object.fromEntries(DECISIONS.map((decision) => {
    const actionParticipants = records
      .filter((record) => record.events.some((event) => decision.eventKinds.includes(event.kind)))
      .map((record) => record.participantCode);
    const noteParticipants = records
      .filter((record) => Boolean(record.notes[decision.noteField]))
      .map((record) => record.participantCode);
    const evidenceParticipants = actionParticipants.filter((code) => noteParticipants.includes(code));
    return [decision.key, {
      label: decision.label,
      actionParticipants,
      noteParticipants,
      evidenceParticipants,
      actionEventCount: records.reduce(
        (count, record) => count + record.events.filter((event) => decision.eventKinds.includes(event.kind)).length,
        0,
      ),
    }];
  }));
  const gates = {
    participantCount: records.length >= 3 && records.length <= 5,
    desktopAndMobile: platforms.desktop > 0 && platforms.mobile > 0,
    completedSessions: records.length > 0 && records.every((record) => record.status === 'completed'),
    completeNotes: participantRows.every((row) => row.missingNotes.length === 0),
    uniqueParticipantCodes: duplicateCodes.length === 0,
  };

  return {
    format: 'OWM_PLAYTEST_SUMMARY',
    schemaVersion: 1,
    analysisReady: Object.values(gates).every(Boolean),
    participantCount: records.length,
    platforms,
    duplicateCodes,
    gates,
    participantRows,
    decisions,
    notesByParticipant: Object.fromEntries(records.map((record) => [record.participantCode, record.notes])),
  };
}

export function renderPlaytestSummary(summary) {
  const gateRows = [
    ['3–5 completed participant files', summary.gates.participantCount],
    ['Desktop and Mobile coverage', summary.gates.desktopAndMobile],
    ['All sessions marked completed', summary.gates.completedSessions],
    ['All four observation notes present', summary.gates.completeNotes],
    ['Participant codes are unique', summary.gates.uniqueParticipantCodes],
  ];
  const decisionRows = Object.values(summary.decisions).map((decision) => [
    decision.label,
    decision.actionEventCount,
    listOrNa(decision.actionParticipants),
    listOrNa(decision.noteParticipants),
    listOrNa(decision.evidenceParticipants),
  ]);
  const participantRows = summary.participantRows.map((row) => [
    row.participantCode,
    row.platform,
    row.status,
    row.durationMinutes ?? 'NA',
    row.eventCount,
    row.missingNotes.length ? row.missingNotes.join(', ') : 'None',
  ]);
  const noteSections = Object.entries(summary.notesByParticipant).map(([code, notes]) => [
    `### ${code}`,
    '',
    `- Rotation: ${noteOrNa(notes.rotationDecision)}`,
    `- RST: ${noteOrNa(notes.rstDecision)}`,
    `- MNT: ${noteOrNa(notes.mntDecision)}`,
    `- Facilitator: ${noteOrNa(notes.facilitatorNotes)}`,
  ].join('\n')).join('\n\n');

  return [
    '# OWM Playtest Evidence Summary',
    '',
    `Status: **${summary.analysisReady ? 'ANALYSIS READY' : 'INCOMPLETE'}**`,
    '',
    `Participants: ${summary.participantCount} | Desktop: ${summary.platforms.desktop} | Mobile: ${summary.platforms.mobile}`,
    '',
    '> This report summarizes observed actions and recorded notes. It does not automatically conclude that a player understood a decision.',
    '',
    '## Evidence gates',
    '',
    markdownTable(['Gate', 'Status'], gateRows.map(([label, passed]) => [label, passed ? 'PASS' : 'NOT MET'])),
    '',
    '## Participant coverage',
    '',
    participantRows.length
      ? markdownTable(['Code', 'Platform', 'Status', 'Minutes', 'Events', 'Missing notes'], participantRows)
      : 'NA',
    '',
    '## Observed decision evidence',
    '',
    markdownTable(
      ['Decision', 'Events', 'Action participants', 'Notes present', 'Action + note evidence'],
      decisionRows,
    ),
    '',
    'Action + note evidence means both sources exist for review; it is not an automatic comprehension score.',
    '',
    '## Qualitative notes',
    '',
    noteSections || 'NA',
    '',
  ].join('\n');
}

function markdownTable(headers, rows) {
  const escape = (value) => String(value).replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
  return [
    `| ${headers.map(escape).join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(escape).join(' | ')} |`),
  ].join('\n');
}

function listOrNa(values) {
  return values.length ? values.join(', ') : 'NA';
}

function noteOrNa(value) {
  return value ? value.replace(/\r?\n/g, ' / ') : 'NA';
}

async function runCli() {
  const inputDirectory = path.resolve(process.argv[2] ?? 'playtest-results');
  const outputMarkdown = path.resolve(process.argv[3] ?? path.join(inputDirectory, 'PLAYTEST_SUMMARY.md'));
  const outputJson = /\.md$/i.test(outputMarkdown)
    ? outputMarkdown.replace(/\.md$/i, '.json')
    : `${outputMarkdown}.json`;
  const entries = (await readdir(inputDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.json') && !entry.name.startsWith('PLAYTEST_SUMMARY'))
    .sort((left, right) => left.name.localeCompare(right.name));
  if (!entries.length) throw new Error(`No playtest JSON files found in ${inputDirectory}`);

  const parsed = [];
  const invalid = [];
  for (const entry of entries) {
    const sourceFile = entry.name;
    try {
      const value = JSON.parse(await readFile(path.join(inputDirectory, sourceFile), 'utf8'));
      const result = parsePlaytestExport(value, sourceFile);
      if (result.ok) parsed.push(result.record);
      else invalid.push({ sourceFile, errors: result.errors });
    } catch (error) {
      invalid.push({ sourceFile, errors: [error instanceof Error ? error.message : String(error)] });
    }
  }
  if (invalid.length) {
    const details = invalid.map((item) => `${item.sourceFile}: ${item.errors.join(' ')}`).join('\n');
    throw new Error(`Invalid playtest exports:\n${details}`);
  }

  const summary = buildPlaytestSummary(parsed);
  await writeFile(outputMarkdown, renderPlaytestSummary(summary), 'utf8');
  await writeFile(outputJson, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  console.log(`Playtest summary: ${outputMarkdown}`);
  console.log(`Playtest evidence JSON: ${outputJson}`);
  console.log(`Status: ${summary.analysisReady ? 'ANALYSIS READY' : 'INCOMPLETE'}`);
  if (!summary.analysisReady) process.exitCode = 2;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  runCli().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
