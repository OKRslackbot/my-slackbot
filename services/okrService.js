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

module.exports = {
  loadOKRs,
  saveOKRs,
  updateKeyResultProgress
};
