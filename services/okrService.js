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

function generateTeamReport(data) {
  if (!data || !data.users || Object.keys(data.users).length === 0) {
    return '⚠️ No OKR data available to generate a report.';
  }

  let report = '*📊 Team OKR Report:*\n\n';

  for (const [userId, userData] of Object.entries(data.users)) {
    report += `👤 <@${userId}>\n`;

    const objectives = userData.objectives || {};
    if (Object.keys(objectives).length === 0) {
      report += '  _No objectives defined._\n\n';
      continue;
    }

    for (const [objId, obj] of Object.entries(objectives)) {
      report += `  • *${objId}:* ${obj.text}\n`;
      const keyResults = obj.keyResults || {};
      for (const [krId, kr] of Object.entries(keyResults)) {
        report += `     - ${krId}: ${kr.text} (${kr.progress || 0}%)\n`;
      }
    }

    report += '\n';
  }

  return report.trim();
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
