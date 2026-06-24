const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const { valuate } = require('../controllers/aiController');

// POST /api/ai/valuate — AI 估价（需登录）
router.post('/valuate', authMiddleware, valuate);

module.exports = router;
