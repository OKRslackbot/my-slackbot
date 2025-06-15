const express = require('express');
const router = express.Router();
const { WebClient } = require('@slack/web-api');
const {
  loadOKRs,
  saveOKRs,
  updateKeyResultProgress,
  createObjective,
  addKeyResult
} = require('../services/okrService');
const { buildOKRBlocks } = require('../services/uiService');

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

router.post('/', async (req, res) => {
  const { command, user_id, text, channel_id } = req.body;

  if (command === '/okr-list') {
    const okrData = await loadOKRs();
    const userData = okrData.users[user_id] || { objectives: {} };
    const blocks = buildOKRBlocks(userData);

    await slack.chat.postMessage({
      channel: channel_id,
      text: 'Your OKRs',
      blocks
    });

    return res.status(200).send();
  }

  if (command === '/kr-update') {
    const [objectiveId, krId, progressRaw] = text.trim().split(' ');
    const progress = parseInt(progressRaw.replace('%', ''), 10);

    if (!objectiveId || !krId || isNaN(progress)) {
      return res.send('Format: /kr-update OKR1 KR1 70%');
    }

    const okrData = await loadOKRs();
    const userData = okrData.users[user_id];
    const objective = userData?.objectives?.[objectiveId];

    if (!objective || !objective.keyResults?.[krId]) {
      return res.send('Invalid Objective or Key Result.');
    }

    updateKeyResultProgress(objective, krId, progress);
    await saveOKRs(okrData);

    return res.send(`✅ Updated ${krId} in ${objectiveId} to ${progress}%`);
  }

  if (command === '/okr-create') {
    const [objectiveId, ...objectiveTextArr] = text.trim().split(' ');
    const objectiveText = objectiveTextArr.join(' ');

    if (!objectiveId || !objectiveText) {
      return res.send('Usage: /okr-create OKR1 Improve user engagement');
    }

    const okrData = await loadOKRs();
    if (!okrData.users[user_id]) okrData.users[user_id] = { objectives: {} };
    createObjective(okrData.users[user_id], objectiveId, objectiveText);
    await saveOKRs(okrData);

    return res.send(`🎯 Created Objective *${objectiveId}*: "${objectiveText}"`);
  }

  if (command === '/kr-add') {
    const [objectiveId, krId, ...krTextArr] = text.trim().split(' ');
    const krText = krTextArr.join(' ');

    if (!objectiveId || !krId || !krText) {
      return res.send('Usage: /kr-add OKR1 KR1 Increase NPS by 20 points');
    }

    const okrData = await loadOKRs();
    const userData = okrData.users[user_id];
    if (!userData?.objectives?.[objectiveId]) {
      return res.send(`Objective *${objectiveId}* not found.`);
    }

    addKeyResult(userData.objectives[objectiveId], krId, krText);
    await saveOKRs(okrData);

    return res.send(`➕ Added KR *${krId}* to *${objectiveId}*: "${krText}"`);
  }

  if (command === '/team-okr-report') {
    // Placeholder logic
    return res.send(`📊 This command will soon display a team-wide OKR report.`);
  }

  res.status(200).send(); // fallback
});

module.exports = router;
