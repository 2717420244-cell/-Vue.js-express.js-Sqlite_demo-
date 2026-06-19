const AccountItem = require('../models/AccountItem');
const User = require('../models/User');
const { success, error, paginated } = require('../utils/response');

// 获取待审核商品列表
exports.getAudits = (req, res, next) => {
  try {
    const { page = 1, limit = 10, keyword } = req.query;
    const result = AccountItem.findAll({
      page: parseInt(page), limit: parseInt(limit), keyword, status: 0
    });
    paginated(res, result.items, page, limit, result.total);
  } catch (err) { next(err); }
};

// 审核商品（通过/拒绝）
exports.auditItem = (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      return error(res, 'action 必须是 approve 或 reject');
    }
    const item = AccountItem.findById(parseInt(id));
    if (!item) return error(res, '商品不存在', 404);
    if (item.status !== 0) return error(res, '该商品不是待审核状态');

    const newStatus = action === 'approve' ? 1 : 3;
    const updated = AccountItem.update(parseInt(id), { status: newStatus });
    const msg = action === 'approve' ? '审核通过，已上架' : '审核不通过，已下架';
    success(res, updated, msg);
  } catch (err) { next(err); }
};

// 全部商品（管理员视角）
exports.getAllItems = (req, res, next) => {
  try {
    const { page = 1, limit = 10, keyword, status } = req.query;
    const result = AccountItem.findAll({
      page: parseInt(page), limit: parseInt(limit), keyword,
      status: status !== undefined ? parseInt(status) : undefined
    });
    paginated(res, result.items, page, limit, result.total);
  } catch (err) { next(err); }
};

// 用户列表
exports.getUsers = (req, res, next) => {
  try {
    const { page = 1, limit = 10, keyword } = req.query;
    const result = User.findAll(parseInt(page), parseInt(limit), keyword);
    paginated(res, result.users, page, limit, result.total);
  } catch (err) { next(err); }
};

// 切换用户角色（权限分层）
exports.setUserRole = (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const operatorRole = req.user.role;  // 操作者的角色

    if (!['admin', 'user', 'super_admin'].includes(role)) {
      return error(res, '角色无效');
    }

    const target = User.findById(parseInt(id));
    if (!target) return error(res, '用户不存在', 404);
    if (target.uid === req.user.uid) return error(res, '不能修改自己的角色');

    // 超级管理员唯一且不可变动：不能被修改，也不能把别人设为超级管理员
    if (target.role === 'super_admin') {
      return error(res, '超级管理员不可被修改');
    }
    if (role === 'super_admin') {
      return error(res, '超级管理员只能有一个，不能新增');
    }

    // 普通管理员不能操作其他管理员，也不能提升他人
    if (operatorRole === 'admin') {
      if (target.role === 'admin') return error(res, '管理员之间不能互相修改');
      if (role === 'admin') return error(res, '管理员不能提升其他人为管理员');
    }

    const updated = User.setRole(parseInt(id), role);
    const label = role === 'admin' ? '管理员' : '普通用户';
    success(res, updated, `已将「${updated.username}」设为${label}`);
  } catch (err) { next(err); }
};

// 删除用户（权限分层）
exports.deleteUser = (req, res, next) => {
  try {
    const { id } = req.params;
    const operatorRole = req.user.role;

    const target = User.findById(parseInt(id));
    if (!target) return error(res, '用户不存在', 404);
    if (target.uid === req.user.uid) return error(res, '不能删除自己');

    // 超级管理员不可被删除
    if (target.role === 'super_admin') {
      return error(res, '超级管理员不可被删除');
    }
    // 普通管理员不能删除其他管理员
    if (operatorRole === 'admin' && target.role === 'admin') {
      return error(res, '管理员之间不能互相删除');
    }

    User.delete(parseInt(id));
    success(res, null, `已删除用户「${target.username}」`);
  } catch (err) { next(err); }
};
