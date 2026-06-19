const { verifyToken } = require('../utils/token');
const { error } = require('../utils/response');

// JWT认证中间件
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

// 可选认证中间件（不强制要求登录）
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch (err) {
      // Token无效但不阻止请求
    }
  }
  next();
}

// 管理员中间件（需先通过 authMiddleware）
function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return error(res, '需要管理员权限', 403);
  }
  next();
}

module.exports = { authMiddleware, optionalAuth, adminMiddleware };
