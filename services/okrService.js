const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data.okrs.json');

// -------------------------
// Data loading/saving
// -------------------------
function loadOKRs() {
  if (!fs.existsSync(DATA_FILE)) return { users: {} };
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveOKRs(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// -------------------------
// OKR Operations
// -------------------------
function createObjective(userData, objectiveId, text) {
  if (!userData.objectives) {
    userData.objectives = {};
  }

  if (userData.objectives[objectiveId]) {
    return false; // already exists
  }

  userData.objectives[objectiveId] = {
    id: objectiveId,
    title: text,
    keyResults: {},
    createdAt: new Date(),
    lastUpdated: new Date()
  };

  return true;
}

function updateObjectiveText(objective, newText) {
  if (!objective) return false;
  objective.title = newText;
  objective.lastUpdated = new Date();
  return true;
}

// -------------------------
// Key Result Operations
// -------------------------
function addKeyResult(userData, objectiveId, krId, krText) {
  if (!userData.objectives?.[objectiveId]) return false;

  const objective = userData.objectives[objectiveId];
  if (!objective.keyResults) {
    objective.keyResults = {};
  }

  objective.keyResults[krId] = {
    text: krText,
    progress: 0
  };

  objective.lastUpdated = new Date();
  return true;
}

function updateKeyResultProgress(objective, krId, newProgress) {
  if (
    objective.keyResults &&
    objective.keyResults[krId] &&
    newProgress >= 0 &&
    newProgress <= 100
  ) {
    objective.keyResults[krId].progress = newProgress;
    objective.lastUpdated = new Date();
    return true;
  }
  return false;
}

function deleteKeyResult(userData, objectiveId, krId) {
  if (userData?.objectives?.[objectiveId]?.keyResults?.[krId]) {
    delete userData.objectives[objectiveId].keyResults[krId];
    userData.objectives[objectiveId].lastUpdated = new Date();
    return true;
  }
  return false;
}

// -------------------------
// Cleanup + Deletion
// -------------------------
function deleteObjective(userData, objectiveId) {
  if (userData?.objectives?.[objectiveId]) {
    delete userData.objectives[objectiveId];
    return true;
  }
  return false;
}

function clearAllOKRs(userData) {
  userData.objectives = {};
  return true;
}

// -------------------------
// Team Reporting
// -------------------------
function generateTeamReport(users) {
  const report = [];

  if (!users || Object.keys(users).length === 0) {
    return '⚠️ No OKR data available to generate a report.';
  }

  for (const [userId, userData] of Object.entries(users)) {
    report.push(`👤 <@${userId}>`);
    const objectives = userData.objectives || {};

    if (Object.keys(objectives).length === 0) {
      report.push('  No objectives defined.\n');
      continue;
    }

    for (const [objId, obj] of Object.entries(objectives)) {
      report.push(`  📌 *${objId}*: ${obj.title}`);
      const keyResults = obj.keyResults || {};

      for (const [krId, kr] of Object.entries(keyResults)) {
        report.push(`    - *${krId}*: ${kr.text} (${kr.progress || 0}%)`);
      }
    }
    report.push('');
  }

  return report.join('\n');
}

// -------------------------

module.exports = {
  loadOKRs,
  saveOKRs,
  createObjective,
  updateObjectiveText,
  addKeyResult,
  updateKeyResultProgress,
  deleteKeyResult,
  deleteObjective,
  clearAllOKRs,
  generateTeamReport
};
