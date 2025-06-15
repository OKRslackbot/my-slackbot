const express = require('express');
const bodyParser = require('body-parser');
const app = express();
require('dotenv').config();

const commandsRouter = require('./routes/commands');
const interactionsRouter = require('./routes/interactions');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/slack/commands', commandsRouter);
app.use('/slack/interactions', interactionsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Slack bot running on port ${PORT}`);

});