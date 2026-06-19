/**
 * 设置管理员脚本
 * 用法：node setAdmin.js <手机号>
 * 示例：node setAdmin.js 13800138000
 */
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'account_trading.db');
const phone = process.argv[2];

if (!phone) {
  console.log('用法: node setAdmin.js <手机号>');
  console.log('示例: node setAdmin.js 13800138000');
  process.exit(1);
}

(async () => {
  const SQL = await initSqlJs();
  const buf = fs.readFileSync(DB_PATH);
  const db = new SQL.Database(buf);

  const stmt = db.prepare('SELECT uid, username, phone FROM users WHERE phone = ?');
  stmt.bind([phone]);
  if (stmt.step()) {
    const u = stmt.getAsObject();
    stmt.free();
    db.run("UPDATE users SET role = 'admin' WHERE uid = ?", [u.uid]);
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
    console.log(`已将用户「${u.username}」(UID: ${u.uid}) 设置为管理员`);
  } else {
    stmt.free();
    console.log(`未找到手机号 ${phone} 的用户，请先注册`);
    // 创建一个管理员账号
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('admin123', 10);
    db.run("INSERT INTO users (username, phone, password, role) VALUES (?, ?, ?, 'admin')",
      ['admin', phone, hash]);
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
    console.log(`已创建管理员账号: admin / admin123 / ${phone}`);
  }

  db.close();
})();
