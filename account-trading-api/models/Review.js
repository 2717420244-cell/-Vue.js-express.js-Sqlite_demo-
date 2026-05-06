const { getDatabase, saveDatabase } = require('../config/database');

class Review {
  // 根据订单ID查找评价
  static findByOrderId(orderId) {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT r.*, u.username as reviewer_name
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.uid
      WHERE r.order_id = ?
    `);
    stmt.bind([orderId]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  // 获取商品的评价列表
  static findByItemId(itemId, { page = 1, limit = 10 }) {
    const db = getDatabase();
    let sql = `
      SELECT r.*, u.username as reviewer_name
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.uid
      JOIN orders o ON r.order_id = o.order_id
      WHERE o.item_id = ?
      ORDER BY r.created_at DESC
    `;
    const params = [itemId];

    // 获取总数
    const countSql = 'SELECT COUNT(*) as total FROM reviews r JOIN orders o ON r.order_id = o.order_id WHERE o.item_id = ?';
    const countStmt = db.prepare(countSql);
    countStmt.bind([itemId]);
    let total = 0;
    if (countStmt.step()) {
      total = countStmt.getAsObject().total;
    }
    countStmt.free();

    // 分页查询
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const stmt = db.prepare(sql);
    stmt.bind(params);

    const reviews = [];
    while (stmt.step()) {
      reviews.push(stmt.getAsObject());
    }
    stmt.free();

    return { reviews, total };
  }

  // 创建评价
  static create({ order_id, reviewer_id, rating, comment }) {
    const db = getDatabase();
    db.run(
      'INSERT INTO reviews (order_id, reviewer_id, rating, comment) VALUES (?, ?, ?, ?)',
      [order_id, reviewer_id, rating, comment]
    );
    saveDatabase();

    // 获取刚插入的评价
    const stmt = db.prepare('SELECT * FROM reviews WHERE order_id = ? AND reviewer_id = ?');
    stmt.bind([order_id, reviewer_id]);
    let review = null;
    if (stmt.step()) {
      review = stmt.getAsObject();
    }
    stmt.free();
    return review;
  }

  // 检查用户是否已评价订单
  static hasReviewed(orderId, reviewerId) {
    const db = getDatabase();
    const stmt = db.prepare('SELECT COUNT(*) as count FROM reviews WHERE order_id = ? AND reviewer_id = ?');
    stmt.bind([orderId, reviewerId]);
    let count = 0;
    if (stmt.step()) {
      count = stmt.getAsObject().count;
    }
    stmt.free();
    return count > 0;
  }
}

module.exports = Review;
