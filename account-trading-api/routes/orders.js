const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const { getList, getDetail, create, pay, deliver, confirm } = require('../controllers/orderController');

// GET /api/orders - 获取订单列表（需要认证）
router.get('/', authMiddleware, getList);

// GET /api/orders/:id - 获取订单详情（需要认证）
router.get('/:id', authMiddleware, getDetail);

// POST /api/orders - 创建订单（需要认证）
router.post('/', authMiddleware, create);

// PUT /api/orders/:id/pay - 订单支付（需要认证）
router.put('/:id/pay', authMiddleware, pay);

// PUT /api/orders/:id/deliver - 确认交付（需要认证）
router.put('/:id/deliver', authMiddleware, deliver);

// PUT /api/orders/:id/confirm - 确认收货（需要认证）
router.put('/:id/confirm', authMiddleware, confirm);

module.exports = router;
