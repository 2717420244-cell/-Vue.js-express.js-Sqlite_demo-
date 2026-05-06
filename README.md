# qianduan — 前端开发实践仓库

## 项目简介

qianduan 是一个聚焦前端开发技术栈的实践性项目仓库，涵盖从入门到进阶的多个实验模块，围绕一个完整的**游戏账号交易系统**展开前后端协同开发。

## 核心技术路线

| 层级 | 技术栈 | 说明 |
|------|--------|------|
| 前端 | Vue 3 (Composition API) + Vue Router 4 + Pinia + Axios + Element Plus | SPA 单页面应用 |
| 后端 | Node.js + Express.js + RESTful API + JWT + sql.js | 轻量级 REST API |
| 数据库 | SQLite (in-memory via WebAssembly) | 无依赖本地持久化 |

## 目录结构

```
qianduan/
├── account-trading-api/          # 游戏账号交易系统后端 API
│   ├── app.js                    # Express 应用入口
│   ├── config/database.js        # SQLite 数据库初始化
│   ├── controllers/               # 业务逻辑控制器
│   │   ├── authController.js     # 用户注册/登录/个人信息
│   │   ├── itemController.js     # 商品 CRUD / 状态管理
│   │   ├── orderController.js    # 订单创建/支付/交付/确认收货
│   │   └── reviewController.js   # 评价提交与查询
│   ├── models/                   # 数据模型层
│   ├── routes/                   # API 路由定义
│   ├── middlewares/              # JWT 认证 / 错误处理中间件
│   ├── utils/                    # 统一响应格式 / JWT 工具函数
│   └── data/account_trading.db  # SQLite 数据库文件
│
├── exp1/                         # Node.js 基础工具实验
│   ├── calculator.js             # 四则运算计算器
│   ├── imageDownloader.js        # 图片下载器
│   └── insertion_sort.js         # 插入排序算法实现
│
├── exp2/                         # Express.js 路由学习实验
│   ├── app.js                    # 模块化路由（users/products）
│   ├── sqlite_demo/               # Express + SQLite 学生管理系统
│   └── req_res_demo/              # 请求/响应对象演示
│
├── API_SPECIFICATION.md          # RESTful API 接口设计规范
├── architecture.html             # 系统架构图（SVG 交互式页面）
├── generate_report.js            # Express.js 后端报告生成脚本
├── generate_vue_report.js        # Vue 3 前端架构报告生成脚本
└── README.md                     # 项目说明文档
```

## 核心模块说明

### account-trading-api（游戏账号交易系统后端）

完整的 REST API 系统，包含四大功能模块：

| 模块 | 路由前缀 | 主要功能 |
|------|----------|----------|
| 用户认证 | `/api/auth` | 注册、登录、个人信息管理、JWT Token |
| 商品管理 | `/api/items` | 商品列表/详情/发布/编辑/删除/状态更新 |
| 订单交易 | `/api/orders` | 创建订单、支付、交付、确认收货 |
| 商品评价 | `/api/reviews` | 评价列表、提交评价 |

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

### architecture.html

交互式 SVG 架构图，展示 Vue 3 前端 → Express.js 后端 → SQLite 数据库的三层架构关系，以及数据库 E-R 图和物理模型（SQL 建表语句）。

### 报告生成脚本

使用 Node.js + `docx` 库自动生成 Word 格式报告：

```bash
node generate_report.js        # 生成 Express.js 后端 API 报告
node generate_vue_report.js   # 生成 Vue 3 前端架构报告
```

## 快速启动

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
- **SQLite in-memory**：使用 sql.js 通过 WebAssembly 实现无外部依赖的数据库操作
- **懒加载路由**：Vue Router 配置所有页面组件采用动态 `import()` 懒加载
- **Pinia 状态管理**：按功能领域划分 Store（auth / items / orders / reviews）

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