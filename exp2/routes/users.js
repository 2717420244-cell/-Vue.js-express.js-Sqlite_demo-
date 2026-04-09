const express = require('express');
const router = express.Router();

let users = [
  { id: 1, name: '张三', email: 'zhangsan@example.com' },
  { id: 2, name: '李四', email: 'lisi@example.com' },
  { id: 3, name: '王五', email: 'wangwu@example.com' }
];

router.get('/', (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const start = (page - 1) * limit;
  const end = start + parseInt(limit);
  const result = users.slice(start, end);
  
  res.json({
    success: true,
    data: result,
    pagination: { page: parseInt(page), limit: parseInt(limit), total: users.length }
  });
});

router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }
  res.json({ success: true, data: user });
});

router.post('/', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, message: '姓名和邮箱不能为空' });
  }
  
  const newUser = {
    id: users.length + 1,
    name,
    email
  };
  users.push(newUser);
  
  res.status(201).json({ success: true, data: newUser, message: '用户创建成功' });
});

router.put('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }
  
  const { name, email } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  
  res.json({ success: true, data: user, message: '用户更新成功' });
});

router.delete('/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }
  
  const deletedUser = users.splice(userIndex, 1)[0];
  res.json({ success: true, data: deletedUser, message: '用户删除成功' });
});

module.exports = router;