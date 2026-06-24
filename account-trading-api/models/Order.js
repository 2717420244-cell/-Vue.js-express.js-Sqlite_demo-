const { getDatabase, saveDatabase } = require('../config/database');

class Order {
  // 根据ID查找订单
  static findById(orderId) {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT o.*, ai.title as item_title, ai.price as item_price,
             ai.seller_id, u.username as buyer_name, u2.username as seller_name
      FROM orders o
      LEFT JOIN account_items ai ON o.item_id = ai.item_id
      LEFT JOIN users u ON o.buyer_id = u.uid
      LEFT JOIN users u2 ON ai.seller_id = u2.uid
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
             ai.seller_id, u.username as buyer_name, u2.username as seller_name
      FROM orders o
      LEFT JOIN account_items ai ON o.item_id = ai.item_id
      LEFT JOIN users u ON o.buyer_id = u.uid
      LEFT JOIN users u2 ON ai.seller_id = u2.uid
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

  // 取消过期未支付订单
  static cancelExpired() {
    const db = getDatabase();
    return new Promise((resolve) => {
      const cutoff = new Date(Date.now() - 2 * 60 * 1000); // 2分钟前
      // 用本地时间，和数据库存储格式一致
      const pad = n => String(n).padStart(2, '0');
      const ts = `${cutoff.getFullYear()}-${pad(cutoff.getMonth() + 1)}-${pad(cutoff.getDate())} ${pad(cutoff.getHours())}:${pad(cutoff.getMinutes())}:${pad(cutoff.getSeconds())}`;

      // 只查未支付且未被取消的订单
      const stmt = db.prepare(
        "SELECT * FROM orders WHERE pay_status = 0 AND delivery_status = 0 AND create_time < ?"
      );
      stmt.bind([ts]);
      const expired = [];
      while (stmt.step()) expired.push(stmt.getAsObject());
      stmt.free();

      expired.forEach(o => {
        db.run("UPDATE orders SET delivery_status = -1, finish_time = CURRENT_TIMESTAMP WHERE order_id = ?", [o.order_id]);
        db.run("UPDATE account_items SET status = 1 WHERE item_id = ?", [o.item_id]);
      });

      if (expired.length > 0) {
        console.log(`[定时任务] ${new Date().toLocaleTimeString()} — 清理了 ${expired.length} 条过期订单`);
        saveDatabase();
      }
      resolve(expired);
    });
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
