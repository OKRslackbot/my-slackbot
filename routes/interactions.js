const express = require('express');
const router = express.Router();
const { WebClient } = require('@slack/web-api');
const {
  loadOKRs,
  saveOKRs
} = require('../services/okrService');

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

router.post('/', express.json(), async (req, res) => {
  const payload = JSON.parse(req.body.payload);

  if (payload.type === 'view_submission') {
    const userId = payload.user.id;
    const callbackId = payload.view.callback_id;
    const okrData = await loadOKRs();
    const userData = okrData.users[userId] || { objectives: {} };

    if (callbackId === 'edit_okr_modal') {
      const objectiveId = payload.view.private_metadata;
      const updatedText = payload.view.state.values.objective_block.objective_input.value;

      if (userData.objectives?.[objectiveId]) {
        userData.objectives[objectiveId].text = updatedText;
      }
    }

    if (callbackId === 'add_kr_modal') {
      const objectiveId = payload.view.private_metadata;
      const krInput = payload.view.state.values.kr_block.kr_input.value;

      if (userData.objectives?.[objectiveId]) {
        const newKrId = `KR${Object.keys(userData.objectives[objectiveId].keyResults || {}).length + 1}`;
        userData.objectives[objectiveId].keyResults = userData.objectives[objectiveId].keyResults || {};
        userData.objectives[objectiveId].keyResults[newKrId] = { text: krInput, progress: 0 };
      }
    }

    if (callbackId === 'update_kr_progress_modal') {
      const [objectiveId, krId] = payload.view.private_metadata.split('|');
      const progress = parseInt(payload.view.state.values.progress_block.progress_input.value, 10);

      if (
        userData.objectives?.[objectiveId]?.keyResults?.[krId] &&
        !isNaN(progress) &&
        progress >= 0 &&
        progress <= 100
      ) {
        userData.objectives[objectiveId].keyResults[krId].progress = progress;
      }
    }

    okrData.users[userId] = userData;
    await saveOKRs(okrData);
    return res.status(200).json({ response_action: 'clear' });
  }

  res.status(200).send();
});

module.exports = router;
