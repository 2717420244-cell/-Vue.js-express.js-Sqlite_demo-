const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const { register, login, getProfile, updateProfile } = require('../controllers/authController');

// POST /api/auth/register - 用户注册
router.post('/register', register);

// POST /api/auth/login - 用户登录
router.post('/login', login);

// GET /api/auth/profile - 获取当前用户信息（需要认证）
router.get('/profile', authMiddleware, getProfile);

// PUT /api/auth/profile - 更新用户信息（需要认证）
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;
