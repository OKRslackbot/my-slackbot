function buildOKRBlocks(userData) {
  const blocks = [];

  for (const [objId, obj] of Object.entries(userData.objectives || {})) {
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `*${objId}*: ${obj.text}` } });

    for (const [krId, kr] of Object.entries(obj.keyResults || {})) {
      blocks.push({
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: `• ${krId}: ${kr.text} - Progress: ${kr.progress || 0}%` }
        ]
      });
    }

    blocks.push({ type: 'divider' });
  }

  return blocks.length > 0 ? blocks : [{ type: 'section', text: { type: 'mrkdwn', text: '_No OKRs found._' } }];
}

module.exports = { buildOKRBlocks };
