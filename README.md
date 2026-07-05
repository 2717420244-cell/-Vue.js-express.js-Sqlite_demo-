# qianduan — 前端开发实践仓库

## 项目简介

qianduan 是一个聚焦前端开发技术栈的实践性项目仓库，涵盖从入门到进阶的多个实验模块，围绕一个完整的**游戏账号交易系统**展开前后端协同开发。

## 核心技术路线

| 层级 | 技术栈 | 说明 |
|------|--------|------|
| 前端 | Vue 3 (Composition API) + Vite + Vue Router 4 + Pinia + Axios + Element Plus | SPA 单页面应用 |
| 后端 | Node.js + Express.js + RESTful API + JWT + sql.js | 轻量级 REST API |
| 数据库 | SQLite (in-memory via WebAssembly) | 无依赖本地持久化 |

## 目录结构

```
qianduan/
├── src/                          # Vue 3 前端源码
│   ├── components/               # 公共组件
│   ├── views/                    # 页面视图
│   ├── stores/                   # Pinia 状态管理
│   ├── router/                   # Vue Router 路由配置
│   └── utils/                    # 前端工具函数
├── public/                       # 静态资源
├── index.html                    # Vite 入口 HTML
├── vite.config.js                # Vite 构建配置
│
├── account-trading-api/          # 游戏账号交易系统后端 API
│   ├── app.js                    # Express 应用入口
│   ├── config/database.js        # SQLite 数据库初始化
│   ├── controllers/              # 业务逻辑控制器
│   │   ├── authController.js     # 用户注册/登录/个人信息
│   │   ├── itemController.js     # 商品 CRUD / 状态管理
│   │   ├── orderController.js    # 订单创建/支付/交付/确认收货
│   │   ├── reviewController.js   # 评价提交与查询
│   │   ├── adminController.js    # 管理员功能
│   │   ├── aiController.js       # AI 估价功能
│   │   └── walletController.js   # 钱包管理
│   ├── models/                   # 数据模型层
│   ├── routes/                   # API 路由定义
│   ├── middlewares/              # JWT 认证 / 错误处理中间件
│   ├── utils/                    # 统一响应格式 / JWT 工具函数
│   ├── test/                     # 测试脚本
│   └── data/account_trading.db   # SQLite 数据库文件
│
├── exp1/                         # Node.js 基础工具实验
│   ├── calculator.js             # 四则运算计算器
│   ├── imageDownloader.js        # 图片下载器
│   └── insertion_sort.js         # 插入排序算法实现
│
├── exp2/                         # Express.js 实验 & API 规范
│   ├── app.js                    # 模块化路由（users/products）
│   ├── API_SPECIFICATION.md      # RESTful API 接口设计规范
│   ├── architecture.html         # 系统架构图（SVG 交互式页面）
│   ├── sqlite_demo/              # Express + SQLite 学生管理系统
│   └── req_res_demo/             # 请求/响应对象演示
│
├── demos/                        # Vue 3 模板语法演示
│   ├── vue3-component-demo.html
│   ├── vue3-reactive-demo.html
│   └── vue3-template-directives.html
│
├── scripts/reports/              # 报告生成脚本
│   ├── generate_report.js        # Express.js 后端报告生成
│   ├── generate_vue_report.js    # Vue 3 前端架构报告生成
│   └── generate_deployment_report.js  # 部署报告生成
│
├── readme/                       # 课程实验说明文档
└── README.md                     # 项目说明文档
```

## 核心模块说明

### account-trading-api（游戏账号交易系统后端）

完整的 REST API 系统，包含七大功能模块：

| 模块 | 路由前缀 | 主要功能 |
|------|----------|----------|
| 用户认证 | `/api/auth` | 注册、登录、个人信息管理、JWT Token |
| 商品管理 | `/api/items` | 商品列表/详情/发布/编辑/删除/状态更新 |
| 订单交易 | `/api/orders` | 创建订单、支付、交付、确认收货、倒计时 |
| 商品评价 | `/api/reviews` | 评价列表、提交评价 |
| 管理员 | `/api/admin` | 用户管理、商品审核、订单管理 |
| AI 估价 | `/api/ai` | 基于 DeepSeek AI 的账号智能估价 |
| 钱包 | `/api/wallet` | 余额管理、充值、提现 |

**API 根地址：** `http://localhost:3001/api`

**统一响应格式：**
```json
{
  "success": true,
  "code": 200,
  "message": "操作成功",
  "data": { ... }
}
```

### exp2/architecture.html

交互式 SVG 架构图，展示 Vue 3 前端 → Express.js 后端 → SQLite 数据库的三层架构关系，以及数据库 E-R 图和物理模型（SQL 建表语句）。

### scripts/reports/ 报告生成脚本

使用 Node.js + `docx` 库自动生成 Word 格式报告：

```bash
node scripts/reports/generate_report.js            # 生成 Express.js 后端 API 报告
node scripts/reports/generate_vue_report.js        # 生成 Vue 3 前端架构报告
node scripts/reports/generate_deployment_report.js # 生成部署报告
```

## 快速启动

### 启动前端（Vue 3 + Vite）

```bash
npm install
npm run dev
# 开发服务器运行于 http://localhost:5173
```

### 启动后端 API

```bash
cd account-trading-api
npm install
node app.js
# 服务器运行于 http://localhost:3001
```

### 接口测试示例

```bash
# 用户注册
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","username":"testuser","password":"123456"}'

# 用户登录
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","password":"123456"}'

# 获取商品列表
curl http://localhost:3001/api/items
```

## 技术要点

- **前后端分离**：前端 Vue 3 SPA 通过 Axios 调用后端 REST API
- **JWT 认证**：需认证接口通过 `Authorization: Bearer <token>` 请求头携带 Token
- **MVC 架构**：后端按 Controller / Model / Route 分层，职责清晰
- **SQLite 持久化**：使用 sql.js 通过 WebAssembly 实现无外部依赖的数据库操作
- **懒加载路由**：Vue Router 配置所有页面组件采用动态 `import()` 懒加载
- **Pinia 状态管理**：按功能领域划分 Store（auth / items / orders / reviews）
- **AI 智能估价**：集成 DeepSeek AI，根据账号属性自动生成市场估价
- **订单倒计时**：未支付订单自动倒计时过期处理
- **钱包系统**：支持余额管理、充值和提现操作

## 技术路线图

```
Node.js 基础 (exp1)
    ↓
Express.js 路由与中间件 (exp2)
    ↓
RESTful API 设计 (API_SPECIFICATION.md)
    ↓
游戏账号交易系统后端 (account-trading-api)
    ↓
Vue 3 前端应用 ← architecture.html 设计
    ↓
前后端联调与项目文档输出
```