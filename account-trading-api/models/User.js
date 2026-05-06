const { getDatabase, saveDatabase } = require('../config/database');

class User {
  // 根据手机号查找用户
  static findByPhone(phone) {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM users WHERE phone = ?');
    stmt.bind([phone]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  // 根据ID查找用户
  static findById(uid) {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM users WHERE uid = ?');
    stmt.bind([uid]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  // 创建用户
  static create({ username, phone, password }) {
    const db = getDatabase();
    db.run(
      'INSERT INTO users (username, phone, password) VALUES (?, ?, ?)',
      [username, phone, password]
    );
    saveDatabase();
    return this.findByPhone(phone);
  }

  // 更新用户信息
  static update(uid, data) {
    const db = getDatabase();
    const fields = [];
    const values = [];

    if (data.username) {
      fields.push('username = ?');
      values.push(data.username);
    }
    if (data.real_name) {
      fields.push('real_name = ?');
      values.push(data.real_name);
    }
    if (data.avatar) {
      fields.push('avatar = ?');
      values.push(data.avatar);
    }

    if (fields.length > 0) {
      values.push(uid);
      db.run(`UPDATE users SET ${fields.join(', ')} WHERE uid = ?`, values);
      saveDatabase();
    }

    return this.findById(uid);
  }

  // 获取用户列表
  static findAll(page = 1, limit = 10, keyword = '') {
    const db = getDatabase();
    let sql = 'SELECT uid, username, phone, real_name, avatar, balance, created_at FROM users';
    const params = [];

    if (keyword) {
      sql += ' WHERE username LIKE ? OR phone LIKE ?';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    sql += ' ORDER BY created_at DESC';

    // 获取总数
    const countSql = sql.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    const countStmt = db.prepare(countSql);
    if (params.length > 0) countStmt.bind(params);
    let total = 0;
    if (countStmt.step()) {
      total = countStmt.getAsObject().total;
    }
    countStmt.free();

    // 分页查询
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const stmt = db.prepare(sql);
    if (params.length > 0) stmt.bind(params);

    const users = [];
    while (stmt.step()) {
      users.push(stmt.getAsObject());
    }
    stmt.free();

    return { users, total };
  }
}

module.exports = User;
