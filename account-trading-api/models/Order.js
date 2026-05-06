const { getDatabase, saveDatabase } = require('../config/database');

class Order {
  // 根据ID查找订单
  static findById(orderId) {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT o.*, ai.title as item_title, ai.price as item_price,
             u.username as buyer_name, u2.username as seller_name
      FROM orders o
      JOIN account_items ai ON o.item_id = ai.item_id
      JOIN users u ON o.buyer_id = u.uid
      JOIN users u2 ON ai.seller_id = u2.uid
      WHERE o.order_id = ?
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

  // 获取用户的订单列表
  static findByUser(userId, { page = 1, limit = 10, status }) {
    const db = getDatabase();
    let sql = `
      SELECT o.*, ai.title as item_title, ai.price as item_price,
             u.username as buyer_name, u2.username as seller_name
      FROM orders o
      JOIN account_items ai ON o.item_id = ai.item_id
      JOIN users u ON o.buyer_id = u.uid
      JOIN users u2 ON ai.seller_id = u2.uid
      WHERE (o.buyer_id = ? OR ai.seller_id = ?)
    `;
    const params = [userId, userId];

    if (status !== undefined) {
      sql += ' AND o.pay_status = ?';
      params.push(status);
    }

    sql += ' ORDER BY o.create_time DESC';

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

    const orders = [];
    while (stmt.step()) {
      orders.push(stmt.getAsObject());
    }
    stmt.free();

    return { orders, total };
  }

  // 创建订单
  static create({ buyer_id, item_id, amount }) {
    const db = getDatabase();
    db.run(
      'INSERT INTO orders (buyer_id, item_id, amount) VALUES (?, ?, ?)',
      [buyer_id, item_id, amount]
    );
    saveDatabase();

    // 获取刚插入的订单
    const stmt = db.prepare('SELECT * FROM orders WHERE buyer_id = ? ORDER BY order_id DESC LIMIT 1');
    stmt.bind([buyer_id]);
    let order = null;
    if (stmt.step()) {
      order = stmt.getAsObject();
    }
    stmt.free();
    return order;
  }

  // 更新订单支付状态
  static updatePayStatus(orderId, payStatus) {
    const db = getDatabase();
    db.run('UPDATE orders SET pay_status = ? WHERE order_id = ?', [payStatus, orderId]);
    saveDatabase();
    return this.findById(orderId);
  }

  // 更新交付状态
  static updateDeliveryStatus(orderId, deliveryStatus) {
    const db = getDatabase();
    db.run('UPDATE orders SET delivery_status = ? WHERE order_id = ?', [deliveryStatus, orderId]);
    saveDatabase();
    return this.findById(orderId);
  }

  // 完成订单
  static complete(orderId) {
    const db = getDatabase();
    db.run(
      'UPDATE orders SET finish_time = CURRENT_TIMESTAMP, delivery_status = 2 WHERE order_id = ?',
      [orderId]
    );
    saveDatabase();
    return this.findById(orderId);
  }

  // 获取订单统计
  static getStats() {
    const db = getDatabase();
    const stats = {};

    // 总订单数
    let stmt = db.prepare('SELECT COUNT(*) as total FROM orders');
    if (stmt.step()) stats.totalOrders = stmt.getAsObject().total;
    stmt.free();

    // 待支付订单数
    stmt = db.prepare('SELECT COUNT(*) as total FROM orders WHERE pay_status = 0');
    if (stmt.step()) stats.pendingPayment = stmt.getAsObject().total;
    stmt.free();

    // 已完成订单数
    stmt = db.prepare('SELECT COUNT(*) as total FROM orders WHERE pay_status = 1 AND delivery_status = 2');
    if (stmt.step()) stats.completedOrders = stmt.getAsObject().total;
    stmt.free();

    // 总交易金额
    stmt = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM orders WHERE pay_status = 1');
    if (stmt.step()) stats.totalAmount = stmt.getAsObject().total;
    stmt.free();

    return stats;
  }
}

module.exports = Order;
