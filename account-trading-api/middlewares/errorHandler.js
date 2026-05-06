// 统一错误处理中间件
function errorHandler(err, req, res, next) {
  console.error('服务器错误:', err.message);
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || '服务器内部错误';

  res.status(statusCode).json({
    code: statusCode,
    message: process.env.NODE_ENV === 'production' ? '服务器内部错误' : message,
    data: null
  });
}

// 404处理
function notFoundHandler(req, res) {
  res.status(404).json({
    code: 404,
    message: `请求的路由 ${req.method} ${req.path} 不存在`,
    data: null
  });
}

module.exports = { errorHandler, notFoundHandler };
