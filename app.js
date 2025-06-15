require('dotenv').config();
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

// Sample OKR commands
app.command('/okr-create', async ({ command, ack, say }) => {
  await ack();
  await say(`Creating OKR: ${command.text}`);
});

app.command('/okr-list', async ({ command, ack, say }) => {
  await ack();
  await say('Here are your current OKRs:\n• Sample OKR 1\n• Sample OKR 2');
});

app.command('/okr-update', async ({ command, ack, say }) => {
  await ack();
  await say(`Updating OKR: ${command.text}`);
});

// Message listener for mentions
app.message(/okr|objective|key result/i, async ({ message, say }) => {
  await say('I can help you with OKRs! Use /okr-create, /okr-list, or /okr-update commands.');
});

// Error handling
app.error((error) => {
  console.error('Slack app error:', error);
});

(async () => {
  try {
    await app.start(process.env.PORT || 3000);
    console.log('⚡️ Slack bot is running!');
  } catch (error) {
    console.error('Failed to start app:', error);
  }
})();