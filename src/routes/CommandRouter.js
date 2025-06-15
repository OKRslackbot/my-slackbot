const ObjectiveService = require('../services/ObjectiveService');
const KeyResultService = require('../services/KeyResultService');
const ReportService = require('../services/ReportService');

class CommandRouter {
  constructor(app, db) {
    this.app = app;
    this.db = db;
    this.objectiveService = new ObjectiveService(db);
    this.keyResultService = new KeyResultService(db);
    this.reportService = new ReportService(db);
  }

  registerRoutes() {
    this.app.command('/okr', async ({ ack, body, client, respond }) => {
      await ack();
      
      const args = body.text.trim().split(' ');
      const command = args[0];
      
      try {
        switch (command) {
          case 'create-objective':
            await this.objectiveService.showCreateModal({ body, client });
            break;
            
          case 'create-key-result':
            await this.keyResultService.showCreateModal({ body, client });
            break;
            
          case 'list':
            const scope = args[1] || 'my';
            await this.handleList(scope, { body, respond });
            break;
            
          case 'edit':
            await this.handleEdit({ body, client });
            break;
            
          case 'delete':
            await this.handleDelete({ body, client });
            break;
            
          case 'reports':
            const reportType = args[1] || 'overview';
            await this.reportService.generateReport(reportType, { body, respond });
            break;
            
          case 'help':
          default:
            await this.showHelp({ respond });
        }
      } catch (error) {
        console.error('Command error:', error);
        await respond({
          text: '❌ An error occurred. Please try again.',
          response_type: 'ephemeral'
        });
      }
    });
  }

  async handleList(scope, { body, respond }) {
    if (scope === 'team') {
      const teamOKRs = await this.db.getTeamOKRs();
      const blocks = await this.reportService.buildTeamOKRsBlocks(teamOKRs);
      
      await respond({
        blocks: blocks,
        response_type: 'in_channel'
      });
    } else {
      const userObjectives = await this.db.getObjectives(body.user_id);
      const blocks = await this.reportService.buildUserOKRsBlocks(userObjectives);
      
      await respond({
        blocks: blocks,
        response_type: 'ephemeral'
      });
    }
  }

  async handleEdit({ body, client }) {
    await client.chat.postEphemeral({
      channel: body.channel_id,
      user: body.user_id,
      text: '🚧 Edit functionality coming soon!'
    });
  }

  async handleDelete({ body, client }) {
    await client.chat.postEphemeral({
      channel: body.channel_id,
      user: body.user_id,
      text: '🚧 Delete functionality coming soon!'
    });
  }

  async showHelp({ respond }) {
    await respond({
      text: `*OKR Bot Commands:*
      
• \`/okr create-objective\` - Create a new objective
• \`/okr create-key-result\` - Add key results to an objective
• \`/okr list\` - View your OKRs
• \`/okr list team\` - View team OKRs
• \`/okr edit\` - Edit an existing OKR
• \`/okr delete\` - Delete an OKR
• \`/okr reports [type]\` - Generate reports (overview, progress, team)
• \`/okr help\` - Show this help message`,
      response_type: 'ephemeral'
    });
  }
}

module.exports = CommandRouter;