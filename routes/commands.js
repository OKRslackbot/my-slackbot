const express = require('express');
const router = express.Router();
const { WebClient } = require('@slack/web-api');
const {
  loadOKRs,
  saveOKRs,
  updateKeyResultProgress
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

  res.status(200).send();
});

module.exports = router;
