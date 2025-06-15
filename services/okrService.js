const fs = require('fs');
const path = require('path');
const DATA_FILE = path.join(__dirname, '..', 'data.okrs.json');

// Load and Save
function loadData() {
  if (!fs.existsSync(DATA_FILE)) return { users: {} };
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Init user
function initUser(data, userId) {
  if (!data.users[userId]) {
    data.users[userId] = { objectives: {} };
  }
  return data.users[userId];
}

// CRUD Functions
function createObjective(userId, okrId, title) {
  const data = loadData();
  const user = initUser(data, userId);
  user.objectives[okrId] = { title, keyResults: {} };
  saveData(data);
}

function addKeyResult(userId, okrId, krId, text) {
  const data = loadData();
  const user = initUser(data, userId);
  if (!user.objectives[okrId]) return;
  user.objectives[okrId].keyResults[krId] = { text };
  saveData(data);
}

function updateObjective(userId, okrId, newTitle) {
  const data = loadData();
  const user = initUser(data, userId);
  if (user.objectives[okrId]) {
    user.objectives[okrId].title = newTitle;
    saveData(data);
  }
}

function updateKeyResult(userId, okrId, krId, newText) {
  const data = loadData();
  const user = initUser(data, userId);
  if (user.objectives[okrId]?.keyResults[krId]) {
    user.objectives[okrId].keyResults[krId].text = newText;
    saveData(data);
  }
}

function deleteObjective(userId, okrId) {
  const data = loadData();
  const user = initUser(data, userId);
  delete user.objectives[okrId];
  saveData(data);
}

function deleteKeyResult(userId, okrId, krId) {
  const data = loadData();
  const user = initUser(data, userId);
  delete user.objectives[okrId]?.keyResults[krId];
  saveData(data);
}

function listOKRs(userId) {
  const data = loadData();
  const user = initUser(data, userId);
  const objectives = user.objectives;
  if (!Object.keys(objectives).length) return '📭 No OKRs found.';

  const result = ['📋 *Your OKRs:*'];
  for (const [okrId, obj] of Object.entries(objectives)) {
    result.push(`*${okrId}*: ${obj.title}`);
    for (const [krId, kr] of Object.entries(obj.keyResults)) {
      result.push(`  - ${krId}: ${kr.text}`);
    }
  }
  return result.join('\n');
}

function generateReport(userId) {
  return listOKRs(userId); // For now, reuse the same as list
}

module.exports = {
  createObjective,
  addKeyResult,
  updateObjective,
  updateKeyResult,
  deleteObjective,
  deleteKeyResult,
  listOKRs,
  generateReport
};
