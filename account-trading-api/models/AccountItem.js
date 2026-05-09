const { getDatabase, saveDatabase } = require('../config/database');

class AccountItem {
  // 根据ID查找商品
  static findById(itemId) {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT ai.*, u.username as seller_name
      FROM account_items ai
      JOIN users u ON ai.seller_id = u.uid
      WHERE ai.item_id = ?
    `);
    stmt.bind([itemId]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  // 获取商品列表
  static findAll({ page = 1, limit = 10, category, keyword, status }) {
    const db = getDatabase();
    let sql = 'SELECT ai.*, u.username as seller_name FROM account_items ai JOIN users u ON ai.seller_id = u.uid WHERE 1=1';
    const params = [];

    if (category) {
      sql += ' AND ai.category = ?';
      params.push(category);
    }
    if (keyword) {
      sql += ' AND ai.title LIKE ?';
      params.push(`%${keyword}%`);
    }
    if (status !== undefined) {
      sql += ' AND ai.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY ai.created_at DESC';

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

    const items = [];
    while (stmt.step()) {
      items.push(stmt.getAsObject());
    }
    stmt.free();

    return { items, total };
  }

  // 创建商品
  static create({ seller_id, title, category, price, description, images }) {
    const db = getDatabase();
    db.run(
      'INSERT INTO account_items (seller_id, title, category, price, description, images) VALUES (?, ?, ?, ?, ?, ?)',
      [seller_id, title, category, price, description || null, images ? JSON.stringify(images) : null]
    );
    saveDatabase();

    // 获取刚插入的商品
    const stmt = db.prepare('SELECT * FROM account_items WHERE seller_id = ? ORDER BY item_id DESC LIMIT 1');
    stmt.bind([seller_id]);
    let item = null;
    if (stmt.step()) {
      item = stmt.getAsObject();
    }
    stmt.free();
    return item;
  }

  // 更新商品
  static update(itemId, data) {
    const db = getDatabase();
    const fields = [];
    const values = [];

    if (data.title) {
      fields.push('title = ?');
      values.push(data.title);
    }
    if (data.category) {
      fields.push('category = ?');
      values.push(data.category);
    }
    if (data.price) {
      fields.push('price = ?');
      values.push(data.price);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.images) {
      fields.push('images = ?');
      values.push(JSON.stringify(data.images));
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }

    if (fields.length > 0) {
      values.push(itemId);
      db.run(`UPDATE account_items SET ${fields.join(', ')} WHERE item_id = ?`, values);
      saveDatabase();
    }

    return this.findById(itemId);
  }

  // 增加浏览量
  static incrementViews(itemId) {
    const db = getDatabase();
    db.run('UPDATE account_items SET views = views + 1 WHERE item_id = ?', [itemId]);
    saveDatabase();
  }

  // 删除商品
  static delete(itemId) {
    const db = getDatabase();
    db.run('DELETE FROM account_items WHERE item_id = ?', [itemId]);
    saveDatabase();
  }
}

module.exports = AccountItem;
