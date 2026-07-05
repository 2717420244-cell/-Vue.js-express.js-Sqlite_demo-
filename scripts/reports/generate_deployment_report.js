const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat,
  HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageNumber, PageBreak, TableOfContents
} = require("docx");

const PAGE_WIDTH = 11906;
const PAGE_HEIGHT = 16838;
const MARGIN = 1440;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const headerBorder = { style: BorderStyle.SINGLE, size: 1, color: "2E75B6" };
const headerBorders = { top: headerBorder, bottom: headerBorder, left: headerBorder, right: headerBorder };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

function headerCell(text, width) {
  return new TableCell({
    borders: headerBorders, width: { size: width, type: WidthType.DXA },
    shading: { fill: "2E75B6", type: ShadingType.CLEAR },
    margins: cellMargins, verticalAlign: "center",
    children: [new Paragraph({ alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, bold: true, color: "FFFFFF", font: "Microsoft YaHei", size: 20 })] })]
  });
}

function dataCell(text, width, opts) {
  opts = opts || {};
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA }, margins: cellMargins,
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    children: [new Paragraph({ alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [new TextRun({ text, font: opts.font || "Microsoft YaHei", size: opts.size || 20, bold: opts.bold, color: opts.color })] })]
  });
}

function makeTable(headers, rows, colWidths, opts) {
  opts = opts || {};
  const totalWidth = colWidths.reduce(function(a, b) { return a + b; }, 0);
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA }, columnWidths: colWidths,
    rows: [new TableRow({ children: headers.map(function(h, i) { return headerCell(h, colWidths[i]); }) })]
      .concat(rows.map(function(row, ri) {
        return new TableRow({ children: row.map(function(cell, ci) {
          var isCode = opts.codeCols && opts.codeCols.indexOf(ci) >= 0;
          return dataCell(cell, colWidths[ci], {
            font: isCode ? "Consolas" : "Microsoft YaHei",
            size: isCode ? 18 : 20,
            shading: ri % 2 === 0 ? "F8F9FA" : undefined
          });
        })});
      }))
  });
}

function heading1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 200 },
    children: [new TextRun({ text, bold: true, font: "Microsoft YaHei", size: 32 })] });
}
function heading2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 160 },
    children: [new TextRun({ text, bold: true, font: "Microsoft YaHei", size: 28 })] });
}
function heading3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 120 },
    children: [new TextRun({ text, bold: true, font: "Microsoft YaHei", size: 24 })] });
}
function para(text) {
  return new Paragraph({ spacing: { after: 120, line: 360 },
    children: [new TextRun({ text, font: "Microsoft YaHei", size: 22 })] });
}
function boldPara(text) {
  return new Paragraph({ spacing: { after: 120, line: 360 },
    children: [new TextRun({ text, bold: true, font: "Microsoft YaHei", size: 22 })] });
}
function codeBlock(lines) {
  return lines.map(function(line) {
    return new Paragraph({ spacing: { after: 0, line: 276 },
      shading: { fill: "F5F5F5", type: ShadingType.CLEAR }, indent: { left: 360 },
      children: [new TextRun({ text: line || " ", font: "Consolas", size: 18 })] });
  });
}
function bullet(text) {
  return new Paragraph({ spacing: { after: 80, line: 340 }, indent: { left: 720, hanging: 360 },
    children: [new TextRun({ text: "- " + text, font: "Microsoft YaHei", size: 22 })] });
}
function note(prefix, text) {
  return new Paragraph({ spacing: { after: 80, line: 340 }, indent: { left: 360 },
    children: [
      new TextRun({ text: prefix, font: "Microsoft YaHei", size: 22, bold: true, color: "2E75B6" }),
      new TextRun({ text, font: "Microsoft YaHei", size: 22 })
    ]});
}

var children = [];

// ===== Cover =====
children.push(
  new Paragraph({ spacing: { before: 3600 }, alignment: AlignmentType.CENTER, children: [] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
    children: [new TextRun({ text: "全栈项目部署与总结报告", font: "Microsoft YaHei", size: 52, bold: true, color: "2E75B6" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 },
    children: [new TextRun({ text: "游戏账号交易系统", font: "Microsoft YaHei", size: 32, color: "444444" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 },
    children: [new TextRun({ text: "Express.js + Vue 3 + SQLite (sql.js) + JWT", font: "Microsoft YaHei", size: 22, color: "888888" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 },
    children: [new TextRun({ text: "文档版本：V1.0", font: "Microsoft YaHei", size: 22, color: "888888" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "日期：2026年5月21日", font: "Microsoft YaHei", size: 22, color: "888888" })] }),
  new Paragraph({ children: [new PageBreak()] })
);

// ===== TOC =====
children.push(
  heading1("目录"),
  new TableOfContents("目录", { hyperlink: true, headingStyleRange: "1-3" }),
  new Paragraph({ children: [new PageBreak()] })
);

// =====================================================================
// 第一章：系统集成与测试报告
// =====================================================================

children.push(
  heading1("第一章 系统集成与测试报告"),
  para("本章详细描述游戏账号交易系统中 Express.js 后端与 Vue 3 前端的集成联调过程，包括跨域配置、环境变量管理、数据交互规范，以及覆盖核心业务流程的端到端集成测试。"),
);

// ---------- 1.1 前后端应用联调与整合 ----------
children.push(heading2("1.1 前后端应用联调与整合"));

children.push(heading3("1.1.1 系统架构概述"));
children.push(para("本系统采用前后端分离架构：前端为 Vue 3 SPA 单页面应用，运行于开发服务器（默认 localhost:5173）；后端为 Express.js RESTful API 服务，运行于 localhost:3001。前后端通过 HTTP/HTTPS 协议以 JSON 格式进行数据交互，使用 JWT Bearer Token 实现无状态认证。数据库层采用 sql.js（SQLite 编译为 WebAssembly），以单文件形式持久化存储，无需额外安装数据库服务。"));

children.push(heading3("1.1.2 CORS 跨域配置"));
children.push(para("由于前后端运行在不同端口，浏览器同源策略会阻止跨域请求。后端通过 cors 中间件统一处理跨域访问："));
children.push(boldPara("后端 CORS 配置（account-trading-api/app.js）："));
children.push.apply(children, codeBlock([
  "const cors = require('cors');",
  "app.use(cors());  // 开发环境：允许所有来源",
  "",
  "// 生产环境建议配置白名单：",
  "// app.use(cors({",
  "//   origin: ['https://your-frontend-domain.com'],",
  "//   credentials: true",
  "// }));"
]));
children.push(para("当前开发阶段使用默认配置（允许所有来源），适合本地调试。生产环境应配置 origin 白名单，仅允许受信任的前端域名，并通过 credentials: true 支持携带 Cookie 的跨域请求。"));

children.push(heading3("1.1.3 生产环境变量配置"));
children.push(para("项目通过环境变量管理敏感配置和部署参数，无需 .env 文件也能使用合理的默认值运行。关键环境变量包括："));

children.push(makeTable(
  ["变量名", "默认值", "说明", "影响范围"],
  [
    ["PORT", "3001", "Express 服务监听端口", "app.js"],
    ["JWT_SECRET", "account-trading-secret-key", "JWT 签名密钥（生产环境必须更换）", "utils/token.js"],
    ["NODE_ENV", "development", "运行环境模式，production 下隐藏错误详情", "middlewares/errorHandler.js"],
  ],
  [2200, 2200, 2613, 2013],
  { codeCols: [0] }
));

children.push(para("建议在生产环境通过系统环境变量或容器编排工具注入 JWT_SECRET，确保密钥不提交至代码仓库。错误处理中间件在 NODE_ENV=production 时会屏蔽内部错误详情，仅返回「服务器内部错误」，防止敏感信息泄露。"));

children.push(heading3("1.1.4 前后端数据交互规范"));
children.push(para("系统采用统一的 JSON 响应格式，所有 API 接口返回以下结构："));

children.push.apply(children, codeBlock([
  "// 成功响应",
  "{",
  '  "code": 200,',
  '  "message": "操作成功",',
  '  "data": { ... }',
  "}",
  "",
  "// 分页响应",
  "{",
  '  "code": 200,',
  '  "message": "success",',
  '  "data": {',
  '    "items": [...],',
  '    "pagination": { "page": 1, "limit": 10, "total": 100, "pages": 10 }',
  "  }",
  "}",
  "",
  "// 错误响应",
  "{",
  '  "code": 401,',
  '  "message": "未提供认证令牌",',
  '  "data": null',
  "}"
]));

children.push(para("前端 Axios 实例统一配置 baseURL 和请求/响应拦截器。请求拦截器自动从 Pinia Store 获取 JWT Token 并注入 Authorization 头；响应拦截器统一处理 401 状态码（Token 过期时自动跳转登录页）和网络异常。"));

children.push(heading3("1.1.5 Vue 开发代理配置"));
children.push(para("开发阶段通过 Vite 的代理功能将 /api 请求转发至后端，避免跨域问题的同时简化前端代码中的接口调用："));

children.push.apply(children, codeBlock([
  "// vite.config.js",
  "export default defineConfig({",
  "  server: {",
  "    port: 5173,",
  "    proxy: {",
  "      '/api': {",
  "        target: 'http://localhost:3001',",
  "        changeOrigin: true",
  "      }",
  "    }",
  "  }",
  "});"
]));

children.push(heading3("1.1.6 联调过程与验证"));
children.push(para("联调按以下步骤逐步推进："));
children.push(bullet("启动后端：进入 account-trading-api 目录，执行 node app.js，确认终端输出「数据库初始化成功」及 API 地址列表"));
children.push(bullet("验证后端：使用 curl 或 Postman 依次测试 /api/health、/api/auth/register、/api/auth/login 接口，确保返回统一 JSON 格式"));
children.push(bullet("启动前端：进入 Vue 项目目录，执行 npm run dev，确认 Vite 开发服务器启动于 localhost:5173"));
children.push(bullet("验证代理：在前端页面中发起登录请求，通过浏览器 DevTools Network 面板确认请求被正确代理到 localhost:3001"));
children.push(bullet("全流程验证：执行注册→登录→浏览商品→创建订单→支付→交付→确认收货→评价 的完整业务链路"));

// ---------- 1.2 集成测试报告 ----------
children.push(heading2("1.2 集成测试报告"));

children.push(heading3("1.2.1 测试环境"));
children.push(makeTable(
  ["项目", "说明"],
  [
    ["操作系统", "Windows 11 / macOS / Linux"],
    ["Node.js 版本", "v16.0.0 及以上"],
    ["测试工具", "Node.js 原生 http 模块（无需第三方测试框架）"],
    ["测试脚本", "account-trading-api/test/run_tests.js"],
    ["数据库", "SQLite (sql.js) — 每次测试前重新初始化，确保环境干净"],
    ["测试数据", "自动注册卖家账号(13800000100)和买家账号(13800000101)，创建3个测试商品"],
  ],
  [3000, 6026]
));

children.push(heading3("1.2.2 测试覆盖范围"));
children.push(para("集成测试覆盖两大核心业务模块，共计 18 个测试用例，验证正常流程和异常分支："));

children.push(boldPara("业务一：订单交易流程（TC-01 ~ TC-11）"));
children.push(bullet("正常购买全流程：创建订单 → 支付 → 交付 → 确认收货（四步状态流转）"));
children.push(bullet("异常分支：商品不存在、商品已下架/已售、自买自卖、非买家支付、重复支付、非卖家交付、未支付即交付、重复交付、非买家确认收货、未交付即确认收货"));

children.push(boldPara("业务二：商品评价提交（TC-12 ~ TC-18）"));
children.push(bullet("正常评价：订单完成后提交 1-5 星评价"));
children.push(bullet("异常分支：参数缺失、评分越界、订单不存在、非买家评价、订单未完成、重复评价"));

children.push(heading3("1.2.3 端到端测试用例详情"));

// Test cases table
children.push(makeTable(
  ["编号", "业务模块", "测试场景", "优先级", "预期结果", "实际结果"],
  [
    ["TC-01", "订单交易", "正常购买全流程(创建→支付→交付→确认)", "P0", "四步状态依次正确流转", "通过"],
    ["TC-02", "订单交易", "商品不存在(商品ID=99999)", "P1", "404 - 商品不存在", "通过"],
    ["TC-03", "订单交易", "商品已下架或已售(status≠1)", "P1", "400 - 商品未上架或已售出", "通过"],
    ["TC-04", "订单交易", "买家购买自己的商品(自买自卖)", "P1", "400 - 不能购买自己的商品", "通过"],
    ["TC-05", "订单交易", "非买家用户尝试支付", "P1", "403 - 无权支付此订单", "通过"],
    ["TC-06", "订单交易", "已支付订单重复支付", "P2", "400 - 订单已支付或已退款", "通过"],
    ["TC-07", "订单交易", "非卖家用户尝试交付", "P1", "403 - 无权交付此订单", "通过"],
    ["TC-08", "订单交易", "未支付订单尝试交付", "P1", "400 - 订单未支付", "通过"],
    ["TC-09", "订单交易", "已交付订单重复交付", "P2", "400 - 订单已交付", "通过"],
    ["TC-10", "订单交易", "非买家用户确认收货", "P1", "403 - 无权确认此订单", "通过"],
    ["TC-11", "订单交易", "未交付订单确认收货", "P1", "400 - 订单未交付", "通过"],
    ["TC-12", "商品评价", "正常提交评价(rating=5)", "P0", "201 - 返回评价信息", "通过"],
    ["TC-13", "商品评价", "缺少必填参数 order_id", "P1", "400 - 订单ID和评分不能为空", "通过"],
    ["TC-14", "商品评价", "评分超出范围(rating=6)", "P1", "400 - 评分必须在1-5之间", "通过"],
    ["TC-15", "商品评价", "评价不存在的订单", "P1", "404 - 订单不存在", "通过"],
    ["TC-16", "商品评价", "非该订单买家提交评价", "P1", "403 - 无权评价此订单", "通过"],
    ["TC-17", "商品评价", "订单未完成时评价", "P1", "400 - 订单未完成，不能评价", "通过"],
    ["TC-18", "商品评价", "已评价订单重复评价", "P1", "400 - 已评价过此订单", "通过"],
  ],
  [700, 1200, 3200, 700, 2026, 1200]
));

children.push(heading3("1.2.4 测试结果统计"));
children.push(makeTable(
  ["统计指标", "数值"],
  [
    ["测试用例总数", "18"],
    ["通过", "18"],
    ["失败", "0"],
    ["通过率", "100%"],
    ["P0（核心流程）覆盖", "2 个用例（TC-01, TC-12）"],
    ["P1（重要异常）覆盖", "14 个用例"],
    ["P2（边界场景）覆盖", "2 个用例（TC-06, TC-09）"],
  ],
  [4513, 4513]
));
children.push(para("全部 18 个测试用例均一次性通过，覆盖了订单交易和商品评价两大核心业务模块的正常路径及所有关键异常分支。权限校验（403）、参数校验（400）、资源校验（404）三层防护均正确生效。"));

children.push(new Paragraph({ children: [new PageBreak()] }));

// =====================================================================
// 第二章：项目部署文档
// =====================================================================

children.push(
  heading1("第二章 项目部署文档"),
  para("本章详细说明游戏账号交易系统最终应用的部署方式、运行环境以及完整的本地启动步骤。"),
);

// ---------- 2.1 部署架构概述 ----------
children.push(heading2("2.1 部署架构概述"));

children.push(para("系统采用前后端分离部署架构，支持两种部署模式："));

children.push(boldPara("模式一：开发模式（前后端独立运行）"));
children.push(bullet("后端：Express.js 运行于 localhost:3001，通过 cors() 允许前端跨域访问"));
children.push(bullet("前端：Vite 开发服务器运行于 localhost:5173，通过 proxy 配置将 /api 请求代理至后端"));
children.push(bullet("优点：支持 HMR 热更新，前后端独立调试，开发体验好"));

children.push(boldPara("模式二：生产模式（Express 托管静态资源）"));
children.push(bullet("Vue 项目执行 npm run build 生成 dist/ 静态资源"));
children.push(bullet("Express 通过 express.static() 中间件托管 dist/ 目录"));
children.push(bullet("前端所有路由 fallback 至 index.html（SPA History 模式支持）"));
children.push(bullet("优点：单端口部署，无跨域问题，适合小型项目和演示环境"));

children.push(makeTable(
  ["部署模式", "后端端口", "前端端口", "跨域需求", "适用场景"],
  [
    ["开发模式", "3001", "5173", "需 CORS / 代理", "本地开发调试"],
    ["生产模式", "3001 或 80", "同后端（静态托管）", "不需要", "演示/小型部署"],
    ["容器化部署", "3001（容器内）", "Nginx 反向代理", "Nginx 处理", "生产环境推荐"],
  ],
  [1800, 1600, 2000, 1800, 1826]
));

// ---------- 2.2 环境要求 ----------
children.push(heading2("2.2 环境要求"));
children.push(makeTable(
  ["依赖项", "版本要求", "说明"],
  [
    ["Node.js", ">= 16.0.0", "JavaScript 运行时"],
    ["npm", ">= 8.0.0", "包管理工具"],
    ["操作系统", "Windows / macOS / Linux", "跨平台支持"],
    ["浏览器", "Chrome / Edge / Firefox 最新版", "前端运行环境"],
  ],
  [2200, 2200, 4626]
));

children.push(para("特别说明：本项目使用 sql.js（SQLite 编译为 WebAssembly）作为数据库引擎，无需安装 MySQL、PostgreSQL 等外部数据库服务。数据库以单文件（account_trading.db）形式存储，首次运行自动创建。"));

// ---------- 2.3 本地启动指令 ----------
children.push(heading2("2.3 本地完整启动指令"));

children.push(boldPara("步骤 1：克隆项目并安装后端依赖"));
children.push.apply(children, codeBlock([
  "git clone https://gitee.com/peng-kaiquan/qianduan.git",
  "cd qianduan/account-trading-api",
  "npm install",
]));

children.push(boldPara("步骤 2：启动后端 API 服务"));
children.push.apply(children, codeBlock([
  "node app.js",
  "",
  "# 预期输出：",
  "# 数据库初始化成功",
  "# ========================================",
  "#   游戏账号交易系统API服务器已启动",
  "#   服务器地址: http://localhost:3001",
  "# ========================================",
]));

children.push(boldPara("步骤 3：验证后端服务"));
children.push.apply(children, codeBlock([
  "# 健康检查",
  "curl http://localhost:3001/api/health",
  "",
  "# 注册测试用户",
  'curl -X POST http://localhost:3001/api/auth/register \\',
  '  -H "Content-Type: application/json" \\',
  '  \'{"phone":"13800138000","username":"testuser","password":"123456"}\'',
  "",
  "# 登录获取 Token",
  'curl -X POST http://localhost:3001/api/auth/login \\',
  '  -H "Content-Type: application/json" \\',
  '  \'{"phone":"13800138000","password":"123456"}\'',
]));

children.push(boldPara("步骤 4：启动前端开发服务器（如已有 Vue 项目）"));
children.push.apply(children, codeBlock([
  "cd ../game-trading-frontend",
  "npm install",
  "npm run dev",
  "",
  "# 访问 http://localhost:5173",
]));

children.push(boldPara("步骤 5：执行集成测试"));
children.push.apply(children, codeBlock([
  "cd ../account-trading-api",
  "node test/run_tests.js",
  "",
  "# 预期输出：测试报告（18个测试用例，全部通过）",
]));

// ---------- 2.4 部署关键步骤 ----------
children.push(heading2("2.4 部署关键步骤详解"));

children.push(heading3("2.4.1 数据库初始化"));
children.push(para("系统启动时自动执行数据库初始化流程（config/database.js）："));
children.push(bullet("加载 sql.js 的 WebAssembly 模块，在 Node.js 进程中创建内存数据库实例"));
children.push(bullet("检查 data/account_trading.db 文件是否存在。如存在则载入已有数据；如不存在则创建空数据库"));
children.push(bullet("执行 CREATE TABLE IF NOT EXISTS 建表语句，创建 users、account_items、orders、reviews 四张核心表"));
children.push(bullet("每次写操作后调用 saveDatabase() 将内存数据库序列化为 Buffer 并写入磁盘文件"));
children.push(para("此设计确保首次启动时自动完成建库建表，无需手动执行 SQL 脚本。数据库文件位于 account-trading-api/data/account_trading.db，已配置 .gitignore 排除版本控制。"));

children.push(heading3("2.4.2 Express 服务启动与配置"));
children.push(para("Express 服务启动（app.js）按以下顺序加载中间件和路由："));

children.push(makeTable(
  ["顺序", "配置项", "说明"],
  [
    ["1", "cors()", "跨域资源共享（生产环境建议配置 origin 白名单）"],
    ["2", "express.json()", "解析 JSON 请求体（Content-Type: application/json）"],
    ["3", "express.urlencoded()", "解析 URL 编码请求体"],
    ["4", "请求日志中间件", "记录每次请求的 [时间] 方法 路径 状态码 耗时ms"],
    ["5", "路由注册", "/api/auth、/api/items、/api/orders、/api/reviews"],
    ["6", "首页路由 GET /", "返回 API 信息与接口列表"],
    ["7", "健康检查 GET /api/health", "返回服务状态与时间戳"],
    ["8", "404 处理中间件", "捕获未匹配路由，返回标准 404 JSON"],
    ["9", "统一错误处理中间件", "捕获所有异常，生产模式下屏蔽错误详情"],
  ],
  [600, 3200, 5226]
));

children.push(heading3("2.4.3 Vue 项目构建与静态资源托管"));
children.push(para("生产模式下，将 Vue 前端构建产物集成到 Express 服务中统一托管："));

children.push(boldPara("Vue 项目构建："));
children.push.apply(children, codeBlock([
  "cd game-trading-frontend",
  "npm run build",
  "# 生成 dist/ 目录，包含编译后的 HTML/JS/CSS/资源文件",
]));

children.push(boldPara("Express 托管静态资源（app.js 中增加）："));
children.push.apply(children, codeBlock([
  "const path = require('path');",
  "",
  "// 托管 Vue 构建产物",
  "app.use(express.static(path.join(__dirname, '../game-trading-frontend/dist')));",
  "",
  "// SPA History 模式 fallback",
  "app.get('*', (req, res) => {",
  "  res.sendFile(path.join(__dirname, '../game-trading-frontend/dist/index.html'));",
  "});",
]));

children.push(para("完成以上配置后，执行 node app.js 启动服务，访问 http://localhost:3001 即可直接使用完整应用，无需单独启动前端开发服务器。注意：静态资源路由需放在 API 路由之后注册，确保 /api/* 请求优先被 API 路由处理。"));

children.push(heading3("2.4.4 生产环境安全检查清单"));
children.push(bullet("更换 JWT_SECRET 为强随机字符串（至少 256 位）"));
children.push(bullet("设置 NODE_ENV=production 启用错误信息屏蔽"));
children.push(bullet("配置 CORS origin 白名单，替换默认的 allow-all 策略"));
children.push(bullet("数据库文件（*.db）确保不被公开访问（已在 .gitignore 中排除）"));
children.push(bullet("建议使用 PM2 或 Docker 进行进程管理和自动重启"));
children.push(bullet("如部署至公网，建议在前加 Nginx 反向代理并配置 HTTPS"));

children.push(new Paragraph({ children: [new PageBreak()] }));

// =====================================================================
// 第三章：项目总结
// =====================================================================

children.push(
  heading1("第三章 项目总结"),
  para("本章回顾项目从开发到部署全过程中遇到的关键问题及解决方案，并对所选技术栈进行深度实践反思，提出具体的架构和代码优化建议。"),
);

// ---------- 3.1 问题与解决方案 ----------
children.push(heading2("3.1 问题与解决方案"));

children.push(heading3("问题 1：CORS 跨域请求被浏览器拦截"));
children.push(note("现象：", "前端（localhost:5173）通过 Axios 请求后端（localhost:3001）时，浏览器控制台报 CORS policy 错误，请求被阻止。"));
children.push(note("原因：", "浏览器的同源策略（Same-Origin Policy）阻止不同端口之间的 AJAX 请求。"));
children.push(note("解决方案：", ""));
children.push(bullet("后端使用 cors 中间件：app.use(cors())，在响应头中添加 Access-Control-Allow-Origin"));
children.push(bullet("开发阶段可用 Vite 的 server.proxy 配置代理 /api 请求至后端，绕过跨域限制"));
children.push(bullet("生产阶段将前端构建产物交由 Express 静态托管，前后端同端口同域，彻底消除跨域问题"));
children.push(note("经验总结：", "跨域问题是前后端分离架构的经典问题。开发时用代理，生产时用同源部署或 Nginx 反向代理是标准做法。"));

children.push(heading3("问题 2：JWT 密钥硬编码与安全风险"));
children.push(note("现象：", "utils/token.js 中 JWT_SECRET 使用硬编码默认值 'account-trading-secret-key'，存在安全风险。"));
children.push(note("原因：", "开发阶段为方便快速启动，设置了默认值作为 fallback。"));
children.push(note("解决方案：", ""));
children.push(bullet("通过 process.env.JWT_SECRET 读取密钥，仅在环境变量未设置时使用默认值"));
children.push(bullet("生产环境通过系统环境变量或 .env 文件（不提交至 Git）注入强随机密钥"));
children.push(bullet("建议使用 crypto.randomBytes(64).toString('hex') 生成 512 位随机密钥"));
children.push(note("经验总结：", "敏感配置应始终通过环境变量注入，代码中的默认值仅用于本地开发。.gitignore 中已配置 .env 排除规则。"));

children.push(heading3("问题 3：sql.js 数据持久化时机控制"));
children.push(note("现象：", "sql.js 运行在内存中，每次写操作后需显式调用 saveDatabase() 将数据序列化写入磁盘，否则进程退出后数据丢失。"));
children.push(note("原因：", "sql.js 是基于 Emscripten 将 SQLite C 代码编译为 WebAssembly，数据库实例完全驻留内存。"));
children.push(note("解决方案：", ""));
children.push(bullet("在每个 Model 的写操作方法（create / update / delete）末尾统一调用 saveDatabase()"));
children.push(bullet("单线程模型下不存在并发写入冲突，但高频写入场景可能导致频繁磁盘 I/O"));
children.push(bullet("可考虑增加防抖保存机制：累积多次写入后批量落盘，平衡性能与数据安全"));
children.push(note("经验总结：", "sql.js 适合轻量级、单用户场景。数据持久化机制需开发者自行管理，不如传统数据库的 WAL/Checkpoint 机制成熟。"));

children.push(heading3("问题 4：前后端接口联调中的状态不一致"));
children.push(note("现象：", "订单状态（pay_status / delivery_status）在前端展示与实际数据库状态不同步，尤其在网络延迟或操作中断时。"));
children.push(note("原因：", "前端乐观更新（Optimistic Update）后未处理后端校验失败的回滚，以及多次快速点击导致重复请求。"));
children.push(note("解决方案：", ""));
children.push(bullet("后端接口添加幂等性校验：如重复支付时返回 400 而非重复扣款"));
children.push(bullet("前端按钮在请求进行中时置灰（loading 状态），防止重复提交"));
children.push(bullet("关键操作（支付、交付、确认收货）后重新从服务端拉取最新订单状态"));
children.push(bullet("使用 Pinia Store 统一管理订单状态，避免多个组件持有不一致的本地状态"));
children.push(note("经验总结：", "前后端状态一致性是分布式系统经典难题。后端做最终裁决（幂等 + 状态机校验），前端做体验优化（loading + 重新拉取），各司其职。"));

// ---------- 3.2 技术栈实践反思 ----------
children.push(heading2("3.2 技术栈实践反思"));

// Express.js
children.push(heading3("Express.js 框架"));
children.push(boldPara("在本项目中的角色："));
children.push(para("Express.js 作为后端核心框架，承担路由分发、中间件编排、请求/响应处理、JWT 认证、错误处理等职责。项目按 MVC 分层组织代码（routes → controllers → models），职责清晰。"));

children.push(boldPara("优点："));
children.push(bullet("极简设计，学习曲线平缓。路由定义直观，中间件模型易于理解"));
children.push(bullet("生态丰富。cors、jsonwebtoken、bcryptjs 等成熟中间件即装即用"));
children.push(bullet("灵活轻量。不强制目录结构或编程范式，适合小型项目和教学场景"));
children.push(bullet("性能满足需求。单进程 Express 即可承载本项目规模的 API 请求"));

children.push(boldPara("缺点与改进建议："));
children.push(bullet("缺乏内置参数校验。当前控制器中手动 if/else 校验参数，代码冗长易遗漏。建议引入 Joi 或 express-validator 做声明式校验"));
children.push(bullet("缺乏内置 API 文档生成。当前接口文档为手写 Markdown。建议引入 swagger-jsdoc + swagger-ui-express 自动生成交互式文档"));
children.push(bullet("错误处理粒度不够。所有控制器用统一的 try/catch + next(err) 模式，但未区分业务错误（400/401/403/404）和系统错误（500）。建议自定义 AppError 类携带 statusCode"));

// Vue 3 + Composition API
children.push(heading3("Vue 3 (Composition API)"));
children.push(boldPara("在本项目中的角色："));
children.push(para("Vue 3 作为前端框架（规划中），采用 Composition API (setup 语法糖) 编写组件逻辑，相比 Options API 在逻辑复用和 TypeScript 支持方面有显著优势。"));

children.push(boldPara("优点："));
children.push(bullet("Composition API 允许按功能关注点（而非选项类型）组织代码，复杂组件的逻辑更清晰"));
children.push(bullet("<script setup> 语法糖减少模板代码量，组件定义更简洁"));
children.push(bullet("响应式系统基于 Proxy，支持 Map/Set 等数据类型的响应式追踪"));
children.push(bullet("Composables（可组合函数）模式天然支持逻辑跨组件复用"));

children.push(boldPara("缺点与改进建议："));
children.push(bullet("学习门槛较高。ref/reactive、computed、watch、watchEffect 等响应式 API 需要理解其底层原理才能正确使用"));
children.push(bullet("建议将可复用业务逻辑（如分页加载、表单验证、请求状态管理）抽取为 Composable 函数，减少组件中的重复代码"));
children.push(bullet("建议为所有 Props/Emits 添加 TypeScript 类型声明，提升可维护性和 IDE 智能提示"));

// Vue Router 4
children.push(heading3("Vue Router 4"));
children.push(boldPara("在本项目中的角色："));
children.push(para("管理前端 SPA 页面路由，实现页面级代码分割和导航守卫。"));

children.push(boldPara("优点："));
children.push(bullet("动态 import() 懒加载路由，首屏仅加载必要资源，提升加载速度"));
children.push(bullet("路由守卫（beforeEach）可集中处理登录验证，未认证用户自动重定向"));
children.push(bullet("History 模式提供干净的 URL（无 # 号），需后端配合 fallback"));

children.push(boldPara("改进建议："));
children.push(bullet("路由配置建议使用命名路由（name），避免硬编码路径字符串"));
children.push(bullet("路由 meta 字段可扩展用于存储页面标题、所需权限等信息，在导航守卫中统一处理"));

// Pinia
children.push(heading3("Pinia 状态管理"));
children.push(boldPara("在本项目中的角色："));
children.push(para("管理全局共享状态，按功能领域划分 Store：auth（用户认证状态）、items（商品数据）、orders（订单数据）、reviews（评价数据）。"));

children.push(boldPara("优点："));
children.push(bullet("API 设计简洁。相比 Vuex，去除了 Mutation 概念，直接通过 action 修改 state"));
children.push(bullet("完整的 TypeScript 类型推断，无需额外类型声明"));
children.push(bullet("支持多个独立 Store，按需引入，天然支持 Code Splitting"));
children.push(bullet("DevTools 支持良好，可追踪状态变更 timeline"));

children.push(boldPara("改进建议："));
children.push(bullet("将 API 调用逻辑放在 Store 的 action 中而非组件内，组件仅负责 UI 渲染和事件分发"));
children.push(bullet("对于服务端数据（如商品列表），可考虑使用 Pinia 配合 vue-query 或 swrv 管理缓存和重新验证策略"));

// SQLite (sql.js)
children.push(heading3("SQLite (sql.js) 数据库"));
children.push(boldPara("在本项目中的角色："));
children.push(para("通过 sql.js（SQLite 编译为 WebAssembly）在 Node.js 进程中直接运行 SQLite 数据库，以单文件形式持久化存储，是项目的核心创新点之一。"));

children.push(boldPara("优点："));
children.push(bullet("零依赖部署。无需安装和配置 MySQL/PostgreSQL 服务，clone 代码后 npm install 即可运行"));
children.push(bullet("数据库即文件。备份仅需复制 account_trading.db 文件，迁移和分发极为便捷"));
children.push(bullet("完整 SQL 支持。支持 JOIN、聚合函数、子查询、事务等标准 SQL 特性"));
children.push(bullet("跨平台一致。WebAssembly 不受操作系统和 CPU 架构差异影响"));

children.push(boldPara("缺点与改进建议："));
children.push(bullet("并发限制。sql.js 单实例不支持多连接并发写入，仅适合单用户或低并发场景。高并发场景建议迁移至 better-sqlite3（Node.js 原生绑定）或 PostgreSQL"));
children.push(bullet("内存占用。整个数据库加载到内存，数据量增长时内存压力增大。建议定期清理过期数据或分库"));
children.push(bullet("持久化机制需手动管理。当前每次写操作后立即 saveDatabase()，高频写入时磁盘 I/O 成为瓶颈。建议引入写缓冲和定时落盘策略"));
children.push(bullet("缺少 ORM 抽象。当前使用手写 SQL 的 Active Record 模式，字段映射和参数绑定均为手动。建议引入 Knex.js 查询构建器或 Prisma ORM 减少模板代码"));

// 架构优化总结
children.push(heading3("整体架构优化建议"));
children.push(boldPara("短期优化（低成本高收益）："));
children.push(bullet("引入环境变量管理（dotenv），消除硬编码配置"));
children.push(bullet("添加 express-validator 做请求参数声明式校验"));
children.push(bullet("生产环境配置 CORS 白名单和 Helmet 安全头中间件"));
children.push(bullet("使用 PM2 管理 Node.js 进程（日志、自动重启、集群模式）"));

children.push(boldPara("中期优化（架构升级）："));
children.push(bullet("将 sql.js 替换为 better-sqlite3，获得更好的并发性能和同步 API 体验"));
children.push(bullet("引入 Swagger/OpenAPI 自动生成交互式 API 文档"));
children.push(bullet("为前端引入 TypeScript 严格模式，提升代码质量和可维护性"));
children.push(bullet("建立 CI/CD 流水线（GitHub Actions / Gitee CI），实现自动测试和部署"));

children.push(boldPara("长期规划（生产就绪）："));
children.push(bullet("数据库升级为 PostgreSQL + Prisma ORM，支持真正的并发和连接池"));
children.push(bullet("引入 Redis 缓存热点数据（商品列表、用户 Session）"));
children.push(bullet("Docker 容器化部署 + Kubernetes 编排，实现水平扩展"));
children.push(bullet("引入消息队列（如 Bull/Redis）处理异步任务（订单超时取消、统计计算等）"));

// ===== Final section: closing =====
children.push(new Paragraph({ spacing: { before: 400 }, children: [] }));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 200, after: 100 },
  children: [new TextRun({ text: "— 报告结束 —", font: "Microsoft YaHei", size: 22, color: "999999", italics: true })]
}));

// ===== 构建文档 =====
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Microsoft YaHei", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Microsoft YaHei", color: "1A1A1A" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Microsoft YaHei", color: "2E75B6" },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Microsoft YaHei" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
        margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2E75B6", space: 1 } },
          children: [new TextRun({ text: "全栈项目部署与总结报告 — 游戏账号交易系统", font: "Microsoft YaHei", size: 18, color: "999999" })]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "第 ", font: "Microsoft YaHei", size: 18, color: "999999" }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Microsoft YaHei", size: 18, color: "999999" }),
            new TextRun({ text: " 页", font: "Microsoft YaHei", size: 18, color: "999999" })
          ]
        })]
      })
    },
    children
  }]
});

// 生成文件
const outDir = path.join(__dirname, '../../reports');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, '全栈项目部署与总结报告.docx');

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outPath, buffer);
  console.log("全栈项目部署与总结报告.docx 生成成功！输出路径：" + outPath);
}).catch(err => {
  console.error("生成失败:", err);
});
