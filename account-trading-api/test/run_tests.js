const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001';
let sellerToken, buyerToken;
let itemId, itemId3, orderId1, orderId2;
const results = [];
let passed = 0, failed = 0;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname, port: url.port,
      path: url.pathname, method,
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('========================================');
  console.log('  游戏账号交易系统 - 接口功能自动化测试');
  console.log('========================================\n');

  // 准备数据
  console.log('[准备测试数据]');
  await request('POST', '/api/auth/register', { phone: '13800000100', username: '测试卖家', password: '123456' });
  await request('POST', '/api/auth/register', { phone: '13800000101', username: '测试买家', password: '123456' });

  const sellerR = await request('POST', '/api/auth/login', { phone: '13800000100', password: '123456' });
  const buyerR = await request('POST', '/api/auth/login', { phone: '13800000101', password: '123456' });
  sellerToken = sellerR.body.data?.token;
  buyerToken = buyerR.body.data?.token;

  // 卖家创建商品1 -> 上架
  const item1R = await request('POST', '/api/items', { title: '测试账号V10', category: '王者荣耀', price: 299 }, sellerToken);
  itemId = item1R.body.data?.item_id || 1;
  await request('PUT', `/api/items/${itemId}/status`, { status: 1 }, sellerToken);

  // 卖家创建商品2 -> 不上架（用于测试已下架场景）
  await request('POST', '/api/items', { title: '测试账号V9', category: '王者荣耀', price: 199 }, sellerToken);

  // 卖家创建商品3 -> 上架（用于未支付订单交付测试）
  const item3R = await request('POST', '/api/items', { title: '测试账号V8', category: '王者荣耀', price: 99 }, sellerToken);
  itemId3 = item3R.body.data?.item_id || 3;
  await request('PUT', `/api/items/${itemId3}/status`, { status: 1 }, sellerToken);

  console.log(`  商品1(ID=${itemId}, 已上架)  商品2(ID=${itemId+1}, 未上架)  商品3(ID=${itemId3}, 已上架)`);
  console.log(`  卖家Token: ${sellerToken?.substring(0, 20)}...`);
  console.log(`  买家Token: ${buyerToken?.substring(0, 20)}...\n`);

  // ==================== 业务一：订单交易流程 ====================
  console.log('--- 业务一：订单交易流程 ---\n');

  // TC-02: 商品不存在
  {
    const r = await request('POST', '/api/orders', { item_id: 99999 }, buyerToken);
    const pass = r.status === 404 && (r.body.message || '').includes('不存在');
    results.push({ id: 'TC-02', title: '创建订单-商品不存在', expected: '404 + "商品不存在"', actual: `${r.status} ${r.body.message}`, pass });
    console.log(`  ${pass?'✓':'✗'} TC-02: 创建订单-商品不存在 [${pass?'通过':'失败'}] ${r.status} ${r.body.message}`);
    if (pass) passed++; else failed++;
  }

  // TC-04: 自买自卖
  {
    const r = await request('POST', '/api/orders', { item_id: itemId }, sellerToken);
    const pass = r.status === 400 && (r.body.message || '').includes('不能购买');
    results.push({ id: 'TC-04', title: '创建订单-自买自卖', expected: '400 + "不能购买自己的商品"', actual: `${r.status} ${r.body.message}`, pass });
    console.log(`  ${pass?'✓':'✗'} TC-04: 自买自卖 [${pass?'通过':'失败'}] ${r.status} ${r.body.message}`);
    if (pass) passed++; else failed++;
  }

  // TC-01-①: 正常创建订单
  {
    const r = await request('POST', '/api/orders', { item_id: itemId }, buyerToken);
    orderId1 = r.body.data?.order_id || 1;
    const pass = r.status === 200;
    results.push({ id: 'TC-01-①', title: '正常创建订单', expected: '200, 创建成功', actual: `${r.status} order_id=${orderId1}`, pass });
    console.log(`  ${pass?'✓':'✗'} TC-01-①: 正常创建订单 [${pass?'通过':'失败'}] ${r.status} order_id=${orderId1}`);
    if (pass) passed++; else failed++;
  }

  // TC-03: 商品已售
  {
    const r = await request('POST', '/api/orders', { item_id: itemId }, buyerToken);
    const pass = r.status === 400;
    results.push({ id: 'TC-03', title: '创建订单-商品已售', expected: '400 + "商品未上架或已售出"', actual: `${r.status} ${r.body.message}`, pass });
    console.log(`  ${pass?'✓':'✗'} TC-03: 商品已售 [${pass?'通过':'失败'}] ${r.status} ${r.body.message}`);
    if (pass) passed++; else failed++;
  }

  // TC-01-②: 买家支付
  {
    const r = await request('PUT', `/api/orders/${orderId1}/pay`, {}, buyerToken);
    const pass = r.status === 200;
    results.push({ id: 'TC-01-②', title: '买家支付订单', expected: '200, 支付成功', actual: `${r.status} ${r.body.message}`, pass });
    console.log(`  ${pass?'✓':'✗'} TC-01-②: 买家支付 [${pass?'通过':'失败'}] ${r.status} ${r.body.message}`);
    if (pass) passed++; else failed++;
  }

  // TC-06: 重复支付
  {
    const r = await request('PUT', `/api/orders/${orderId1}/pay`, {}, buyerToken);
    const pass = r.status === 400 && (r.body.message || '').includes('已支付');
    results.push({ id: 'TC-06', title: '重复支付', expected: '400 + "订单已支付"', actual: `${r.status} ${r.body.message}`, pass });
    console.log(`  ${pass?'✓':'✗'} TC-06: 重复支付 [${pass?'通过':'失败'}] ${r.status} ${r.body.message}`);
    if (pass) passed++; else failed++;
  }

  // TC-05: 非买家支付
  {
    const r = await request('PUT', `/api/orders/${orderId1}/pay`, {}, sellerToken);
    const pass = r.status === 403 && (r.body.message || '').includes('无权');
    results.push({ id: 'TC-05', title: '非买家支付', expected: '403 + "无权支付此订单"', actual: `${r.status} ${r.body.message}`, pass });
    console.log(`  ${pass?'✓':'✗'} TC-05: 非买家支付 [${pass?'通过':'失败'}] ${r.status} ${r.body.message}`);
    if (pass) passed++; else failed++;
  }

  // TC-01-③: 卖家交付
  {
    const r = await request('PUT', `/api/orders/${orderId1}/deliver`, {}, sellerToken);
    const pass = r.status === 200;
    results.push({ id: 'TC-01-③', title: '卖家交付账号', expected: '200, 交付成功', actual: `${r.status} ${r.body.message}`, pass });
    console.log(`  ${pass?'✓':'✗'} TC-01-③: 卖家交付 [${pass?'通过':'失败'}] ${r.status} ${r.body.message}`);
    if (pass) passed++; else failed++;
  }

  // TC-08: 未支付订单交付（用商品3创建未支付订单，然后卖家尝试交付）
  {
    const orderR = await request('POST', '/api/orders', { item_id: itemId3 }, buyerToken);
    orderId2 = orderR.body.data?.order_id || 2;
    const r = await request('PUT', `/api/orders/${orderId2}/deliver`, {}, sellerToken);
    const pass = r.status === 400 && (r.body.message || '').includes('未支付');
    results.push({ id: 'TC-08', title: '未支付订单交付', expected: '400 + "订单未支付"', actual: `${r.status} ${r.body.message}`, pass });
    console.log(`  ${pass?'✓':'✗'} TC-08: 未支付交付 [${pass?'通过':'失败'}] ${r.status} ${r.body.message} (order_id=${orderId2})`);
    if (pass) passed++; else failed++;
  }

  // TC-07: 非卖家交付
  {
    const r = await request('PUT', `/api/orders/${orderId1}/deliver`, {}, buyerToken);
    const pass = r.status === 403;
    results.push({ id: 'TC-07', title: '非卖家交付', expected: '403 + "无权交付此订单"', actual: `${r.status} ${r.body.message}`, pass });
    console.log(`  ${pass?'✓':'✗'} TC-07: 非卖家交付 [${pass?'通过':'失败'}] ${r.status} ${r.body.message}`);
    if (pass) passed++; else failed++;
  }

  // TC-09: 重复交付
  {
    const r = await request('PUT', `/api/orders/${orderId1}/deliver`, {}, sellerToken);
    const pass = r.status === 400 && (r.body.message || '').includes('已交付');
    results.push({ id: 'TC-09', title: '重复交付', expected: '400 + "订单已交付"', actual: `${r.status} ${r.body.message}`, pass });
    console.log(`  ${pass?'✓':'✗'} TC-09: 重复交付 [${pass?'通过':'失败'}] ${r.status} ${r.body.message}`);
    if (pass) passed++; else failed++;
  }

  // TC-01-④: 买家确认收货
  {
    const r = await request('PUT', `/api/orders/${orderId1}/confirm`, {}, buyerToken);
    const pass = r.status === 200;
    results.push({ id: 'TC-01-④', title: '买家确认收货', expected: '200, 确认成功', actual: `${r.status} ${r.body.message}`, pass });
    console.log(`  ${pass?'✓':'✗'} TC-01-④: 确认收货 [${pass?'通过':'失败'}] ${r.status} ${r.body.message}`);
    if (pass) passed++; else failed++;
  }

  // TC-10: 非买家确认
  {
    const r = await request('PUT', `/api/orders/${orderId1}/confirm`, {}, sellerToken);
    const pass = r.status === 403;
    results.push({ id: 'TC-10', title: '非买家确认收货', expected: '403 + "无权确认此订单"', actual: `${r.status} ${r.body.message}`, pass });
    console.log(`  ${pass?'✓':'✗'} TC-10: 非买家确认 [${pass?'通过':'失败'}] ${r.status} ${r.body.message}`);
    if (pass) passed++; else failed++;
  }

  // TC-11: 未交付确认收货
  {
    const r = await request('PUT', `/api/orders/${orderId2}/confirm`, {}, buyerToken);
    const pass = r.status === 400 && (r.body.message || '').includes('未交付');
    results.push({ id: 'TC-11', title: '未交付订单确认收货', expected: '400 + "订单未交付"', actual: `${r.status} ${r.body.message}`, pass });
    console.log(`  ${pass?'✓':'✗'} TC-11: 未交付确认 [${pass?'通过':'失败'}] ${r.status} ${r.body.message}`);
    if (pass) passed++; else failed++;
  }

  // ==================== 业务二：商品评价提交 ====================
  console.log('\n--- 业务二：商品评价提交 ---\n');

  // TC-13: 参数缺失
  {
    const r = await request('POST', '/api/reviews', {}, buyerToken);
    const pass = r.status === 400;
    results.push({ id: 'TC-13', title: '评价参数缺失', expected: '400', actual: `${r.status} ${r.body.message}`, pass });
    console.log(`  ${pass?'✓':'✗'} TC-13: 参数缺失 [${pass?'通过':'失败'}] ${r.status} ${r.body.message}`);
    if (pass) passed++; else failed++;
  }

  // TC-14: 评分越界
  {
    const r = await request('POST', '/api/reviews', { order_id: orderId1, rating: 6 }, buyerToken);
    const pass = r.status === 400 && (r.body.message || '').includes('1-5');
    results.push({ id: 'TC-14', title: '评分越界(rating=6)', expected: '400 + "评分必须在1-5之间"', actual: `${r.status} ${r.body.message}`, pass });
    console.log(`  ${pass?'✓':'✗'} TC-14: 评分越界 [${pass?'通过':'失败'}] ${r.status} ${r.body.message}`);
    if (pass) passed++; else failed++;
  }

  // TC-15: 订单不存在
  {
    const r = await request('POST', '/api/reviews', { order_id: 9999, rating: 5 }, buyerToken);
    const pass = r.status === 404;
    results.push({ id: 'TC-15', title: '评价不存在的订单', expected: '404 + "订单不存在"', actual: `${r.status} ${r.body.message}`, pass });
    console.log(`  ${pass?'✓':'✗'} TC-15: 订单不存在 [${pass?'通过':'失败'}] ${r.status} ${r.body.message}`);
    if (pass) passed++; else failed++;
  }

  // TC-17: 订单未完成
  {
    const r = await request('POST', '/api/reviews', { order_id: orderId2, rating: 5 }, buyerToken);
    const pass = r.status === 400;
    results.push({ id: 'TC-17', title: '未完成订单评价', expected: '400 + "订单未完成"', actual: `${r.status} ${r.body.message}`, pass });
    console.log(`  ${pass?'✓':'✗'} TC-17: 未完成评价 [${pass?'通过':'失败'}] ${r.status} ${r.body.message}`);
    if (pass) passed++; else failed++;
  }

  // TC-12: 正常评价
  {
    const r = await request('POST', '/api/reviews', { order_id: orderId1, rating: 5, comment: '非常满意' }, buyerToken);
    const pass = r.status === 200;
    results.push({ id: 'TC-12', title: '正常提交评价', expected: '200, 评价成功', actual: `${r.status} ${r.body.message}`, pass });
    console.log(`  ${pass?'✓':'✗'} TC-12: 正常评价 [${pass?'通过':'失败'}] ${r.status} ${r.body.message}`);
    if (pass) passed++; else failed++;
  }

  // TC-18: 重复评价
  {
    const r = await request('POST', '/api/reviews', { order_id: orderId1, rating: 5, comment: '再评一次' }, buyerToken);
    const pass = r.status === 400;
    results.push({ id: 'TC-18', title: '重复评价', expected: '400 + "已评价过此订单"', actual: `${r.status} ${r.body.message}`, pass });
    console.log(`  ${pass?'✓':'✗'} TC-18: 重复评价 [${pass?'通过':'失败'}] ${r.status} ${r.body.message}`);
    if (pass) passed++; else failed++;
  }

  // TC-16: 非买家评价
  {
    const r = await request('POST', '/api/reviews', { order_id: orderId1, rating: 5 }, sellerToken);
    const pass = r.status === 403;
    results.push({ id: 'TC-16', title: '非买家评价', expected: '403 + "无权评价此订单"', actual: `${r.status} ${r.body.message}`, pass });
    console.log(`  ${pass?'✓':'✗'} TC-16: 非买家评价 [${pass?'通过':'失败'}] ${r.status} ${r.body.message}`);
    if (pass) passed++; else failed++;
  }

  // ==================== 生成报告 ====================
  generateReport();
}

function generateReport() {
  console.log('\n========================================');
  console.log('  测试汇总');
  console.log('========================================\n');
  console.log(`总计: ${results.length}  |  通过: ${passed}  |  失败: ${failed}  |  通过率: ${(passed/results.length*100).toFixed(1)}%\n`);

  const lines = [];
  lines.push('# 接口功能测试工作报告');
  lines.push('');
  lines.push(`> 测试时间: ${new Date().toLocaleString('zh-CN')}`);
  lines.push(`> 测试工具: Node.js 自动化测试脚本`);
  lines.push(`> 测试环境: http://localhost:3001`);
  lines.push('');
  lines.push('## 测试汇总');
  lines.push('');
  lines.push('| 项目 | 数值 |');
  lines.push('|------|------|');
  lines.push(`| 总计用例 | ${results.length} |`);
  lines.push(`| 通过 | ${passed} |`);
  lines.push(`| 失败 | ${failed} |`);
  lines.push(`| 通过率 | ${(passed / results.length * 100).toFixed(1)}% |`);
  lines.push('');

  lines.push('## 业务一：订单交易流程测试');
  lines.push('');
  lines.push('| 编号 | 测试场景 | 预期结果 | 实际结果 | 状态 |');
  lines.push('|------|----------|----------|----------|------|');
  for (const r of results.filter(r => {
    const m = r.id.match(/^TC-(\d+)/);
    return m && parseInt(m[1]) <= 11;
  })) {
    lines.push(`| ${r.id} | ${r.title} | ${r.expected} | ${r.actual} | ${r.pass ? '✓ 通过' : '✗ 失败'} |`);
  }
  lines.push('');

  lines.push('## 业务二：商品评价提交测试');
  lines.push('');
  lines.push('| 编号 | 测试场景 | 预期结果 | 实际结果 | 状态 |');
  lines.push('|------|----------|----------|----------|------|');
  for (const r of results.filter(r => {
    const m = r.id.match(/^TC-(\d+)/);
    return m && parseInt(m[1]) > 11;
  })) {
    lines.push(`| ${r.id} | ${r.title} | ${r.expected} | ${r.actual} | ${r.pass ? '✓ 通过' : '✗ 失败'} |`);
  }
  lines.push('');

  // REST Client 测试脚本说明
  lines.push('## REST Client 测试脚本');
  lines.push('');
  lines.push('项目已提供 VS Code REST Client 格式的测试文件：');
  lines.push('- **文件路径**: `docs/business_functions_test.http`');
  lines.push('- **使用方法**: 在 VS Code 中安装 REST Client 插件，打开该文件，点击每个请求上方的 "Send Request" 即可逐个执行');
  lines.push('- **覆盖范围**: 包含订单交易全流程（创建→支付→交付→确认）和商品评价提交的所有正反向测试用例');
  lines.push('');
  lines.push('```http');
  lines.push('### TC-02：创建订单 - 商品不存在');
  lines.push('POST http://localhost:3001/api/orders');
  lines.push('Content-Type: application/json');
  lines.push('Authorization: Bearer {{buyer_token}}');
  lines.push('');
  lines.push('{');
  lines.push('  "item_id": 99999');
  lines.push('}');
  lines.push('');
  lines.push('### TC-01-①：正常创建订单');
  lines.push('POST http://localhost:3001/api/orders');
  lines.push('Content-Type: application/json');
  lines.push('Authorization: Bearer {{buyer_token}}');
  lines.push('');
  lines.push('{');
  lines.push('  "item_id": 1');
  lines.push('}');
  lines.push('```');

  const reportPath = path.join(__dirname, '..', 'docs', '测试工作报告.md');
  fs.writeFileSync(reportPath, lines.join('\n'), 'utf-8');
  console.log(`报告已生成: ${reportPath}`);
}

if (require.main === module) {
  run().catch(err => {
    console.error('测试执行失败:', err);
    process.exit(1);
  });
}
