const { v4: uuidv4 } = require('uuid');
const UIBuilder = require('../utils/UIBuilder');

class ObjectiveService {
  constructor(db) {
    this.db = db;
    this.uiBuilder = new UIBuilder();
  }

  async showCreateModal({ body, client }) {
    const modal = this.uiBuilder.buildCreateObjectiveModal();
    
    await client.views.open({
      trigger_id: body.trigger_id,
      view: modal
    });
  }

  async handleCreateSubmission({ body, view, client }) {
    try {
      const values = view.state.values;
      const objectiveData = {
        id: uuidv4(),
        title: values.objective_title.title_input.value,
        description: values.objective_description?.description_input?.value || '',
        owner: body.user.id,
        owner_name: body.user.name,
        quarter: values.objective_quarter.quarter_select.selected_option.value,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await this.db.createObjective(objectiveData);
      
      await client.chat.postMessage({
        channel: body.user.id,
        text: `✅ Objective "${objectiveData.title}" created successfully!`,
        blocks: this.uiBuilder.buildObjectiveCreatedBlocks(objectiveData)
      });
      
    } catch (error) {
      console.error('Error creating objective:', error);
      await client.chat.postMessage({
        channel: body.user.id,
        text: '❌ Error creating objective. Please try again.'
      });
    }
  }

  async showDetails({ itemId, client, body }) {
    try {
      const objective = await this.db.getObjectiveById(itemId);
      const keyResults = await this.db.getKeyResultsByObjective(itemId);
      
      if (!objective) {
        await client.chat.postEphemeral({
          channel: body.channel?.id || body.user.id,
          user: body.user.id,
          text: '❌ Objective not found.'
        });
        return;
      }

      const blocks = this.uiBuilder.buildObjectiveDetailsBlocks(objective, keyResults);

      await client.chat.postEphemeral({
        channel: body.channel?.id || body.user.id,
        user: body.user.id,
        blocks: blocks
      });

    } catch (error) {
      console.error('Error viewing objective:', error);
      await client.chat.postEphemeral({
        channel: body.channel?.id || body.user.id,
        user: body.user.id,
        text: '❌ Error loading objective details.'
      });
    }
  }
}

module.exports = ObjectiveService;