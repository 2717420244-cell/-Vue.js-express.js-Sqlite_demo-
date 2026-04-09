/**
 * Express.js + SQLite 数据持久化存储演示
 * 
 * 本文件演示在 Express 应用中使用 SQLite 数据库进行数据持久化存储
 * 包含 CRUD 操作、参数化查询防止 SQL 注入
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const PORT = 3000;

// ============================================================
// 中间件配置
// ============================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================================
// 数据库初始化
// ============================================================

// 创建数据库文件（如果不存在则创建）
const DB_PATH = path.join(__dirname, 'demo.db');
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
    process.exit(1);
  }
  console.log('✓ 数据库连接成功');
  console.log(`✓ 数据库文件: ${DB_PATH}`);
});

// 创建数据表
const createTableSQL = `
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    major TEXT NOT NULL,
    grade TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

db.run(createTableSQL, (err) => {
  if (err) {
    console.error('创建数据表失败:', err.message);
  } else {
    console.log('✓ 数据表 students 创建成功（或已存在）');
  }
});

// ============================================================
// 数据库操作函数（封装为 Promise 便于异步处理）
// ============================================================

/**
 * 执行数据库查询（SELECT）
 * @param {string} sql - SQL 语句
 * @param {Array} params - 参数化查询参数
 * @returns {Promise<Array>} 查询结果
 */
function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    // 参数化查询，防止 SQL 注入
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * 执行数据库操作（INSERT/UPDATE/DELETE）
 * @param {string} sql - SQL 语句
 * @param {Array} params - 参数化查询参数
 * @returns {Promise<{lastID: number, changes: number}>}
 */
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    // 参数化查询，防止 SQL 注入
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        // this.lastID: 最后插入的行ID
        // this.changes: 受影响的行数
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

// ============================================================
// 路由定义
// ============================================================

/**
 * 获取所有学生（支持查询筛选）
 * req.query 用于获取查询字符串参数
 */
app.get('/api/students', async (req, res) => {
  try {
    const { major, minAge, maxAge, grade } = req.query;
    
    let sql = 'SELECT * FROM students WHERE 1=1';
    const params = [];
    
    // 动态构建查询条件（使用参数化查询防止SQL注入）
    if (major) {
      sql += ' AND major = ?';
      params.push(major);
    }
    if (minAge) {
      sql += ' AND age >= ?';
      params.push(parseInt(minAge));
    }
    if (maxAge) {
      sql += ' AND age <= ?';
      params.push(parseInt(maxAge));
    }
    if (grade) {
      sql += ' AND grade = ?';
      params.push(grade);
    }
    
    sql += ' ORDER BY id DESC';
    
    const students = await dbGet(sql, params);
    
    res.json({
      success: true,
      message: '获取学生列表成功',
      count: students.length,
      filters: { major, minAge, maxAge, grade },
      data: students
    });
  } catch (err) {
    console.error('查询失败:', err.message);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

/**
 * 获取单个学生（使用路由参数）
 * req.params 用于获取 URL 路径中的参数
 */
app.get('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 参数化查询：? 占位符会被 id 的值替换
    const sql = 'SELECT * FROM students WHERE id = ?';
    const students = await dbGet(sql, [id]);
    
    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: '学生不存在'
      });
    }
    
    res.json({
      success: true,
      message: '获取学生信息成功',
      data: students[0]
    });
  } catch (err) {
    console.error('查询失败:', err.message);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

/**
 * 创建学生（使用请求体数据）
 * req.body 用于获取 POST/PUT 请求的请求体
 */
app.post('/api/students', async (req, res) => {
  try {
    const { name, age, major, grade } = req.body;
    
    // 数据验证
    if (!name || !age || !major) {
      return res.status(400).json({
        success: false,
        message: '姓名、年龄、专业为必填项',
        receivedBody: req.body
      });
    }
    
    // 参数化 INSERT 语句
    const sql = `
      INSERT INTO students (name, age, major, grade)
      VALUES (?, ?, ?, ?)
    `;
    const result = await dbRun(sql, [name, parseInt(age), major, grade || null]);
    
    // 201 Created - 资源创建成功
    res.status(201).json({
      success: true,
      message: '学生创建成功',
      data: {
        id: result.lastID,
        name,
        age: parseInt(age),
        major,
        grade: grade || null
      }
    });
  } catch (err) {
    console.error('创建失败:', err.message);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

/**
 * 更新学生（路由参数 + 请求体）
 */
app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, major, grade } = req.body;
    
    // 先检查学生是否存在
    const existing = await dbGet('SELECT * FROM students WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '学生不存在'
      });
    }
    
    // 构建动态更新语句
    const updates = [];
    const params = [];
    
    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (age) {
      updates.push('age = ?');
      params.push(parseInt(age));
    }
    if (major) {
      updates.push('major = ?');
      params.push(major);
    }
    if (grade !== undefined) {
      updates.push('grade = ?');
      params.push(grade);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有提供要更新的字段'
      });
    }
    
    // 参数化 UPDATE 语句
    const sql = `UPDATE students SET ${updates.join(', ')} WHERE id = ?`;
    params.push(id);
    
    const result = await dbRun(sql, params);
    
    // 获取更新后的数据
    const updated = await dbGet('SELECT * FROM students WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: '学生更新成功',
      changes: result.changes,
      data: updated[0]
    });
  } catch (err) {
    console.error('更新失败:', err.message);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

/**
 * 删除学生（路由参数）
 */
app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 先检查学生是否存在
    const existing = await dbGet('SELECT * FROM students WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '学生不存在'
      });
    }
    
    // 参数化 DELETE 语句
    const sql = 'DELETE FROM students WHERE id = ?';
    const result = await dbRun(sql, [id]);
    
    res.json({
      success: true,
      message: '学生删除成功',
      deleted: existing[0]
    });
  } catch (err) {
    console.error('删除失败:', err.message);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

/**
 * 获取学生统计信息
 */
app.get('/api/stats', async (req, res) => {
  try {
    const total = await dbGet('SELECT COUNT(*) as count FROM students');
    const byMajor = await dbGet('SELECT major, COUNT(*) as count FROM students GROUP BY major');
    const byGrade = await dbGet('SELECT grade, COUNT(*) as count FROM students GROUP BY grade');
    
    res.json({
      success: true,
      message: '获取统计信息成功',
      data: {
        total: total[0].count,
        byMajor: byMajor,
        byGrade: byGrade
      }
    });
  } catch (err) {
    console.error('查询失败:', err.message);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

/**
 * API 信息
 */
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Express + SQLite 数据持久化演示 API',
    version: '1.0.0',
    endpoints: [
      { method: 'GET', path: '/api/students', desc: '获取学生列表（支持筛选）' },
      { method: 'GET', path: '/api/students/:id', desc: '获取单个学生' },
      { method: 'POST', path: '/api/students', desc: '创建学生' },
      { method: 'PUT', path: '/api/students/:id', desc: '更新学生' },
      { method: 'DELETE', path: '/api/students/:id', desc: '删除学生' },
      { method: 'GET', path: '/api/stats', desc: '学生统计信息' }
    ]
  });
});

/**
 * 404 处理
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '路由不存在',
    path: req.path
  });
});

// ============================================================
// 启动服务器
// ============================================================

app.listen(PORT, () => {
  console.log('');
  console.log('==============================================');
  console.log('   Express.js + SQLite 数据持久化演示');
  console.log('==============================================');
  console.log(`   服务器地址: http://localhost:${PORT}`);
  console.log('==============================================');
  console.log('');
  console.log('数据库操作说明:');
  console.log('  - 使用参数化查询 (?) 防止 SQL 注入');
  console.log('  - 所有 CRUD 操作均持久化到 demo.db');
  console.log('');
  console.log('可用路由:');
  console.log('  GET    /api                    - API信息');
  console.log('  GET    /api/students           - 学生列表（?major=&minAge=&maxAge=&grade=）');
  console.log('  GET    /api/students/:id        - 单个学生');
  console.log('  POST   /api/students            - 创建学生');
  console.log('  PUT    /api/students/:id        - 更新学生');
  console.log('  DELETE /api/students/:id        - 删除学生');
  console.log('  GET    /api/stats              - 统计信息');
  console.log('');
});

// 优雅关闭数据库连接
process.on('SIGINT', () => {
  console.log('\n正在关闭数据库连接...');
  db.close((err) => {
    if (err) {
      console.error('关闭数据库失败:', err.message);
    } else {
      console.log('✓ 数据库连接已关闭');
    }
    process.exit(0);
  });
});