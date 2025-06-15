require('dotenv').config();
const { App } = require('@slack/bolt');
const Database = require('./src/database/Database');
const CommandRouter = require('./src/routes/CommandRouter');
const ViewRouter = require('./src/routes/ViewRouter');
const ActionRouter = require('./src/routes/ActionRouter');

class OKRBot {
  constructor() {
    this.app = new App({
      token: process.env.SLACK_BOT_TOKEN,
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      socketMode: false,
      port: process.env.PORT || 3000
    });
    
    this.db = new Database();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupRoutes() {
    // Initialize routers with dependencies
    this.commandRouter = new CommandRouter(this.app, this.db);
    this.viewRouter = new ViewRouter(this.app, this.db);
    this.actionRouter = new ActionRouter(this.app, this.db);
    
    // Register all routes
    this.commandRouter.registerRoutes();
    this.viewRouter.registerRoutes();
    this.actionRouter.registerRoutes();
  }

  setupErrorHandling() {
    this.app.error(async (error) => {
      console.error('Slack app error:', error);
    });
  }

  async start() {
    try {
      await this.db.init();
      await this.app.start();
      console.log('⚡️ Modular OKR Slack Bot is running!');
    } catch (error) {
      console.error('Error starting app:', error);
      process.exit(1);
    }
  }
}

// Start the bot
const bot = new OKRBot();
bot.start();