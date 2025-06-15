const { v4: uuidv4 } = require('uuid');
const UIBuilder = require('../utils/UIBuilder');

class KeyResultService {
  constructor(db) {
    this.db = db;
    this.uiBuilder = new UIBuilder();
  }

  async showCreateModal({ body, client }) {
    try {
      const objectives = await this.db.getObjectives(body.user_id);
      
      if (objectives.length === 0) {
        await client.chat.postEphemeral({
          channel: body.channel_id,
          user: body.user_id,
          text: '❌ You need to create an objective first before adding key results. Use `/okr create-objective`'
        });
        return;
      }

      const modal = this.uiBuilder.buildCreateKeyResultModal(objectives);
      
      await client.views.open({
        trigger_id: body.trigger_id,
        view: modal
      });
    } catch (error) {
      console.error('Error showing create key result modal:', error);
    }
  }

  async handleCreateSubmission({ body, view, client }) {
    try {
      const values = view.state.values;
      const keyResultData = {
        id: uuidv4(),
        objective_id: values.kr_objective.objective_select.selected_option.value,
        title: values.kr_title.title_input.value,
        description: values.kr_description?.description_input?.value || '',
        owner: body.user.id,
        owner_name: body.user.name,
        target_value: parseFloat(values.kr_target.target_input.value),
        current_value: 0,
        unit: values.kr_unit.unit_input.value,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await this.db.createKeyResult(keyResultData);
      
      await client.chat.postMessage({
        channel: body.user.id,
        text: `✅ Key Result "${keyResultData.title}" created successfully!`,
        blocks: this.uiBuilder.buildKeyResultCreatedBlocks(keyResultData)
      });
      
    } catch (error) {
      console.error('Error creating key result:', error);
      await client.chat.postMessage({
        channel: body.user.id,
        text: '❌ Error creating key result. Please try again.'
      });
    }
  }

  async showProgressModal({ itemId, client, body }) {
    try {
      const keyResult = await this.db.getKeyResultById(itemId);
      
      if (!keyResult) {
        await client.chat.postEphemeral({
          channel: body.channel?.id || body.user.id,
          user: body.user.id,
          text: '❌ Key result not found.'
        });
        return;
      }

      const modal = this.uiBuilder.buildProgressUpdateModal(keyResult);
      
      await client.views.open({
        trigger_id: body.trigger_id,
        view: modal
      });

    } catch (error) {
      console.error('Error showing progress modal:', error);
    }
  }

  async handleProgressUpdate({ body, view, client }) {
    try {
      const values = view.state.values;
      const keyResultId = view.private_metadata;
      const newValue = parseFloat(values.progress_value.value_input.value);
      const comment = values.progress_comment?.comment_input?.value || '';
      
      await this.db.updateKeyResultProgress(keyResultId, newValue, comment, body.user.id);
      
      const keyResult = await this.db.getKeyResultById(keyResultId);
      
      await client.chat.postMessage({
        channel: body.user.id,
        text: `✅ Progress updated successfully!`,
        blocks: this.uiBuilder.buildProgressUpdateBlocks(keyResult, newValue, comment)
      });
      
    } catch (error) {
      console.error('Error updating progress:', error);
      await client.chat.postMessage({
        channel: body.user.id,
        text: '❌ Error updating progress. Please try again.'
      });
    }
  }
}

module.exports = KeyResultService;