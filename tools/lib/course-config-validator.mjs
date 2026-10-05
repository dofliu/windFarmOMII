// 純函式版 course-config 驗證:回傳 { errors, warnings },不做 I/O,方便單元測試。
// 關卡模式語意:frozen 代表「本 releaseVersion 的計分/任務條件已定版」,不再綁定學期。
export const CONFIG_VERSION_PATTERN = /^[A-Z0-9._-]{3,64}$/i;

export const validateCourseConfig = (config, { packageVersion, missions, characters, equipment, vessels }) => {
  const errors = [];
  const warnings = [];
  const fail = (message) => errors.push(message);
  const unique = (items) => new Set(items).size === items.length;
  const missionIds = new Set(missions.map((item) => item.id));
  const characterById = new Map(characters.map((item) => [item.id, item]));
  const equipmentIds = new Set(equipment.map((item) => item.id));
  const vesselIds = new Set(vessels.map((item) => item.id));

  if (config.schemaVersion !== 1) fail('schemaVersion must be 1');
  if (config.releaseVersion !== packageVersion) fail(`releaseVersion ${config.releaseVersion} does not match package ${packageVersion}`);
  if (typeof config.frozen !== 'boolean') fail('frozen must be a boolean');
  else if (config.frozen === false) warnings.push('frozen=false: development/preview release; scoring and task conditions are not locked');
  if (typeof config.configVersion !== 'string' || !CONFIG_VERSION_PATTERN.test(config.configVersion)) {
    fail('configVersion must be 3-64 chars of letters, numbers, dot, underscore, hyphen');
  }
  if (config.term !== undefined && typeof config.term !== 'string') fail('term must be a string when present');
  if (!/^[A-Z0-9_-]{3,32}$/.test(config.courseCode ?? '')) fail('courseCode must be anonymous-safe');
  if (!Array.isArray(config.rosterIds) || config.rosterIds.length < 18 || config.rosterIds.length > 24 || !unique(config.rosterIds)) {
    fail('Course roster must contain 18-24 unique role IDs');
    return { errors, warnings };
  }
  if (config.rosterIds.some((id) => !characterById.has(id))) fail('roster references an unknown character');
  else if (new Set(config.rosterIds.map((id) => characterById.get(id).trackId)).size !== config.rosterIds.length) {
    fail('Course roster must use one representative per occupational track');
  }
  if (!Array.isArray(config.assignments) || config.assignments.length !== 15) {
    fail('15 fixed Campaign assignments are required');
    return { errors, warnings };
  }
  if (!unique(config.assignments.map((item) => item.id))) fail('assignment IDs must be unique');
  if (!unique(config.assignments.map((item) => item.weekId))) fail('week IDs must be unique');
  if (!unique(config.assignments.map((item) => item.randomSeed))) fail('random seeds must be unique and fixed');

  for (const assignment of config.assignments) {
    if (!/^W\d{2}$/.test(assignment.weekId)) fail(`${assignment.id} has invalid weekId`);
    if (!missionIds.has(assignment.missionId)) fail(`${assignment.id} references an unknown mission`);
    if (!Array.isArray(assignment.teamIds) || assignment.teamIds.length !== 3 || !unique(assignment.teamIds)) fail(`${assignment.id} must use three unique roles`);
    else if (assignment.teamIds.some((id) => !config.rosterIds.includes(id))) fail(`${assignment.id} uses a role outside the Course roster`);
    if (!equipmentIds.has(assignment.equipmentId) || !equipmentIds.has(assignment.spareId)) fail(`${assignment.id} references unknown equipment`);
    if (!vesselIds.has(assignment.vesselId)) fail(`${assignment.id} references an unknown vessel`);
    if (!Number.isSafeInteger(assignment.randomSeed)) fail(`${assignment.id} randomSeed must be an integer`);
    if (assignment.packTier !== undefined && !(Number.isInteger(assignment.packTier) && assignment.packTier >= 1 && assignment.packTier <= 5)) {
      fail(`${assignment.id} packTier must be an integer 1-5 when present`);
    }
  }

  const weekIds = new Set(config.assignments.map((item) => item.weekId));
  if (!Array.isArray(config.unlockedWeekIds) || !unique(config.unlockedWeekIds) || config.unlockedWeekIds.some((id) => !weekIds.has(id))) {
    fail('unlockedWeekIds must be a unique manual subset of assignment weeks');
  } else if (config.unlockedWeekIds.length === 0) {
    warnings.push('unlockedWeekIds is empty: valid, but students will have no playable level');
  }

  // 靜態課程設定不得出現學生姓名、學號或日期式自動解鎖欄位,避免部署時誤收個資或自行推進週次。
  const serialized = JSON.stringify(config).toLowerCase();
  for (const forbidden of ['studentname', 'studentid', 'email', 'unlockdate', 'coursestartdate', 'autounlock']) {
    if (serialized.includes(forbidden)) fail(`forbidden field detected: ${forbidden}`);
  }
  return { errors, warnings };
};
