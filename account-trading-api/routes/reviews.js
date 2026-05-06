const express = require('express');
const router = express.Router();
const { authMiddleware, optionalAuth } = require('../middlewares/auth');
const { getList, create } = require('../controllers/reviewController');

// GET /api/reviews - 获取商品评价列表（可选认证）
router.get('/', optionalAuth, getList);

// POST /api/reviews - 提交评价（需要认证）
router.post('/', authMiddleware, create);

module.exports = router;
