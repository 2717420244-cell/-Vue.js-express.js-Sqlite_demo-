const { getDatabase, saveDatabase } = require('../config/database');

class User {
  static findByPhone(phone) {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM users WHERE phone = ?');
    stmt.bind([phone]);
    let row = null;
    if (stmt.step()) { row = stmt.getAsObject(); }
    stmt.free();
    return row;
  }

  static findById(uid) {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM users WHERE uid = ?');
    stmt.bind([uid]);
    let row = null;
    if (stmt.step()) { row = stmt.getAsObject(); }
    stmt.free();
    return row;
  }

  static create({ username, phone, password }) {
    const db = getDatabase();
    db.run(
      'INSERT INTO users (username, phone, password) VALUES (?, ?, ?)',
      [username, phone, password]
    );
    saveDatabase();
    return this.findByPhone(phone);
  }

  static update(uid, data) {
    const db = getDatabase();
    const fields = [];
    const values = [];

    if (data.username) { fields.push('username = ?'); values.push(data.username); }
    if (data.real_name !== undefined) { fields.push('real_name = ?'); values.push(data.real_name); }
    if (data.avatar !== undefined) { fields.push('avatar = ?'); values.push(data.avatar); }

    if (fields.length > 0) {
      values.push(uid);
      db.run(`UPDATE users SET ${fields.join(', ')} WHERE uid = ?`, values);
      saveDatabase();
    }
    return this.findById(uid);
  }

  // 设置用户角色
  static setRole(uid, role) {
    const db = getDatabase();
    db.run('UPDATE users SET role = ? WHERE uid = ?', [role, uid]);
    saveDatabase();
    return this.findById(uid);
  }

  static findAll(page = 1, limit = 10, keyword = '') {
    const db = getDatabase();
    let sql = 'SELECT uid, username, phone, role, real_name, avatar, balance, created_at FROM users';
    const params = [];
    if (keyword) {
      sql += ' WHERE username LIKE ? OR phone LIKE ?';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    sql += ' ORDER BY created_at DESC';

    const countSql = sql.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    const countStmt = db.prepare(countSql);
    if (params.length > 0) countStmt.bind(params);
    let total = 0;
    if (countStmt.step()) { total = countStmt.getAsObject().total; }
    countStmt.free();

    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const stmt = db.prepare(sql);
    if (params.length > 0) stmt.bind(params);
    const users = [];
    while (stmt.step()) { users.push(stmt.getAsObject()); }
    stmt.free();
    return { users, total };
  }
}

module.exports = User;
