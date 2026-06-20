const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'account_trading.db');
let db = null;

async function initDatabase() {
  const SQL = await initSqlJs();
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }

  createTables();
  migrateDatabase();
  saveDatabase();
  return db;
}

function createTables() {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    uid INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    phone VARCHAR(11) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role TEXT DEFAULT 'user' NOT NULL,
    real_name VARCHAR(20),
    avatar VARCHAR(255) DEFAULT '',
    balance DECIMAL(10,2) DEFAULT 0.00,
    frozen DECIMAL(10,2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS account_items (
    item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT, images TEXT,
    status INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    sold_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(uid)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    buyer_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    pay_status INTEGER DEFAULT 0,
    delivery_status INTEGER DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    finish_time DATETIME,
    FOREIGN KEY (buyer_id) REFERENCES users(uid),
    FOREIGN KEY (item_id) REFERENCES account_items(item_id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS reviews (
    review_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    reviewer_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (reviewer_id) REFERENCES users(uid)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    tx_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL DEFAULT 0,
    related_id INTEGER,
    remark TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(uid)
  )`);
}

function migrateDatabase() {
  // 兼容旧库：添加 role 列
  try {
    const info = db.exec("PRAGMA table_info(users)");
    if (info.length > 0) {
      const cols = info[0].values.map(r => r[1]);
      if (!cols.includes('role')) {
        db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user' NOT NULL");
        console.log('数据库迁移: 已添加 role 列');
      }
      if (!cols.includes('frozen')) {
        db.run("ALTER TABLE users ADD COLUMN frozen DECIMAL(10,2) DEFAULT 0.00");
        // 给现有用户充点钱方便测试
        db.run("UPDATE users SET balance = 10000 WHERE balance = 0");
        console.log('数据库迁移: 已添加 frozen 列 + 每人充值 10000 元');
      }
    }
  } catch (e) {
    console.log('数据库迁移: ', e.message);
  }
}

function saveDatabase() {
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
}

function getDatabase() { return db; }

module.exports = { initDatabase, getDatabase, saveDatabase };
