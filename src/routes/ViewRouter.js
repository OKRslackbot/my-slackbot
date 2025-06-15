const ObjectiveService = require('../services/ObjectiveService');
const KeyResultService = require('../services/KeyResultService');

class ViewRouter {
  constructor(app, db) {
    this.app = app;
    this.db = db;
    this.objectiveService = new ObjectiveService(db);
    this.keyResultService = new KeyResultService(db);
  }

  registerRoutes() {
    // Handle objective creation modal submission
    this.app.view('create_objective_modal', async ({ ack, body, view, client }) => {
      await ack();
      await this.objectiveService.handleCreateSubmission({ body, view, client });
    });

    // Handle key result creation modal submission
    this.app.view('create_keyresult_modal', async ({ ack, body, view, client }) => {
      await ack();
      await this.keyResultService.handleCreateSubmission({ body, view, client });
    });

    // Handle progress update modal submission
    this.app.view('update_progress_modal', async ({ ack, body, view, client }) => {
      await ack();
      await this.keyResultService.handleProgressUpdate({ body, view, client });
    });
  }
}

module.exports = ViewRouter;
