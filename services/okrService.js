const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data.okrs.json');

function loadOKRs() {
  if (!fs.existsSync(DATA_FILE)) return { users: {} };
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveOKRs(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function updateKeyResultProgress(objective, krId, newProgress) {
  if (
    objective.keyResults &&
    objective.keyResults[krId] &&
    newProgress >= 0 &&
    newProgress <= 100
  ) {
    objective.keyResults[krId].progress = newProgress;
    return true;
  }
  return false;
}

function createObjective(userData, objectiveId, text) {
  if (!userData.objectives) userData.objectives = {};
  if (userData.objectives[objectiveId]) return false;
  userData.objectives[objectiveId] = {
    text,
    keyResults: {}
  };
  return true;
}

function addKeyResult(objective, krId, text) {
  if (!objective.keyResults[krId]) {
    objective.keyResults[krId] = {
      text,
      progress: 0
    };
    return true;
  }
  return false;
}

function deleteObjective(userData, objectiveId) {
  if (userData.objectives && userData.objectives[objectiveId]) {
    delete userData.objectives[objectiveId];
    return true;
  }
  return false;
}

function deleteKeyResult(objective, krId) {
  if (objective.keyResults && objective.keyResults[krId]) {
    delete objective.keyResults[krId];
    return true;
  }
  return false;
}

function updateObjectiveText(objective, newText) {
  if (objective && newText) {
    objective.text = newText;
    return true;
  }
  return false;
}

function clearOKRs(userData) {
  userData.objectives = {};
}

function generateTeamReport(okrData) {
  const reportLines = [];

  for (const [userId, userData] of Object.entries(okrData.users)) {
    reportLines.push(`User: <@${userId}>`);
    for (const [objId, objective] of Object.entries(userData.objectives || {})) {
      reportLines.push(`• *${objId}*: ${objective.text}`);
      for (const [krId, kr] of Object.entries(objective.keyResults || {})) {
        reportLines.push(`   - ${krId}: ${kr.text} (${kr.progress}%)`);
      }
    }
    reportLines.push('');
  }

  return reportLines.join('\n');
}

module.exports = {
  loadOKRs,
  saveOKRs,
  updateKeyResultProgress,
  createObjective,
  addKeyResult,
  deleteObjective,
  deleteKeyResult,
  updateObjectiveText,
  clearOKRs,
  generateTeamReport
};
