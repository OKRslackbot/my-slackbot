
const express = require('express');
const router = express.Router();
const { WebClient } = require('@slack/web-api');
const {
  loadOKRs,
  saveOKRs,
  createObjective,
  updateObjectiveText,
  deleteObjective,
  addKeyResult,
  deleteKeyResult,
  updateKeyResultProgress,
  clearAllOKRs,
  generateTeamReport,
  startPlanning
} = require('../services/okrService');
const { buildOKRBlocks } = require('../services/uiService');

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

router.post('/', async (req, res) => {
  const { command, user_id, text, channel_id } = req.body;

  const okrData = await loadOKRs();
  const userData = okrData.users[user_id] || { objectives: {} };
  okrData.users[user_id] = userData;

  if (command === '/okr-create') {
    const [objectiveId, ...objectiveTextArr] = text.trim().split(' ');
    const objectiveText = objectiveTextArr.join(' ');
    if (!objectiveId || !objectiveText) {
      return res.send('Usage: /okr-create OKR1 Improve user engagement');
    }
    createObjective(userData, objectiveId, objectiveText);
    await saveOKRs(okrData);
    return res.send(`✅ Created objective ${objectiveId}: "${objectiveText}"`);
  }

  if (command === '/okr-update-text') {
  const [objectiveId, ...newTextParts] = text.trim().split(' ');
  const newText = newTextParts.join(' ');

  if (!objectiveId || !newText) {
    return res.send('Usage: /okr-update-text OKR1 New objective description');
  }


  if (!userData?.objectives?.[objectiveId]) {
    return res.send(`Objective *${objectiveId}* not found.`);
  }

  const updated = updateObjectiveText(userData.objectives[objectiveId], newText);

  if (updated) {
    await saveOKRs(okrData);
    return res.send(`✅ Objective *${objectiveId}* updated to: "${newText}"`);
  } else {
    return res.send(`⚠️ Failed to update Objective *${objectiveId}*.`);
  }
}


  if (command === '/okr-delete') {
    const objectiveId = text.trim();
    if (!objectiveId) {
      return res.send('Usage: /okr-delete OKR1');
    }
    deleteObjective(userData, objectiveId);
    await saveOKRs(okrData);
    return res.send(`🗑️ Deleted objective ${objectiveId}`);
  }

  if (command === '/okr-clear') {
    clearAllOKRs(userData);
    await saveOKRs(okrData);
    return res.send('🧹 Cleared all OKRs');
  }

  if (command === '/kr-add') {
    const [objectiveId, krId, ...krTextArr] = text.trim().split(' ');
    const krText = krTextArr.join(' ');
    if (!objectiveId || !krId || !krText) {
      return res.send('Usage: /kr-add OKR1 KR1 Increase NPS score');
    }
    addKeyResult(userData, objectiveId, krId, krText);
    await saveOKRs(okrData);
    return res.send(`✅ Added KR ${krId} to ${objectiveId}: "${krText}"`);
  }

  if (command === '/kr-delete') {
    const [objectiveId, krId] = text.trim().split(' ');
    if (!objectiveId || !krId) {
      return res.send('Usage: /kr-delete OKR1 KR1');
    }
    deleteKeyResult(userData, objectiveId, krId);
    await saveOKRs(okrData);
    return res.send(`🗑️ Deleted KR ${krId} from ${objectiveId}`);
  }

  if (command === '/kr-update') {
    const [objectiveId, krId, progressRaw] = text.trim().split(' ');
    const progress = parseInt(progressRaw.replace('%', ''), 10);
    if (!objectiveId || !krId || isNaN(progress)) {
      return res.send('Format: /kr-update OKR1 KR1 70%');
    }
    updateKeyResultProgress(userData.objectives[objectiveId], krId, progress);
    await saveOKRs(okrData);
    return res.send(`✅ Updated ${krId} in ${objectiveId} to ${progress}%`);
  }

  if (command === '/okr-list') {
    const blocks = buildOKRBlocks(userData);
    await slack.chat.postMessage({
      channel: channel_id,
      text: 'Your OKRs',
      blocks
    });
    return res.status(200).send();
  }

  if (command === '/team-okr-report') {
    const report = generateTeamReport(okrData.users);
    return res.send(report);
  }

  if (command === '/okr-plan-start') {
    const message = startPlanning(userData);
    await saveOKRs(okrData);
    return res.send(message);
  }

  res.status(200).send();
});

module.exports = router;

