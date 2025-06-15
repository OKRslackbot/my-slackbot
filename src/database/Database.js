const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.dbPath = process.env.NODE_ENV === 'production' 
      ? '/tmp/okr_bot.db' 
      : path.join(__dirname, '../../data/okr_bot.db');
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.createTables();
          resolve();
        }
      });
    });
  }

  createTables() {
    const tables = [
      `CREATE TABLE IF NOT EXISTS objectives (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        owner TEXT NOT NULL,
        owner_name TEXT NOT NULL,
        quarter TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS key_results (
        id TEXT PRIMARY KEY,
        objective_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        owner TEXT NOT NULL,
        owner_name TEXT NOT NULL,
        target_value REAL NOT NULL,
        current_value REAL DEFAULT 0,
        unit TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (objective_id) REFERENCES objectives (id)
      )`,
      `CREATE TABLE IF NOT EXISTS progress_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key_result_id TEXT NOT NULL,
        previous_value REAL,
        new_value REAL NOT NULL,
        comment TEXT,
        updated_by TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (key_result_id) REFERENCES key_results (id)
      )`,
      `CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_type TEXT NOT NULL,
        item_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        role TEXT DEFAULT 'contributor',
        assigned_at TEXT NOT NULL
      )`
    ];

    tables.forEach(sql => {
      this.db.run(sql, (err) => {
        if (err) console.error('Error creating table:', err);
      });
    });
  }

  // Objective methods
  async createObjective(objectiveData) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO objectives (id, title, description, owner, owner_name, quarter, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run([
        objectiveData.id,
        objectiveData.title,
        objectiveData.description,
        objectiveData.owner,
        objectiveData.owner_name,
        objectiveData.quarter,
        objectiveData.status,
        objectiveData.created_at,
        objectiveData.updated_at
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
      
      stmt.finalize();
    });
  }

  async getObjectives(userId = null) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM objectives WHERE status = "active"';
      let params = [];
      
      if (userId) {
        query += ' AND owner = ?';
        params.push(userId);
      }
      
      query += ' ORDER BY created_at DESC';
      
      this.db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async getObjectiveById(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM objectives WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async updateObjective(id, updates) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);
      values.push(new Date().toISOString()); // updated_at
      values.push(id);
      
      const query = `UPDATE objectives SET ${fields}, updated_at = ? WHERE id = ?`;
      
      this.db.run(query, values, function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }

  async deleteObjective(id) {
    return new Promise((resolve, reject) => {
      this.db.run('UPDATE objectives SET status = "deleted" WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }

  // Key Result methods
  async createKeyResult(keyResultData) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO key_results (id, objective_id, title, description, owner, owner_name, target_value, current_value, unit, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run([
        keyResultData.id,
        keyResultData.objective_id,
        keyResultData.title,
        keyResultData.description,
        keyResultData.owner,
        keyResultData.owner_name,
        keyResultData.target_value,
        keyResultData.current_value,
        keyResultData.unit,
        keyResultData.status,
        keyResultData.created_at,
        keyResultData.updated_at
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
      
      stmt.finalize();
    });
  }

  async getKeyResultsByObjective(objectiveId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM key_results WHERE objective_id = ? AND status = "active" ORDER BY created_at ASC',
        [objectiveId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  async getKeyResultById(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM key_results WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async updateKeyResultProgress(keyResultId, newValue, comment, updatedBy) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Get current value
        this.db.get('SELECT current_value FROM key_results WHERE id = ?', [keyResultId], (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          
          const previousValue = row ? row.current_value : 0;
          
          // Update key result
          this.db.run(
            'UPDATE key_results SET current_value = ?, updated_at = ? WHERE id = ?',
            [newValue, new Date().toISOString(), keyResultId],
            function(err) {
              if (err) {
                reject(err);
                return;
              }
            }
          );
          
          // Add to progress history
          this.db.run(
            'INSERT INTO progress_history (key_result_id, previous_value, new_value, comment, updated_by, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
            [keyResultId, previousValue, newValue, comment, updatedBy, new Date().toISOString()],
            function(err) {
              if (err) reject(err);
              else resolve(this.lastID);
            }
          );
        });
      });
    });
  }

  async updateKeyResult(id, updates) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);
      values.push(new Date().toISOString()); // updated_at
      values.push(id);
      
      const query = `UPDATE key_results SET ${fields}, updated_at = ? WHERE id = ?`;
      
      this.db.run(query, values, function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }

  async deleteKeyResult(id) {
    return new Promise((resolve, reject) => {
      this.db.run('UPDATE key_results SET status = "deleted" WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  }

  // Analytics and Reports
  async getTeamOKRs() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          o.*,
          COUNT(kr.id) as key_results_count,
          AVG(CASE WHEN kr.target_value > 0 THEN (kr.current_value / kr.target_value) * 100 ELSE 0 END) as avg_progress
        FROM objectives o
        LEFT JOIN key_results kr ON o.id = kr.objective_id AND kr.status = 'active'
        WHERE o.status = 'active'
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `;
      
      this.db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async getUserStats(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COUNT(DISTINCT o.id) as objectives_count,
          COUNT(DISTINCT kr.id) as key_results_count,
          AVG(CASE WHEN kr.target_value > 0 THEN (kr.current_value / kr.target_value) * 100 ELSE 0 END) as avg_progress
        FROM objectives o
        LEFT JOIN key_results kr ON o.id = kr.objective_id AND kr.status = 'active'
        WHERE o.owner = ? AND o.status = 'active'
      `;
      
      this.db.get(query, [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async getProgressHistory(keyResultId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM progress_history WHERE key_result_id = ? ORDER BY updated_at DESC',
        [keyResultId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  // Assignment methods (for multiple people working on same OKRs)
  async addAssignment(itemType, itemId, userId, userName, role = 'contributor') {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO assignments (item_type, item_id, user_id, user_name, role, assigned_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run([
        itemType,
        itemId,
        userId,
        userName,
        role,
        new Date().toISOString()
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
      
      stmt.finalize();
    });
  }

  async getAssignments(itemType, itemId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM assignments WHERE item_type = ? AND item_id = ? ORDER BY assigned_at ASC',
        [itemType, itemId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  async removeAssignment(itemType, itemId, userId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM assignments WHERE item_type = ? AND item_id = ? AND user_id = ?',
        [itemType, itemId, userId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  // Utility methods
  async getOKRsByQuarter(quarter) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          o.*,
          COUNT(kr.id) as key_results_count,
          AVG(CASE WHEN kr.target_value > 0 THEN (kr.current_value / kr.target_value) * 100 ELSE 0 END) as avg_progress
        FROM objectives o
        LEFT JOIN key_results kr ON o.id = kr.objective_id AND kr.status = 'active'
        WHERE o.quarter = ? AND o.status = 'active'
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `;
      
      this.db.all(query, [quarter], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async searchOKRs(searchTerm) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          'objective' as type,
          id,
          title,
          description,
          owner,
          owner_name,
          quarter,
          created_at
        FROM objectives 
        WHERE (title LIKE ? OR description LIKE ?) AND status = 'active'
        UNION
        SELECT 
          'key_result' as type,
          id,
          title,
          description,
          owner,
          owner_name,
          '' as quarter,
          created_at
        FROM key_results 
        WHERE (title LIKE ? OR description LIKE ?) AND status = 'active'
        ORDER BY created_at DESC
      `;
      
      const searchPattern = `%${searchTerm}%`;
      this.db.all(query, [searchPattern, searchPattern, searchPattern, searchPattern], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = Database;