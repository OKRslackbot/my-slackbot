const ObjectiveService = require('../services/ObjectiveService');
const KeyResultService = require('../services/KeyResultService');

class ActionRouter {
  constructor(app, db) {
    this.app = app;
    this.db = db;
    this.objectiveService = new ObjectiveService(db);
    this.keyResultService = new KeyResultService(db);
  }

  registerRoutes() {
    // Handle button clicks
    this.app.action(/^(view|edit|delete|update)_.*/, async ({ ack, body, client }) => {
      await ack();
      
      const action = body.actions[0];
      const [actionType, itemType, itemId] = action.action_id.split('_');
      
      try {
        switch (actionType) {
          case 'view':
            if (itemType === 'objective') {
              await this.objectiveService.showDetails({ itemId, client, body });
            }
            break;
            
          case 'edit':
            // Handle edit actions
            break;
            
          case 'delete':
            // Handle delete actions
            break;
            
          case 'update':
            if (itemType === 'progress') {
              await this.keyResultService.showProgressModal({ itemId, client, body });
            }
            break;
        }
      } catch (error) {
        console.error('Action error:', error);
        await client.chat.postEphemeral({
          channel: body.channel?.id || body.user.id,
          user: body.user.id,
          text: '❌ An error occurred. Please try again.'
        });
      }
    });
  }
}

module.exports = ActionRouter;