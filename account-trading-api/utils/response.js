// 统一成功响应
function success(res, data = null, message = 'success') {
  return res.json({
    code: 200,
    message,
    data
  });
}

// 统一错误响应
function error(res, message = 'error', code = 400) {
  return res.status(code).json({
    code,
    message,
    data: null
  });
}

// 分页响应
function paginated(res, data, page, limit, total) {
  return res.json({
    code: 200,
    message: 'success',
    data: {
      items: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}

module.exports = { success, error, paginated };
