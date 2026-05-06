const express = require('express');
const router = express.Router();
const { authMiddleware, optionalAuth } = require('../middlewares/auth');
const { getList, getDetail, create, update, delete: deleteItem, updateStatus } = require('../controllers/itemController');

// GET /api/items - 获取商品列表（可选认证）
router.get('/', optionalAuth, getList);

// GET /api/items/:id - 获取商品详情（可选认证）
router.get('/:id', optionalAuth, getDetail);

// POST /api/items - 发布商品（需要认证）
router.post('/', authMiddleware, create);

// PUT /api/items/:id - 更新商品（需要认证）
router.put('/:id', authMiddleware, update);

// DELETE /api/items/:id - 删除商品（需要认证）
router.delete('/:id', authMiddleware, deleteItem);

// PUT /api/items/:id/status - 更新商品状态（需要认证）
router.put('/:id/status', authMiddleware, updateStatus);

module.exports = router;
