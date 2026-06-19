const { verifyToken } = require('../utils/token');
const User = require('../models/User');
const { error } = require('../utils/response');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, '未提供认证令牌', 401);
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return error(res, '令牌无效或已过期', 401);
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch (err) { /* ignore */ }
  }
  next();
}

// 管理员及以上（admin 或 super_admin）
function adminMiddleware(req, res, next) {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
    return error(res, '需要管理员权限', 403);
  }
  next();
}

// 仅超级管理员
function superAdminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'super_admin') {
    return error(res, '仅超级管理员可执行此操作', 403);
  }
  next();
}

module.exports = { authMiddleware, optionalAuth, adminMiddleware, superAdminOnly };
