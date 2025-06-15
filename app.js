require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const commands = require('./routes/commands');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/slack/commands', commands);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Slack OKR bot running on port ${PORT}`);
});
