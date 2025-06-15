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

function createObjective(okrData, userId, objectiveId, objectiveText) {
  if (!okrData.users[userId]) {
    okrData.users[userId] = { objectives: {} };
  }

  const userObjectives = okrData.users[userId].objectives;

  if (userObjectives[objectiveId]) {
    return false; // already exists
  }

  userObjectives[objectiveId] = {
    text: objectiveText,
    keyResults: {}
  };

  return true;
}

function addKeyResult(okrData, userId, objectiveId, krId, krText) {
  if (!okrData.users[userId]) {
    okrData.users[userId] = { objectives: {} };
  }

  const userData = okrData.users[userId];

  if (!userData.objectives[objectiveId]) {
    return false; // objective doesn't exist
  }

  const objective = userData.objectives[objectiveId];

  if (!objective.keyResults) {
    objective.keyResults = {};
  }

  objective.keyResults[krId] = { text: krText, progress: 0 };
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
    return true;
  }
  return false;
}

function updateObjectiveText(okrData, userId, objectiveId, newText) {
  const user = okrData.users[userId];
  if (user && user.objectives?.[objectiveId]) {
    user.objectives[objectiveId].text = newText;
    return true;
  }
  return false;
}

function deleteObjective(okrData, userId, objectiveId) {
  const user = okrData.users[userId];
  if (user?.objectives?.[objectiveId]) {
    delete user.objectives[objectiveId];
    return true;
  }
  return false;
}

function deleteKeyResult(okrData, userId, objectiveId, krId) {
  const user = okrData.users[userId];
  if (user?.objectives?.[objectiveId]?.keyResults?.[krId]) {
    delete user.objectives[objectiveId].keyResults[krId];
    return true;
  }
  return false;
}

function clearOKRs(okrData, userId) {
  if (okrData.users[userId]) {
    okrData.users[userId].objectives = {};
    return true;
  }
  return false;
}

function generateTeamReport(okrData) {
  const report = [];

  if (!okrData.users || Object.keys(okrData.users).length === 0) {
    return '⚠️ No OKR data available to generate a report.';
  }

  for (const [userId, userData] of Object.entries(okrData.users)) {
    report.push(`👤 <@${userId}>`);
    const objectives = userData.objectives || {};
    if (Object.keys(objectives).length === 0) {
      report.push('  No objectives defined.\n');
      continue;
    }

    for (const [objId, obj] of Object.entries(objectives)) {
      report.push(`  📌 *${objId}*: ${obj.text}`);
      const keyResults = obj.keyResults || {};
      for (const [krId, kr] of Object.entries(keyResults)) {
        report.push(`    - *${krId}*: ${kr.text} (${kr.progress || 0}%)`);
      }
    }
    report.push('');
  }

  return report.join('\n');
}

module.exports = {
  loadOKRs,
  saveOKRs,
  createObjective,
  addKeyResult,
  updateKeyResultProgress,
  updateObjectiveText,
  deleteObjective,
  deleteKeyResult,
  clearOKRs,
  generateTeamReport
};
