const Order = require('../models/Order');
const AccountItem = require('../models/AccountItem');
const User = require('../models/User');
const { getDatabase, saveDatabase } = require('../config/database');
const { success, error, paginated } = require('../utils/response');

// 获取订单列表
exports.getList = (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const result = Order.findByUser(req.user.uid, {
      page: parseInt(page), limit: parseInt(limit),
      status: status !== undefined ? parseInt(status) : undefined
    });
    paginated(res, result.orders, page, limit, result.total);
  } catch (err) { next(err); }
};

// 获取订单详情
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

// 创建订单 → 立即冻结买家余额
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
    const buyer = User.findById(buyer_id);
    const available = (buyer.balance || 0) - (buyer.frozen || 0);

    if (available < item.price) {
      return error(res, `余额不足！可用余额 ¥${available.toFixed(2)}，商品价格 ¥${item.price}`);
    }

    // 冻结买家余额
    db.run('UPDATE users SET frozen = frozen + ? WHERE uid = ?', [item.price, buyer_id]);
    // 更新商品状态
    db.run('UPDATE account_items SET status = 2 WHERE item_id = ?', [item.item_id]);

    // 创建订单
    const order = Order.create({ buyer_id, item_id: parseInt(item_id), amount: item.price });

    // 记录交易流水
    const updatedBuyer = User.findById(buyer_id);
    db.run(
      'INSERT INTO transactions (user_id, type, amount, balance_after, related_id, remark) VALUES (?, ?, ?, ?, ?, ?)',
      [buyer_id, 'freeze', -item.price, updatedBuyer.balance, order.order_id, `下单冻结: ${item.title}`]
    );
    saveDatabase();

    success(res, order, '下单成功，已冻结余额');
  } catch (err) { next(err); }
};

// 订单支付（钱已冻结，这里仅确认支付状态）
exports.pay = (req, res, next) => {
  try {
    const order = Order.findById(parseInt(req.params.id));
    if (!order) return error(res, '订单不存在', 404);
    if (order.buyer_id !== req.user.uid) return error(res, '无权支付', 403);
    if (order.pay_status !== 0) return error(res, '订单已支付');

    const updated = Order.updatePayStatus(parseInt(req.params.id), 1);
    success(res, updated, '支付成功');
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

// 确认收货 → 解冻并转账给卖家
exports.confirm = (req, res, next) => {
  try {
    const order = Order.findById(parseInt(req.params.id));
    if (!order) return error(res, '订单不存在', 404);
    if (order.buyer_id !== req.user.uid) return error(res, '无权确认', 403);
    if (order.delivery_status !== 1) return error(res, '订单未交付');

    const db = getDatabase();

    // 解冻买家余额 + 扣款
    db.run('UPDATE users SET frozen = frozen - ? WHERE uid = ?', [order.amount, order.buyer_id]);
    db.run('UPDATE users SET balance = balance - ? WHERE uid = ?', [order.amount, order.buyer_id]);

    // 卖家收款
    db.run('UPDATE users SET balance = balance + ? WHERE uid = ?', [order.amount, order.seller_id]);

    // 完成订单
    const updated = Order.complete(parseInt(req.params.id));

    // 流水记录
    const buyer = User.findById(order.buyer_id);
    const seller = User.findById(order.seller_id);
    db.run(
      'INSERT INTO transactions (user_id, type, amount, balance_after, related_id, remark) VALUES (?, ?, ?, ?, ?, ?)',
      [order.buyer_id, 'pay', -order.amount, buyer.balance, order.order_id, `支付完成: ${order.item_title}`]
    );
    db.run(
      'INSERT INTO transactions (user_id, type, amount, balance_after, related_id, remark) VALUES (?, ?, ?, ?, ?, ?)',
      [order.seller_id, 'income', order.amount, seller.balance, order.order_id, `售出收入: ${order.item_title}`]
    );
    saveDatabase();

    success(res, updated, `收货确认成功！¥${order.amount} 已转入卖家账户`);
  } catch (err) { next(err); }
};
