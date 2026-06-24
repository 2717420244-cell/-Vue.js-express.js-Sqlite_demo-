const { getDatabase, saveDatabase } = require('../config/database');
const User = require('../models/User');
const { success, error, paginated } = require('../utils/response');

// 获取余额
exports.getBalance = (req, res) => {
  const user = User.findById(req.user.uid);
  success(res, { balance: user.balance || 0 });
};

// 充值（模拟）
exports.recharge = (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return error(res, '充值金额必须大于 0');
    const amt = parseFloat(amount);
    if (amt > 10000) return error(res, '单次充值不能超过 10000 元');

    const db = getDatabase();
    const user = User.findById(req.user.uid);

    db.run('UPDATE users SET balance = balance + ? WHERE uid = ?', [amt, user.uid]);
    const updated = User.findById(req.user.uid);

    // 记录交易
    db.run(
      'INSERT INTO transactions (user_id, type, amount, balance_after, remark) VALUES (?, ?, ?, ?, ?)',
      [user.uid, 'recharge', amt, updated.balance, `模拟充值 ¥${amt}`]
    );
    saveDatabase();

    success(res, { balance: updated.balance }, `充值成功，当前余额 ¥${updated.balance}`);
  } catch (err) { next(err); }
};

// 交易记录
exports.getTransactions = (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const db = getDatabase();
    const userId = req.user.uid;

    const countStmt = db.prepare('SELECT COUNT(*) as total FROM transactions WHERE user_id = ?');
    countStmt.bind([userId]);
    let total = 0;
    if (countStmt.step()) total = countStmt.getAsObject().total;
    countStmt.free();

    const stmt = db.prepare(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
    );
    stmt.bind([userId, parseInt(limit), (parseInt(page) - 1) * parseInt(limit)]);
    const txs = [];
    while (stmt.step()) txs.push(stmt.getAsObject());
    stmt.free();

    paginated(res, txs, page, limit, total);
  } catch (err) { next(err); }
};
