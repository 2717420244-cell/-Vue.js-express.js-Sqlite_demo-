const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware, superAdminOnly } = require('../middlewares/auth');
const { getAudits, auditItem, getAllItems, getUsers, setUserRole, deleteUser, resetAll } = require('../controllers/adminController');

// 所有管理接口都需要登录 + 管理员权限
router.use(authMiddleware, adminMiddleware);

// GET   /api/admin/audits       - 待审核商品列表
router.get('/audits', getAudits);

// PUT   /api/admin/audits/:id   - 审核商品
router.put('/audits/:id', auditItem);

// GET   /api/admin/items        - 全部商品（管理员视角）
router.get('/items', getAllItems);

// GET   /api/admin/users        - 用户列表
router.get('/users', getUsers);

// PUT   /api/admin/users/:id    - 切换角色（body: { role: 'admin'|'user' }）
router.put('/users/:id', setUserRole);

// DELETE /api/admin/users/:id   - 删除用户
router.delete('/users/:id', deleteUser);

// POST  /api/admin/reset        - 一键清除（仅超级管理员）
router.post('/reset', superAdminOnly, resetAll);

module.exports = router;
