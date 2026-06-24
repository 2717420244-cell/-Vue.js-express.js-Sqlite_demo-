const AccountItem = require('../models/AccountItem');
const { success, error, paginated } = require('../utils/response');

// 获取商品列表
exports.getList = (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, keyword, status, seller_id } = req.query;
    const result = AccountItem.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      keyword,
      status: status !== undefined ? parseInt(status) : undefined,
      seller_id: seller_id ? parseInt(seller_id) : undefined
    });

    paginated(res, result.items, page, limit, result.total);
  } catch (err) {
    next(err);
  }
};

// 获取商品详情
exports.getDetail = (req, res, next) => {
  try {
    const { id } = req.params;
    const item = AccountItem.findById(parseInt(id));

    if (!item) {
      return error(res, '商品不存在', 404);
    }

    // 增加浏览量
    AccountItem.incrementViews(parseInt(id));

    success(res, item);
  } catch (err) {
    next(err);
  }
};

// 创建商品
exports.create = (req, res, next) => {
  try {
    const { title, category, price, description, images } = req.body;
    const seller_id = req.user.uid;

    // 参数验证
    if (!title || !category || !price) {
      return error(res, '标题、分类和价格不能为空');
    }

    // 超级管理员发布无需审核，直接上架
    const sellerRole = req.user.role || 'user';
    const initialStatus = sellerRole === 'super_admin' ? 1 : 0;

    const item = AccountItem.create({
      seller_id,
      title,
      category,
      price: parseFloat(price),
      description,
      images,
      status: initialStatus
    });

    const msg = initialStatus === 1 ? '发布成功（管理员免审核，已自动上架）' : '商品发布成功，等待审核';
    success(res, item, msg);
  } catch (err) {
    next(err);
  }
};

// 更新商品
exports.update = (req, res, next) => {
  try {
    const { id } = req.params;
    const item = AccountItem.findById(parseInt(id));

    if (!item) {
      return error(res, '商品不存在', 404);
    }

    // 检查是否是商品所有者
    if (item.seller_id !== req.user.uid) {
      return error(res, '无权修改此商品', 403);
    }

    const updatedItem = AccountItem.update(parseInt(id), req.body);
    success(res, updatedItem, '商品更新成功');
  } catch (err) {
    next(err);
  }
};

// 删除商品
exports.delete = (req, res, next) => {
  try {
    const { id } = req.params;
    const item = AccountItem.findById(parseInt(id));

    if (!item) {
      return error(res, '商品不存在', 404);
    }

    // 检查是否是商品所有者
    if (item.seller_id !== req.user.uid) {
      return error(res, '无权删除此商品', 403);
    }

    AccountItem.delete(parseInt(id));
    success(res, null, '商品删除成功');
  } catch (err) {
    next(err);
  }
};

// 更新商品状态
exports.updateStatus = (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const item = AccountItem.findById(parseInt(id));

    if (!item) {
      return error(res, '商品不存在', 404);
    }

    // 检查是否是商品所有者
    if (item.seller_id !== req.user.uid) {
      return error(res, '无权修改此商品', 403);
    }

    const updatedItem = AccountItem.update(parseInt(id), { status: parseInt(status) });
    success(res, updatedItem, '商品状态更新成功');
  } catch (err) {
    next(err);
  }
};
