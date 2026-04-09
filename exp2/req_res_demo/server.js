/**
 * Express.js 请求与响应对象演示
 * 
 * 本文件演示 Express 框架中 req（请求对象）和 res（响应对象）的核心属性和方法
 */

const express = require('express');
const app = express();
const PORT = 3000;

// ============================================================
// 中间件配置
// ============================================================

// 解析 JSON 请求体 - 必须配置此中间件才能获取 req.body
app.use(express.json());

// 解析 URL-encoded 请求体（form 表单提交）
app.use(express.urlencoded({ extended: true }));

// 自定义日志中间件 - 显示请求详情
app.use((req, res, next) => {
  console.log('\n========== 请求接收 ==========');
  console.log(`请求方法: ${req.method}`);
  console.log(`请求路径: ${req.path}`);
  console.log(`查询参数: ${JSON.stringify(req.query)}`);
  console.log(`路由参数: ${JSON.stringify(req.params)}`);
  console.log('================================\n');
  next();
});

// ============================================================
// 模拟数据
// ============================================================

const books = [
  { id: 1, title: '《红楼梦》', author: '曹雪芹', year: 1791 },
  { id: 2, title: '《西游记》', author: '吴承恩', year: 1592 },
  { id: 3, title: '《三国演义》', author: '罗贯中', year: 1522 },
  { id: 4, title: '《水浒传》', author: '施耐庵', year: 1589 }
];

// ============================================================
// 路由定义
// ============================================================

/**
 * 1. req.params 演示 - 获取路由参数
 * 
 * 路由参数用于 URL 路径中的动态值
 * 例如 /books/1 中的 "1" 就是路由参数
 * 访问方式: req.params.id
 */
app.get('/books/:id', (req, res) => {
  // req.params 包含路由参数，属性名与路由中定义的 :id 对应
  const bookId = req.params.id;
  
  const book = books.find(b => b.id === parseInt(bookId));
  
  if (!book) {
    // res.status() 设置 HTTP 状态码
    return res.status(404).json({
      success: false,
      message: '书籍不存在'
    });
  }
  
  // res.json() 发送 JSON 响应，并自动设置 Content-Type 为 application/json
  res.json({
    success: true,
    message: '获取书籍成功',
    data: {
      // 展示 req.params 的值
      requestedId: req.params.id,
      book: book
    }
  });
});

/**
 * 2. req.query 演示 - 获取查询字符串参数
 * 
 * 查询参数是 URL 中 ? 后面的部分
 * 例如 /search?keyword=红楼梦&author=曹
 * 访问方式: req.query.keyword, req.query.author
 */
app.get('/search', (req, res) => {
  // req.query 包含所有查询参数
  const { keyword, author, year } = req.query;
  
  let results = books;
  
  // 根据查询参数筛选书籍
  if (keyword) {
    results = results.filter(book => 
      book.title.includes(keyword) || book.author.includes(keyword)
    );
  }
  
  if (author) {
    results = results.filter(book => book.author.includes(author));
  }
  
  if (year) {
    results = results.filter(book => book.year === parseInt(year));
  }
  
  res.json({
    success: true,
    message: '搜索完成',
    // 展示 req.query 的值
    queryParams: {
      keyword: keyword || null,
      author: author || null,
      year: year || null
    },
    results: results,
    total: results.length
  });
});

/**
 * 3. req.body 演示 - 获取请求体数据
 * 
 * 请求体通常用于 POST、PUT 请求携带的数据
 * 需要配置 express.json() 中间件才能正确解析
 * 访问方式: req.body.fieldName
 */
app.post('/books', (req, res) => {
  // req.body 包含请求体中的数据（JSON 格式）
  const { title, author, year } = req.body;
  
  // 简单的数据验证
  if (!title || !author || !year) {
    return res.status(400).json({
      success: false,
      message: '请提供完整的书籍信息（title, author, year）',
      // 展示 req.body 的值
      receivedBody: req.body
    });
  }
  
  const newBook = {
    id: books.length + 1,
    title,
    author,
    year: parseInt(year)
  };
  
  books.push(newBook);
  
  // 201 表示 "Created" - 用于资源创建成功
  res.status(201).json({
    success: true,
    message: '书籍创建成功',
    data: newBook,
    // 展示 req.body 的值
    receivedBody: req.body
  });
});

/**
 * 4. res.status() 演示 - 设置响应状态码
 */
app.get('/status-examples', (req, res) => {
  // 200 OK - 默认状态码，可省略
  res.status(200).json({ code: 200, message: 'OK - 请求成功' });
});

/**
 * 5. res.json() 演示 - 发送 JSON 响应
 */
app.get('/json-response', (req, res) => {
  // res.json() 会自动设置 Content-Type: application/json
  // 也可以传入数组或任何可序列化的值
  res.json({
    success: true,
    data: [
      { id: 1, name: '示例1' },
      { id: 2, name: '示例2' }
    ],
    timestamp: new Date().toISOString()
  });
});

/**
 * 综合示例：结合使用 req.params, req.query, req.body
 */
app.put('/books/:id', (req, res) => {
  const bookId = parseInt(req.params.id);  // 路由参数
  const { title, author, year } = req.body;  // 请求体数据
  const { validate } = req.query;  // 查询参数
  
  const bookIndex = books.findIndex(b => b.id === bookId);
  
  if (bookIndex === -1) {
    return res.status(404).json({
      success: false,
      message: '书籍不存在',
      params: req.params
    });
  }
  
  // 更新书籍信息
  if (title) books[bookIndex].title = title;
  if (author) books[bookIndex].author = author;
  if (year) books[bookIndex].year = parseInt(year);
  
  res.json({
    success: true,
    message: '书籍更新成功',
    // 展示所有三种参数
    params: req.params,
    query: req.query,
    body: req.body,
    data: books[bookIndex]
  });
});

/**
 * 删除书籍
 */
app.delete('/books/:id', (req, res) => {
  const bookId = parseInt(req.params.id);
  const bookIndex = books.findIndex(b => b.id === bookId);
  
  if (bookIndex === -1) {
    return res.status(404).json({
      success: false,
      message: '书籍不存在'
    });
  }
  
  const deletedBook = books.splice(bookIndex, 1)[0];
  
  res.json({
    success: true,
    message: '书籍删除成功',
    deletedBook: deletedBook
  });
});

/**
 * 获取所有书籍（支持筛选）
 */
app.get('/books', (req, res) => {
  const { author, minYear, maxYear } = req.query;
  
  let results = books;
  
  if (author) {
    results = results.filter(b => b.author.includes(author));
  }
  if (minYear) {
    results = results.filter(b => b.year >= parseInt(minYear));
  }
  if (maxYear) {
    results = results.filter(b => b.year <= parseInt(maxYear));
  }
  
  res.json({
    success: true,
    total: results.length,
    books: results
  });
});

/**
 * 请求头演示
 */
app.get('/headers', (req, res) => {
  res.json({
    success: true,
    message: '请求头信息',
    headers: {
      'Content-Type': req.get('Content-Type'),
      'User-Agent': req.get('User-Agent'),
      'Accept': req.get('Accept')
    }
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
  console.log('==============================================');
  console.log('   Express.js 请求与响应对象演示服务器');
  console.log('==============================================');
  console.log(`   服务器地址: http://localhost:${PORT}`);
  console.log('==============================================');
  console.log('');
  console.log('可用路由:');
  console.log('');
  console.log('  【req.params - 路由参数】');
  console.log('  GET  /books/:id              - 获取指定ID的书籍');
  console.log('  PUT  /books/:id             - 更新指定ID的书籍');
  console.log('  DELETE /books/:id           - 删除指定ID的书籍');
  console.log('');
  console.log('  【req.query - 查询参数】');
  console.log('  GET  /search?keyword=...&author=...  - 搜索书籍');
  console.log('  GET  /books?author=...&minYear=...   - 筛选书籍');
  console.log('');
  console.log('  【req.body - 请求体数据】');
  console.log('  POST /books                  - 创建新书籍');
  console.log('  PUT  /books/:id             - 更新书籍(带body)');
  console.log('');
  console.log('  【其他】');
  console.log('  GET  /status-examples        - 状态码示例');
  console.log('  GET  /json-response          - JSON响应示例');
  console.log('  GET  /headers                - 请求头信息');
  console.log('');
});