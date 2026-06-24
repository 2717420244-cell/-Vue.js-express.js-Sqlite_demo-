const Order = require('../models/Order');
const AccountItem = require('../models/AccountItem');
const User = require('../models/User');
const { getDatabase, saveDatabase } = require('../config/database');
const { success, error, paginated } = require('../utils/response');

exports.getList = (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = Order.findByUser(req.user.uid, { page: parseInt(page), limit: parseInt(limit) });
    paginated(res, result.orders, page, limit, result.total);
  } catch (err) { next(err); }
};

exports.getDetail = (req, res, next) => {
  try {
    const order = Order.findById(parseInt(req.params.id));
    if (!order) return error(res, '订单不存在', 404);
    if (order.buyer_id !== req.user.uid && order.seller_id !== req.user.uid) {
      return error(res, '无权查看', 403);
    }
    success(res, order);
  } catch (err) { next(err); }
};

// 创建订单（不扣费，只记录）
exports.create = (req, res, next) => {
  try {
    const { item_id } = req.body;
    const buyer_id = req.user.uid;
    if (!item_id) return error(res, '商品ID不能为空');

    const item = AccountItem.findById(parseInt(item_id));
    if (!item) return error(res, '商品不存在', 404);
    if (item.status !== 1) return error(res, '商品未上架或已售出');
    if (item.seller_id === buyer_id) return error(res, '不能购买自己的商品');

    const db = getDatabase();
    db.run('UPDATE account_items SET status = 2 WHERE item_id = ?', [item.item_id]);
    const order = Order.create({ buyer_id, item_id: parseInt(item_id), amount: item.price });
    saveDatabase();

    success(res, order, '下单成功，请尽快支付');
  } catch (err) { next(err); }
};

// 支付 → 直接扣买家余额
exports.pay = (req, res, next) => {
  try {
    const order = Order.findById(parseInt(req.params.id));
    if (!order) return error(res, '订单不存在', 404);
    if (order.buyer_id !== req.user.uid) return error(res, '无权支付', 403);
    if (order.pay_status !== 0) return error(res, '订单已支付');

    const db = getDatabase();
    const buyer = User.findById(order.buyer_id);

    if ((buyer.balance || 0) < order.amount) {
      return error(res, `余额不足！余额 ¥${(buyer.balance || 0).toFixed(2)}，需支付 ¥${order.amount}`);
    }

    // 扣款
    db.run('UPDATE users SET balance = balance - ? WHERE uid = ?', [order.amount, order.buyer_id]);
    db.run('UPDATE orders SET pay_status = 1 WHERE order_id = ?', [order.order_id]);

    // 流水
    const updatedBuyer = User.findById(order.buyer_id);
    db.run(
      'INSERT INTO transactions (user_id, type, amount, balance_after, related_id, remark) VALUES (?, ?, ?, ?, ?, ?)',
      [order.buyer_id, 'pay', -order.amount, updatedBuyer.balance, order.order_id, `支付: ${order.item_title || ''}`]
    );
    saveDatabase();

    success(res, Order.findById(parseInt(req.params.id)), '支付成功');
  } catch (err) { next(err); }
};

// 确认交付
exports.deliver = (req, res, next) => {
  try {
    const order = Order.findById(parseInt(req.params.id));
    if (!order) return error(res, '订单不存在', 404);
    if (order.seller_id !== req.user.uid) return error(res, '无权交付', 403);
    if (order.pay_status !== 1) return error(res, '订单未支付');
    if (order.delivery_status !== 0) return error(res, '订单已交付');

    const updated = Order.updateDeliveryStatus(parseInt(req.params.id), 1);
    success(res, updated, '交付确认成功');
  } catch (err) { next(err); }
};

// 确认收货 → 转账给卖家
exports.confirm = (req, res, next) => {
  try {
    const order = Order.findById(parseInt(req.params.id));
    if (!order) return error(res, '订单不存在', 404);
    if (order.buyer_id !== req.user.uid) return error(res, '无权确认', 403);
    if (order.delivery_status !== 1) return error(res, '订单未交付');

    const db = getDatabase();

    // 卖家收款
    db.run('UPDATE users SET balance = balance + ? WHERE uid = ?', [order.amount, order.seller_id]);
    const updated = Order.complete(parseInt(req.params.id));

    // 流水
    const seller = User.findById(order.seller_id);
    db.run(
      'INSERT INTO transactions (user_id, type, amount, balance_after, related_id, remark) VALUES (?, ?, ?, ?, ?, ?)',
      [order.seller_id, 'income', order.amount, seller.balance, order.order_id, `售出收入: ${order.item_title || ''}`]
    );
    saveDatabase();

    success(res, updated, `收货确认成功！¥${order.amount} 已转入卖家账户`);
  } catch (err) { next(err); }
};
