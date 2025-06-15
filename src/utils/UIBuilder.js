class UIBuilder {
  constructor() {
    this.quarters = [
      { text: { type: 'plain_text', text: 'Q1 2025' }, value: 'Q1-2025' },
      { text: { type: 'plain_text', text: 'Q2 2025' }, value: 'Q2-2025' },
      { text: { type: 'plain_text', text: 'Q3 2025' }, value: 'Q3-2025' },
      { text: { type: 'plain_text', text: 'Q4 2025' }, value: 'Q4-2025' }
    ];
  }

  buildCreateObjectiveModal() {
    return {
      type: 'modal',
      callback_id: 'create_objective_modal',
      title: {
        type: 'plain_text',
        text: 'Create New Objective'
      },
      blocks: [
        {
          type: 'input',
          block_id: 'objective_title',
          label: {
            type: 'plain_text',
            text: 'Objective Title'
          },
          element: {
            type: 'plain_text_input',
            action_id: 'title_input',
            placeholder: {
              type: 'plain_text',
              text: 'Enter objective title...'
            },
            max_length: 100
          }
        },
        {
          type: 'input',
          block_id: 'objective_description',
          label: {
            type: 'plain_text',
            text: 'Description'
          },
          element: {
            type: 'plain_text_input',
            action_id: 'description_input',
            multiline: true,
            placeholder: {
              type: 'plain_text',
              text: 'Describe your objective...'
            },
            max_length: 500
          },
          optional: true
        },
        {
          type: 'input',
          block_id: 'objective_quarter',
          label: {
            type: 'plain_text',
            text: 'Quarter'
          },
          element: {
            type: 'static_select',
            action_id: 'quarter_select',
            placeholder: {
              type: 'plain_text',
              text: 'Select quarter'
            },
            options: this.quarters
          }
        }
      ],
      submit: {
        type: 'plain_text',
        text: 'Create Objective'
      }
    };
  }

  buildCreateKeyResultModal(objectives) {
    const objectiveOptions = objectives.map(obj => ({
      text: { type: 'plain_text', text: obj.title },
      value: obj.id
    }));

    return {
      type: 'modal',
      callback_id: 'create_keyresult_modal',
      title: {
        type: 'plain_text',
        text: 'Create Key Result'
      },
      blocks: [
        {
          type: 'input',
          block_id: 'kr_objective',
          label: {
            type: 'plain_text',
            text: 'Select Objective'
          },
          element: {
            type: 'static_select',
            action_id: 'objective_select',
            placeholder: {
              type: 'plain_text',
              text: 'Choose an objective...'
            },
            options: objectiveOptions
          }
        },
        {
          type: 'input',
          block_id: 'kr_title',
          label: {
            type: 'plain_text',
            text: 'Key Result Title'
          },
          element: {
            type: 'plain_text_input',
            action_id: 'title_input',
            placeholder: {
              type: 'plain_text',
              text: 'Enter key result title...'
            },
            max_length: 100
          }
        },
        {
          type: 'input',
          block_id: 'kr_description',
          label: {
            type: 'plain_text',
            text: 'Description'
          },
          element: {
            type: 'plain_text_input',
            action_id: 'description_input',
            multiline: true,
            placeholder: {
              type: 'plain_text',
              text: 'Describe this key result...'
            },
            max_length: 300
          },
          optional: true
        },
        {
          type: 'input',
          block_id: 'kr_target',
          label: {
            type: 'plain_text',
            text: 'Target Value'
          },
          element: {
            type: 'plain_text_input',
            action_id: 'target_input',
            placeholder: {
              type: 'plain_text',
              text: 'e.g., 100'
            }
          }
        },
        {
          type: 'input',
          block_id: 'kr_unit',
          label: {
            type: 'plain_text',
            text: 'Unit of Measurement'
          },
          element: {
            type: 'plain_text_input',
            action_id: 'unit_input',
            placeholder: {
              type: 'plain_text',
              text: 'e.g., users, %, sales, etc.'
            },
            max_length: 20
          }
        }
      ],
      submit: {
        type: 'plain_text',
        text: 'Create Key Result'
      }
    };
  }

  buildProgressUpdateModal(keyResult) {
    return {
      type: 'modal',
      callback_id: 'update_progress_modal',
      private_metadata: keyResult.id,
      title: {
        type: 'plain_text',
        text: 'Update Progress'
      },
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Key Result:* ${keyResult.title}\n*Current Progress:* ${keyResult.current_value}/${keyResult.target_value} ${keyResult.unit}`
          }
        },
        {
          type: 'input',
          block_id: 'progress_value',
          label: {
            type: 'plain_text',
            text: 'New Value'
          },
          element: {
            type: 'plain_text_input',
            action_id: 'value_input',
            placeholder: {
              type: 'plain_text',
              text: `Enter new value (target: ${keyResult.target_value})`
            }
          }
        },
        {
          type: 'input',
          block_id: 'progress_comment',
          label: {
            type: 'plain_text',
            text: 'Progress Comment'
          },
          element: {
            type: 'plain_text_input',
            action_id: 'comment_input',
            multiline: true,
            placeholder: {
              type: 'plain_text',
              text: 'What progress was made? Any blockers?'
            }
          },
          optional: true
        }
      ],
      submit: {
        type: 'plain_text',
        text: 'Update Progress'
      }
    };
  }

  buildObjectiveCreatedBlocks(objective) {
    return [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🎯 New Objective Created'
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Title:*\n${objective.title}`
          },
          {
            type: 'mrkdwn',
            text: `*Quarter:*\n${objective.quarter}`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Description:*\n${objective.description || '_No description provided_'}`
        }
      }
    ];
  }

  buildKeyResultCreatedBlocks(keyResult) {
    return [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🎯 New Key Result Created'
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Title:*\n${keyResult.title}`
          },
          {
            type: 'mrkdwn',
            text: `*Target:*\n${keyResult.target_value} ${keyResult.unit}`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Description:*\n${keyResult.description || '_No description provided_'}`
        }
      }
    ];
  }

  buildProgressUpdateBlocks(keyResult, newValue, comment) {
    const progress = keyResult.target_value > 0 ? Math.round((newValue / keyResult.target_value) * 100) : 0;
    const progressBar = this.generateProgressBar(progress);

    return [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📈 Progress Updated'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${keyResult.title}*\n${progressBar} ${newValue}/${keyResult.target_value} ${keyResult.unit} (${progress}%)`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Comment:*\n${comment || '_No comment provided_'}`
        }
      }
    ];
  }

  buildObjectiveDetailsBlocks(objective, keyResults) {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🎯 ${objective.title}`
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Owner:*\n<@${objective.owner}>`
          },
          {
            type: 'mrkdwn',
            text: `*Quarter:*\n${objective.quarter}`
          },
          {
            type: 'mrkdwn',
            text: `*Status:*\n${objective.status}`
          },
          {
            type: 'mrkdwn',
            text: `*Created:*\n${new Date(objective.created_at).toDateString()}`
          }
        ]
      }
    ];

    if (objective.description) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Description:*\n${objective.description}`
        }
      });
    }

    blocks.push({
      type: 'divider'
    });

    if (keyResults.length > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Key Results:*'
        }
      });

      for (const kr of keyResults) {
        const progress = kr.target_value > 0 ? Math.round((kr.current_value / kr.target_value) * 100) : 0;
        const progressBar = this.generateProgressBar(progress);

        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${kr.title}*\n${kr.description || ''}\n${progressBar} ${kr.current_value}/${kr.target_value} ${kr.unit} (${progress}%)\nOwner: <@${kr.owner}>`
          },
          accessory: {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Update Progress'
            },
            action_id: `update_progress_${kr.id}`
          }
        });
      }
    } else {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '_No key results added yet._'
        }
      });
    }

    return blocks;
  }

  buildUserOKRsBlocks(progressData) {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📋 Your OKRs'
        }
      }
    ];

    if (progressData.length === 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'No objectives found. Create one with `/okr create-objective`'
        }
      });
      return blocks;
    }

    for (const data of progressData) {
      const { objective, keyResults, progress } = data;
      const progressBar = this.generateProgressBar(progress);

      blocks.push(
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${objective.title}*\n${objective.description || ''}\n${progressBar} ${progress}%`
          },
          accessory: {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Details'
            },
            action_id: `view_objective_${objective.id}`
          }
        },
        {
          type: 'divider'
        }
      );

      // Add key results
      for (const kr of keyResults) {
        const krProgress = kr.target_value > 0 ? Math.round((kr.current_value / kr.target_value) * 100) : 0;
        const krProgressBar = this.generateProgressBar(krProgress);

        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `    • *${kr.title}*\n    ${krProgressBar} ${kr.current_value}/${kr.target_value} ${kr.unit} (${krProgress}%)`
          },
          accessory: {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Update'
            },
            action_id: `update_progress_${kr.id}`
          }
        });
      }

      blocks.push({
        type: 'divider'
      });
    }

    return blocks;
  }

  buildTeamOKRsBlocks(teamOKRs) {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🎯 Team OKRs Overview'
        }
      }
    ];

    if (teamOKRs.length === 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'No team objectives found.'
        }
      });
      return blocks;
    }

    for (const objective of teamOKRs) {
      const progress = Math.round(objective.avg_progress || 0);
      const progressBar = this.generateProgressBar(progress);

      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${objective.title}*\nOwner: <@${objective.owner}>\n${progressBar} ${progress}% • ${objective.key_results_count} Key Results`
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Details'
          },
          action_id: `view_objective_${objective.id}`
        }
      });
    }

    return blocks;
  }

  buildOverviewReportBlocks(teamOKRs, userStats) {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📊 OKR Overview Report'
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Your Objectives:*\n${userStats.objectives_count || 0}`
          },
          {
            type: 'mrkdwn',
            text: `*Your Key Results:*\n${userStats.key_results_count || 0}`
          },
          {
            type: 'mrkdwn',
            text: `*Your Avg Progress:*\n${Math.round(userStats.avg_progress || 0)}%`
          },
          {
            type: 'mrkdwn',
            text: `*Total Team Objectives:*\n${teamOKRs.length}`
          }
        ]
      },
      {
        type: 'divider'
      }
    ];

    if (teamOKRs.length > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Top Performing Objectives:*'
        }
      });

      const topObjectives = teamOKRs
        .sort((a, b) => (b.avg_progress || 0) - (a.avg_progress || 0))
        .slice(0, 5);

      for (const obj of topObjectives) {
        const progress = Math.round(obj.avg_progress || 0);
        const progressBar = this.generateProgressBar(progress);
        
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${progressBar} *${obj.title}* (${progress}%)\nOwner: <@${obj.owner}>`
          }
        });
      }
    }

    return blocks;
  }

  buildProgressReportBlocks(progressData) {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📈 Progress Report'
        }
      }
    ];

    for (const data of progressData) {
      const { objective, keyResults, progress } = data;
      const progressBar = this.generateProgressBar(progress);

      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${objective.title}*\n${progressBar} ${progress}% overall\nOwner: <@${objective.owner}> • ${keyResults.length} Key Results`
        }
      });

      // Show individual key result progress
      for (const kr of keyResults) {
        const krProgress = kr.target_value > 0 ? Math.round((kr.current_value / kr.target_value) * 100) : 0;
        const krProgressBar = this.generateProgressBar(krProgress);

        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `    • ${krProgressBar} ${kr.title} (${krProgress}%)\n      ${kr.current_value}/${kr.target_value} ${kr.unit}`
          }
        });
      }

      blocks.push({
        type: 'divider'
      });
    }

    return blocks;
  }

  buildTeamReportBlocks(teamOKRs) {
    return this.buildTeamOKRsBlocks(teamOKRs);
  }

  buildIndividualReportBlocks(objectives, userStats) {
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '👤 Your Individual Report'
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Total Objectives:*\n${userStats.objectives_count || 0}`
          },
          {
            type: 'mrkdwn',
            text: `*Total Key Results:*\n${userStats.key_results_count || 0}`
          },
          {
            type: 'mrkdwn',
            text: `*Average Progress:*\n${Math.round(userStats.avg_progress || 0)}%`
          }
        ]
      },
      {
        type: 'divider'
      }
    ];

    if (objectives.length > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Your Objectives:*'
        }
      });

      for (const obj of objectives) {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `• *${obj.title}* (${obj.quarter})\n  ${obj.description || '_No description_'}`
          },
          accessory: {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Details'
            },
            action_id: `view_objective_${obj.id}`
          }
        });
      }
    }

    return blocks;
  }

  generateProgressBar(percentage) {
    const filled = Math.round(percentage / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }
}

module.exports = UIBuilder;