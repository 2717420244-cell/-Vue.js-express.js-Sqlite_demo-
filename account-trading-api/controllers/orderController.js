const Order = require('../models/Order');
const AccountItem = require('../models/AccountItem');
const { success, error, paginated } = require('../utils/response');

// 获取订单列表
exports.getList = (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const result = Order.findByUser(req.user.uid, {
      page: parseInt(page),
      limit: parseInt(limit),
      status: status !== undefined ? parseInt(status) : undefined
    });

    paginated(res, result.orders, page, limit, result.total);
  } catch (err) {
    next(err);
  }
};

// 获取订单详情
exports.getDetail = (req, res, next) => {
  try {
    const { id } = req.params;
    const order = Order.findById(parseInt(id));

    if (!order) {
      return error(res, '订单不存在', 404);
    }

    // 检查权限（买家或卖家才能查看）
    if (order.buyer_id !== req.user.uid && order.seller_id !== req.user.uid) {
      return error(res, '无权查看此订单', 403);
    }

    success(res, order);
  } catch (err) {
    next(err);
  }
};

// 创建订单
exports.create = (req, res, next) => {
  try {
    const { item_id } = req.body;
    const buyer_id = req.user.uid;

    // 参数验证
    if (!item_id) {
      return error(res, '商品ID不能为空');
    }

    // 查询商品信息
    const item = AccountItem.findById(parseInt(item_id));
    if (!item) {
      return error(res, '商品不存在', 404);
    }

    // 检查商品状态（必须是上架状态）
    if (item.status !== 1) {
      return error(res, '商品未上架或已售出');
    }

    // 不能购买自己的商品
    if (item.seller_id === buyer_id) {
      return error(res, '不能购买自己的商品');
    }

    // 创建订单
    const order = Order.create({
      buyer_id,
      item_id: parseInt(item_id),
      amount: item.price
    });

    // 更新商品状态为已售
    AccountItem.update(parseInt(item_id), { status: 2 });

    success(res, order, '订单创建成功');
  } catch (err) {
    next(err);
  }
};

// 订单支付
exports.pay = (req, res, next) => {
  try {
    const { id } = req.params;
    const order = Order.findById(parseInt(id));

    if (!order) {
      return error(res, '订单不存在', 404);
    }

    // 检查权限（只有买家能支付）
    if (order.buyer_id !== req.user.uid) {
      return error(res, '无权支付此订单', 403);
    }

    // 检查订单状态
    if (order.pay_status !== 0) {
      return error(res, '订单已支付或已退款');
    }

    // 更新支付状态
    const updatedOrder = Order.updatePayStatus(parseInt(id), 1);
    success(res, updatedOrder, '支付成功');
  } catch (err) {
    next(err);
  }
};

// 确认交付
exports.deliver = (req, res, next) => {
  try {
    const { id } = req.params;
    const { account_info } = req.body;
    const order = Order.findById(parseInt(id));

    if (!order) {
      return error(res, '订单不存在', 404);
    }

    // 检查权限（只有卖家能交付）
    if (order.seller_id !== req.user.uid) {
      return error(res, '无权交付此订单', 403);
    }

    // 检查订单状态
    if (order.pay_status !== 1) {
      return error(res, '订单未支付');
    }
    if (order.delivery_status !== 0) {
      return error(res, '订单已交付');
    }

    // 更新交付状态
    const updatedOrder = Order.updateDeliveryStatus(parseInt(id), 1);
    success(res, updatedOrder, '交付确认成功');
  } catch (err) {
    next(err);
  }
};

// 确认收货
exports.confirm = (req, res, next) => {
  try {
    const { id } = req.params;
    const order = Order.findById(parseInt(id));

    if (!order) {
      return error(res, '订单不存在', 404);
    }

    // 检查权限（只有买家能确认收货）
    if (order.buyer_id !== req.user.uid) {
      return error(res, '无权确认此订单', 403);
    }

    // 检查订单状态
    if (order.delivery_status !== 1) {
      return error(res, '订单未交付');
    }

    // 完成订单
    const updatedOrder = Order.complete(parseInt(id));
    success(res, updatedOrder, '确认收货成功');
  } catch (err) {
    next(err);
  }
};
