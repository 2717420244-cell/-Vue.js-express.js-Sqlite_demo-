const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const { getAudits, auditItem, getAllItems, getUsers } = require('../controllers/adminController');

// 所有管理接口都需要登录 + 管理员权限
router.use(authMiddleware, adminMiddleware);

// GET  /api/admin/audits       - 待审核商品列表
router.get('/audits', getAudits);

// PUT  /api/admin/audits/:id   - 审核商品（body: { action: 'approve' | 'reject' }）
router.put('/audits/:id', auditItem);

// GET  /api/admin/items        - 全部商品（管理员视角）
router.get('/items', getAllItems);

// GET  /api/admin/users        - 用户列表
router.get('/users', getUsers);

module.exports = router;
