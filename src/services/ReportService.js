const UIBuilder = require('../utils/UIBuilder');

class ReportService {
  constructor(db) {
    this.db = db;
    this.uiBuilder = new UIBuilder();
  }

  async generateReport(reportType, { body, respond }) {
    try {
      switch (reportType) {
        case 'overview':
          await this.generateOverviewReport({ body, respond });
          break;
        case 'progress':
          await this.generateProgressReport({ body, respond });
          break;
        case 'team':
          await this.generateTeamReport({ body, respond });
          break;
        case 'individual':
          await this.generateIndividualReport({ body, respond });
          break;
        default:
          await this.generateOverviewReport({ body, respond });
      }
    } catch (error) {
      console.error('Error generating report:', error);
      await respond({
        text: '❌ Error generating report. Please try again.',
        response_type: 'ephemeral'
      });
    }
  }

  async generateOverviewReport({ body, respond }) {
    const teamOKRs = await this.db.getTeamOKRs();
    const userStats = await this.db.getUserStats(body.user_id);
    
    const blocks = this.uiBuilder.buildOverviewReportBlocks(teamOKRs, userStats);
    
    await respond({
      blocks: blocks,
      response_type: 'ephemeral'
    });
  }

  async generateProgressReport({ body, respond }) {
    const objectives = await this.db.getObjectives();
    const progressData = [];
    
    for (const obj of objectives) {
      const keyResults = await this.db.getKeyResultsByObjective(obj.id);
      const objProgress = this.calculateObjectiveProgress(keyResults);
      progressData.push({
        objective: obj,
        keyResults: keyResults,
        progress: objProgress
      });
    }
    
    const blocks = this.uiBuilder.buildProgressReportBlocks(progressData);
    
    await respond({
      blocks: blocks,
      response_type: 'in_channel'
    });
  }

  async generateTeamReport({ body, respond }) {
    const teamOKRs = await this.db.getTeamOKRs();
    const blocks = this.uiBuilder.buildTeamReportBlocks(teamOKRs);
    
    await respond({
      blocks: blocks,
      response_type: 'in_channel'
    });
  }

  async generateIndividualReport({ body, respond }) {
    const userObjectives = await this.db.getObjectives(body.user_id);
    const userStats = await this.db.getUserStats(body.user_id);
    
    const blocks = this.uiBuilder.buildIndividualReportBlocks(userObjectives, userStats);
    
    await respond({
      blocks: blocks,
      response_type: 'ephemeral'
    });
  }

  async buildUserOKRsBlocks(objectives) {
    const progressData = [];
    
    for (const obj of objectives) {
      const keyResults = await this.db.getKeyResultsByObjective(obj.id);
      progressData.push({
        objective: obj,
        keyResults: keyResults,
        progress: this.calculateObjectiveProgress(keyResults)
      });
    }
    
    return this.uiBuilder.buildUserOKRsBlocks(progressData);
  }

  async buildTeamOKRsBlocks(teamOKRs) {
    return this.uiBuilder.buildTeamOKRsBlocks(teamOKRs);
  }

  calculateObjectiveProgress(keyResults) {
    if (keyResults.length === 0) return 0;
    
    const totalProgress = keyResults.reduce((sum, kr) => {
      return sum + (kr.target_value > 0 ? (kr.current_value / kr.target_value) * 100 : 0);
    }, 0);
    
    return Math.round(totalProgress / keyResults.length);
  }
}

module.exports = ReportService;