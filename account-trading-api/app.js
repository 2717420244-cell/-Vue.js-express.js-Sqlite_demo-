const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// 路由配置
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));

// 首页路由
app.get('/', (req, res) => {
  res.json({
    name: '游戏账号交易系统API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile',
        updateProfile: 'PUT /api/auth/profile'
      },
      items: {
        list: 'GET /api/items',
        detail: 'GET /api/items/:id',
        create: 'POST /api/items',
        update: 'PUT /api/items/:id',
        delete: 'DELETE /api/items/:id',
        updateStatus: 'PUT /api/items/:id/status'
      },
      orders: {
        list: 'GET /api/orders',
        detail: 'GET /api/orders/:id',
        create: 'POST /api/orders',
        pay: 'PUT /api/orders/:id/pay',
        deliver: 'PUT /api/orders/:id/deliver',
        confirm: 'PUT /api/orders/:id/confirm'
      },
      reviews: {
        list: 'GET /api/reviews',
        create: 'POST /api/reviews'
      }
    }
  });
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404处理
app.use(notFoundHandler);

// 错误处理
app.use(errorHandler);

// 初始化数据库并启动服务器
async function start() {
  try {
    await initDatabase();
    console.log('数据库初始化成功');

    const server = app.listen(PORT, () => {
      console.log('========================================');
      console.log('  游戏账号交易系统API服务器已启动');
      console.log(`  服务器地址: http://localhost:${PORT}`);
      console.log('========================================');
      console.log('');
      console.log('可用接口:');
      console.log('  POST   /api/auth/register      - 用户注册');
      console.log('  POST   /api/auth/login          - 用户登录');
      console.log('  GET    /api/auth/profile        - 获取用户信息');
      console.log('  PUT    /api/auth/profile        - 更新用户信息');
      console.log('  GET    /api/items               - 商品列表');
      console.log('  GET    /api/items/:id           - 商品详情');
      console.log('  POST   /api/items               - 发布商品');
      console.log('  PUT    /api/items/:id           - 更新商品');
      console.log('  DELETE /api/items/:id           - 删除商品');
      console.log('  GET    /api/orders              - 订单列表');
      console.log('  POST   /api/orders              - 创建订单');
      console.log('  PUT    /api/orders/:id/pay      - 订单支付');
      console.log('  GET    /api/reviews             - 评价列表');
      console.log('  POST   /api/reviews             - 提交评价');
      console.log('');
    });

    // 优雅关闭：Ctrl+C 时自动清理
    process.on('SIGINT', () => {
      console.log('\n正在关闭服务器...');
      server.close(() => {
        console.log('服务器已停止');
        process.exit(0);
      });
    });
  } catch (err) {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ 端口 ${PORT} 已被占用！`);
      console.error(`   请先关闭占用该端口的程序，或执行以下命令：`);
      console.error(`   netstat -ano | findstr :${PORT}`);
      console.error(`   taskkill /PID <进程ID> /F`);
      console.error(`\n   或者换个端口启动：`);
      console.error(`   set PORT=3002 && node app.js`);
    } else {
      console.error('启动失败:', err);
    }
    process.exit(1);
  }
}

start();
