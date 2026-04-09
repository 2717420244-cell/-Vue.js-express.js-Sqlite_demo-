const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use('/api', require('./routes/index'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的路由不存在',
    path: req.path
  });
});

app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log('========================================');
  console.log('  Express.js 路由演示服务器已启动');
  console.log(`  服务器地址: http://localhost:${PORT}`);
  console.log('========================================');
  console.log('');
  console.log('可用路由:');
  console.log('  GET    /api                      - API信息');
  console.log('  GET    /api/health               - 健康检查');
  console.log('  GET    /api/users                - 用户列表');
  console.log('  GET    /api/users/:id            - 单个用户');
  console.log('  POST   /api/users                - 创建用户');
  console.log('  PUT    /api/users/:id            - 更新用户');
  console.log('  DELETE /api/users/:id            - 删除用户');
  console.log('  GET    /api/products             - 产品列表');
  console.log('  GET    /api/products/:id         - 单个产品');
  console.log('  POST   /api/products             - 创建产品');
  console.log('  PUT    /api/products/:id         - 更新产品');
  console.log('  DELETE /api/products/:id         - 删除产品');
  console.log('');
});