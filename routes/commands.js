const express = require('express');
const router = express.Router();
const okrService = require('../services/okrService');

router.post('/', async (req, res) => {
  const { command, user_id, text } = req.body;

  const args = text.trim().split(' ');
  const [okrId, krId, ...rest] = args;
  const message = rest.join(' ');

  switch (command) {
    case '/okr-create':
      okrService.createObjective(user_id, okrId, message);
      return res.send(`✅ Created objective *${okrId}*: ${message}`);

    case '/kr-add':
      okrService.addKeyResult(user_id, okrId, krId, message);
      return res.send(`✅ Added KR *${krId}* to *${okrId}*: ${message}`);

    case '/okr-update':
      okrService.updateObjective(user_id, okrId, message);
      return res.send(`✏️ Updated objective *${okrId}*: ${message}`);

    case '/kr-update':
      okrService.updateKeyResult(user_id, okrId, krId, message);
      return res.send(`✏️ Updated KR *${krId}* in *${okrId}*: ${message}`);

    case '/okr-delete':
      okrService.deleteObjective(user_id, okrId);
      return res.send(`🗑️ Deleted objective *${okrId}*`);

    case '/kr-delete':
      okrService.deleteKeyResult(user_id, okrId, krId);
      return res.send(`🗑️ Deleted KR *${krId}* from *${okrId}*`);

    case '/okr-list':
      return res.send(okrService.listOKRs(user_id));

    case '/okr-report':
      return res.send(okrService.generateReport(user_id));

    default:
      return res.send('❓ Unknown command.');
  }
});

module.exports = router;
