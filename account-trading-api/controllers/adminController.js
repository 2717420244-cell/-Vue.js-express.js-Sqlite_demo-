const AccountItem = require('../models/AccountItem');
const User = require('../models/User');
const { success, error, paginated } = require('../utils/response');

// 获取待审核商品列表
exports.getAudits = (req, res, next) => {
  try {
    const { page = 1, limit = 10, keyword } = req.query;
    const result = AccountItem.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      keyword,
      status: 0  // 只查待审核
    });
    paginated(res, result.items, page, limit, result.total);
  } catch (err) {
    next(err);
  }
};

// 审核商品（通过/拒绝）
exports.auditItem = (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body;  // 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return error(res, 'action 必须是 approve 或 reject');
    }

    const item = AccountItem.findById(parseInt(id));
    if (!item) {
      return error(res, '商品不存在', 404);
    }

    if (item.status !== 0) {
      return error(res, '该商品不是待审核状态');
    }

    const newStatus = action === 'approve' ? 1 : 3;
    const updated = AccountItem.update(parseInt(id), { status: newStatus });
    const msg = action === 'approve' ? '审核通过，已上架' : '审核不通过，已下架';
    success(res, updated, msg);
  } catch (err) {
    next(err);
  }
};

// 获取全部商品（管理员视角，可看所有状态）
exports.getAllItems = (req, res, next) => {
  try {
    const { page = 1, limit = 10, keyword, status } = req.query;
    const result = AccountItem.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      keyword,
      status: status !== undefined ? parseInt(status) : undefined
    });
    paginated(res, result.items, page, limit, result.total);
  } catch (err) {
    next(err);
  }
};

// 获取用户列表
exports.getUsers = (req, res, next) => {
  try {
    const { page = 1, limit = 10, keyword } = req.query;
    const result = User.findAll(parseInt(page), parseInt(limit), keyword);
    paginated(res, result.users, page, limit, result.total);
  } catch (err) {
    next(err);
  }
};
