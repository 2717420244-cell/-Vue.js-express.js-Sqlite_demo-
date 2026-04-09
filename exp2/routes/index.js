const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: '欢迎使用 Express.js 路由演示 API',
    version: '1.0.0',
    endpoints: {
      users: {
        'GET /api/users': '获取用户列表（支持分页: ?page=1&limit=10）',
        'GET /api/users/:id': '获取单个用户',
        'POST /api/users': '创建用户（body: name, email）',
        'PUT /api/users/:id': '更新用户',
        'DELETE /api/users/:id': '删除用户'
      },
      products: {
        'GET /api/products': '获取产品列表（支持筛选: ?category=手机&minPrice=1000&maxPrice=5000）',
        'GET /api/products/:id': '获取单个产品',
        'POST /api/products': '创建产品（body: name, price, category）',
        'PUT /api/products/:id': '更新产品',
        'DELETE /api/products/:id': '删除产品'
      }
    }
  });
});

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;