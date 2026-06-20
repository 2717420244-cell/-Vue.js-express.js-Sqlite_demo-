const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../utils/token');
const { success, error } = require('../utils/response');

// 用户注册
exports.register = async (req, res, next) => {
  try {
    const { phone, username, password } = req.body;

    // 参数验证
    if (!phone || !username || !password) {
      return error(res, '手机号、用户名和密码不能为空');
    }

    // 检查手机号是否已注册
    const existingUser = User.findByPhone(phone);
    if (existingUser) {
      return error(res, '手机号已注册');
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户（第一个用户自动成为管理员）
    const { users } = User.findAll(1, 1);
    const role = users.length === 0 ? 'super_admin' : 'user';

    const user = User.create({
      username,
      phone,
      password: hashedPassword,
      role
    });

    // 生成Token
    const token = generateToken({ uid: user.uid, username: user.username, role: user.role || 'user' });

    success(res, {
      token,
      user: {
        uid: user.uid,
        username: user.username,
        phone: user.phone,
        role: user.role || 'user'
      }
    }, '注册成功');
  } catch (err) {
    next(err);
  }
};

// 用户登录
exports.login = async (req, res, next) => {
  try {
    const { account, password } = req.body;

    // account 可以是手机号或用户名
    if (!account || !password) {
      return error(res, '请输入账号和密码');
    }

    // 先按手机号查，再按用户名查
    let user = User.findByPhone(account);
    if (!user) {
      user = User.findByUsername(account);
    }
    if (!user) {
      return error(res, '账号或密码错误', 401);
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return error(res, '手机号或密码错误', 401);
    }

    // 生成Token
    const token = generateToken({ uid: user.uid, username: user.username, role: user.role || 'user' });

    success(res, {
      token,
      user: {
        uid: user.uid,
        username: user.username,
        phone: user.phone,
        real_name: user.real_name,
        avatar: user.avatar,
        balance: user.balance,
        role: user.role || 'user'
      }
    }, '登录成功');
  } catch (err) {
    next(err);
  }
};

// 获取当前用户信息
exports.getProfile = (req, res, next) => {
  try {
    const user = User.findById(req.user.uid);
    if (!user) {
      return error(res, '用户不存在', 404);
    }

    success(res, {
      uid: user.uid,
      username: user.username,
      phone: user.phone,
      real_name: user.real_name,
      avatar: user.avatar,
      balance: user.balance,
      created_at: user.created_at
    });
  } catch (err) {
    next(err);
  }
};

// 更新用户信息
exports.updateProfile = (req, res, next) => {
  try {
    const { username, real_name, avatar } = req.body;
    const user = User.update(req.user.uid, { username, real_name, avatar });

    success(res, {
      uid: user.uid,
      username: user.username,
      phone: user.phone,
      real_name: user.real_name,
      avatar: user.avatar,
      balance: user.balance
    }, '更新成功');
  } catch (err) {
    next(err);
  }
};
