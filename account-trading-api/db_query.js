const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'account_trading.db');

async function main() {
  const SQL = await initSqlJs();
  const fileBuffer = fs.readFileSync(DB_PATH);
  const db = new SQL.Database(fileBuffer);

  console.log('========================================');
  console.log('  SQLite 数据库访问演示');
  console.log('========================================\n');

  console.log('1. 数据库连接信息');
  console.log('-'.repeat(40));
  console.log(`数据库文件路径: ${DB_PATH}`);
  console.log(`数据库文件大小: ${fs.statSync(DB_PATH).size} 字节`);
  console.log(`数据库引擎: sql.js (SQLite compiled to WebAssembly)`);
  console.log('');

  console.log('2. 表结构查询');
  console.log('-'.repeat(40));

  const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  console.log('\n数据库中的表:');
  tables[0].values.forEach(([name]) => {
    console.log(`  - ${name}`);
  });
  console.log('');

  tables[0].values.forEach(([tableName]) => {
    console.log(`\n表 [${tableName}] 的结构:`);
    const schema = db.exec(`PRAGMA table_info(${tableName})`);
    console.log('  字段名        类型              非空    默认值');
    console.log('  ' + '-'.repeat(60));
    schema[0].values.forEach((col) => {
      const name = (col[1] + '').padEnd(14);
      const type = (col[2] + '').padEnd(18);
      const notnull = col[3] ? 'YES' : 'NO';
      const defval = col[4] !== null ? col[4] : '(无)';
      console.log(`  ${name}${type}${notnull.padEnd(8)}${defval}`);
    });
  });

  console.log('\n\n3. SQL语句执行结果');
  console.log('-'.repeat(40));

  console.log('\n-- 查询所有用户');
  const users = db.exec('SELECT uid, username, phone, balance, created_at FROM users');
  if (users.length > 0) {
    console.log('  uid | username  | phone       | balance | created_at');
    console.log('  ' + '-'.repeat(60));
    users[0].values.forEach((row) => {
      console.log(`  ${row[0]}    | ${(row[1]+'').padEnd(9)} | ${(row[2]+'').padEnd(11)} | ${row[3]}  | ${row[4]}`);
    });
  } else {
    console.log('  (无数据)');
  }

  console.log('\n-- 查询所有商品');
  const items = db.exec('SELECT item_id, seller_id, title, category, price, status, created_at FROM account_items');
  if (items.length > 0) {
    console.log('  item_id | seller_id | title          | category  | price | status | created_at');
    console.log('  ' + '-'.repeat(80));
    items[0].values.forEach((row) => {
      console.log(`  ${row[0]}        | ${row[1]}          | ${(row[2]+'').padEnd(14)} | ${(row[3]+'').padEnd(9)} | ${row[4]}  | ${row[5]}      | ${row[6]}`);
    });
  } else {
    console.log('  (无数据)');
  }

  console.log('\n-- 查询所有订单');
  const orders = db.exec('SELECT order_id, buyer_id, item_id, amount, pay_status, delivery_status, create_time FROM orders');
  if (orders.length > 0) {
    console.log('  order_id | buyer_id | item_id | amount | pay_status | delivery_status | create_time');
    console.log('  ' + '-'.repeat(80));
    orders[0].values.forEach((row) => {
      console.log(`  ${row[0]}         | ${row[1]}         | ${row[2]}        | ${row[3]}  | ${row[4]}           | ${row[5]}               | ${row[6]}`);
    });
  } else {
    console.log('  (无数据)');
  }

  console.log('\n-- 查询所有评价');
  const reviews = db.exec('SELECT review_id, order_id, reviewer_id, rating, comment, created_at FROM reviews');
  if (reviews.length > 0) {
    console.log('  review_id | order_id | reviewer_id | rating | comment | created_at');
    console.log('  ' + '-'.repeat(60));
    reviews[0].values.forEach((row) => {
      console.log(`  ${row[0]}          | ${row[1]}         | ${row[2]}            | ${row[4]}      | ${row[5]} | ${row[6]}`);
    });
  } else {
    console.log('  (无数据)');
  }

  console.log('\n\n========================================');
  console.log('  数据库查询完成');
  console.log('========================================');

  db.close();
}

main().catch(console.error);