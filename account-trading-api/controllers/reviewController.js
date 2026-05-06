const Review = require('../models/Review');
const Order = require('../models/Order');
const { success, error, paginated } = require('../utils/response');

// 获取商品评价列表
exports.getList = (req, res, next) => {
  try {
    const { item_id, page = 1, limit = 10 } = req.query;

    if (!item_id) {
      return error(res, '商品ID不能为空');
    }

    const result = Review.findByItemId(parseInt(item_id), {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    paginated(res, result.reviews, page, limit, result.total);
  } catch (err) {
    next(err);
  }
};

// 提交评价
exports.create = (req, res, next) => {
  try {
    const { order_id, rating, comment } = req.body;
    const reviewer_id = req.user.uid;

    // 参数验证
    if (!order_id || !rating) {
      return error(res, '订单ID和评分不能为空');
    }

    // 验证评分范围
    if (rating < 1 || rating > 5) {
      return error(res, '评分必须在1-5之间');
    }

    // 查询订单
    const order = Order.findById(parseInt(order_id));
    if (!order) {
      return error(res, '订单不存在', 404);
    }

    // 检查权限（只有买家能评价）
    if (order.buyer_id !== reviewer_id) {
      return error(res, '无权评价此订单', 403);
    }

    // 检查订单状态（必须是已完成）
    if (order.delivery_status !== 2) {
      return error(res, '订单未完成，不能评价');
    }

    // 检查是否已评价
    if (Review.hasReviewed(parseInt(order_id), reviewer_id)) {
      return error(res, '已评价过此订单');
    }

    // 创建评价
    const review = Review.create({
      order_id: parseInt(order_id),
      reviewer_id,
      rating: parseInt(rating),
      comment
    });

    success(res, review, '评价提交成功');
  } catch (err) {
    next(err);
  }
};
