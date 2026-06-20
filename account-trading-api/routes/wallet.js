const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const { getBalance, recharge, getTransactions } = require('../controllers/walletController');

router.use(authMiddleware);

// GET   /api/wallet/balance       - 查询余额
router.get('/balance', getBalance);

// POST  /api/wallet/recharge      - 充值 {amount: 100}
router.post('/recharge', recharge);

// GET   /api/wallet/transactions  - 交易记录
router.get('/transactions', getTransactions);

module.exports = router;
