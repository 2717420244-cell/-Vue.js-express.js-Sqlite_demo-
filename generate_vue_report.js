const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat,
  HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageNumber, PageBreak, ImageRun
} = require("docx");

// ===== 常量 =====
const PAGE_WIDTH = 11906;
const PAGE_HEIGHT = 16838;
const MARGIN = 1440;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const hBorder = { style: BorderStyle.SINGLE, size: 1, color: "2E75B6" };
const hBorders = { top: hBorder, bottom: hBorder, left: hBorder, right: hBorder };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

// ===== 辅助函数 =====
function hCell(text, width) {
  return new TableCell({
    borders: hBorders, width: { size: width, type: WidthType.DXA },
    shading: { fill: "2E75B6", type: ShadingType.CLEAR },
    margins: cellMargins, verticalAlign: "center",
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: true, color: "FFFFFF", font: "Microsoft YaHei", size: 20 })] })]
  });
}
function dCell(text, width) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA }, margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, font: "Microsoft YaHei", size: 20 })] })]
  });
}
function cCell(text, width) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA }, margins: cellMargins,
    shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
    children: [new Paragraph({ children: [new TextRun({ text, font: "Consolas", size: 18 })] })]
  });
}
function makeTable(headers, rows, colWidths) {
  const total = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: total, type: WidthType.DXA }, columnWidths: colWidths,
    rows: [
      new TableRow({ children: headers.map((h, i) => hCell(h, colWidths[i])) }),
      ...rows.map(r => new TableRow({ children: r.map((c, i) => i === 0 ? cCell(c, colWidths[i]) : dCell(c, colWidths[i])) }))
    ]
  });
}

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 200 }, children: [new TextRun({ text, bold: true, font: "Microsoft YaHei", size: 32 })] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 160 }, children: [new TextRun({ text, bold: true, font: "Microsoft YaHei", size: 28 })] });
}
function h3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 120 }, children: [new TextRun({ text, bold: true, font: "Microsoft YaHei", size: 24 })] });
}
function p(text) {
  return new Paragraph({ spacing: { after: 120, line: 360 }, children: [new TextRun({ text, font: "Microsoft YaHei", size: 22 })] });
}
function codeBlock(lines) {
  return lines.map(line => new Paragraph({
    spacing: { after: 0, line: 276 },
    shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
    indent: { left: 360 },
    children: [new TextRun({ text: line, font: "Consolas", size: 18 })]
  }));
}

// ===== 构建 =====
const children = [];

// ==================== 封面 ====================
children.push(
  new Paragraph({ spacing: { before: 3000 }, alignment: AlignmentType.CENTER, children: [] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "Vue.js", font: "Microsoft YaHei", size: 52, bold: true, color: "2E75B6" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "前端架构与实现报告", font: "Microsoft YaHei", size: 52, bold: true, color: "2E75B6" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [new TextRun({ text: "基于游戏账号交易系统", font: "Microsoft YaHei", size: 28, color: "666666" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "技术栈：Vue 3 + Vue Router + Pinia + Axios + Element Plus", font: "Microsoft YaHei", size: 22, color: "888888" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "文档版本：V1.0", font: "Microsoft YaHei", size: 22, color: "888888" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "日期：2026年5月", font: "Microsoft YaHei", size: 22, color: "888888" })] }),
  new Paragraph({ children: [new PageBreak()] })
);

// ==================== 目录 ====================
children.push(
  h1("目录"),
  p("一、前端路由与架构设计"),
  p("  1.1 Vue Router 路由表"),
  p("  1.2 路由守卫与导航流程"),
  p("  1.3 Pinia Store 状态结构设计"),
  p("二、Vue.js 项目结构说明"),
  p("  2.1 目录组织"),
  p("  2.2 各目录职责说明"),
  p("三、核心实现展示"),
  p("  3.1 页面与组件"),
  p("  3.2 状态管理"),
  p("  3.3 API 集成"),
  p("四、界面与交互证明"),
  new Paragraph({ children: [new PageBreak()] })
);

// ==================== 第一章 ====================
children.push(h1("一、前端路由与架构设计"));
children.push(p("本前端应用基于 Vue 3 组合式 API（Composition API）构建，采用 Vue Router 4 进行路由管理、Pinia 进行状态管理、Axios 进行 HTTP 请求封装。整体架构采用 SPA（单页面应用）模式，前端通过 HTTP API 与后端 Express.js 服务器通信，实现前后端分离。"));
children.push(p("系统功能模块包括：用户认证、商品浏览与发布、订单管理与交易流程、评价系统。每个功能模块对应独立的路由页面和 Pinia Store 状态管理模块。"));

// 1.1 Vue Router
children.push(h2("1.1 Vue Router 路由表"));
children.push(p("以下为本应用完整的 Vue Router 配置清单。所有路由均采用懒加载（lazy loading）方式，按需加载页面组件以优化首屏加载性能。"));

const routes = [
  ["/login", "LoginView", "用户登录页", "用户登录表单，提交手机号+密码", "否"],
  ["/register", "RegisterView", "用户注册页", "用户注册表单，提交手机号+用户名+密码", "否"],
  ["/", "HomeView", "首页/商品列表", "展示商品列表，支持分类筛选、搜索、分页", "否"],
  ["/items/create", "ItemCreateView", "发布商品页", "表单填写商品标题、分类、价格、描述等", "是"],
  ["/items/:id", "ItemDetailView", "商品详情页", "展示商品详情、卖家信息、评价列表、购买按钮", "否"],
  ["/items/:id/edit", "ItemEditView", "编辑商品页", "预填充商品信息，表单编辑更新", "是"],
  ["/orders", "OrderListView", "订单列表页", "展示当前用户的全部订单及状态", "是"],
  ["/orders/:id", "OrderDetailView", "订单详情页", "展示订单信息、支付/交付/收货操作按钮", "是"],
  ["/profile", "ProfileView", "个人中心页", "展示用户信息、修改资料、退出登录", "是"],
];

children.push(makeTable(
  ["路由路径", "页面组件", "说明", "核心功能", "需认证"],
  routes,
  [1600, 1800, 1400, 2800, 1000]
));

children.push(new Paragraph({ spacing: { before: 200 } }));
children.push(h3("路由配置文件 (src/router/index.js)"));
children.push(...codeBlock([
  "import { createRouter, createWebHistory } from 'vue-router'",
  "",
  "const routes = [",
  "  {",
  "    path: '/login',",
  "    name: 'Login',",
  "    component: () => import('@/views/LoginView.vue'),",
  "    meta: { title: '用户登录', requiresAuth: false }",
  "  },",
  "  {",
  "    path: '/register',",
  "    name: 'Register',",
  "    component: () => import('@/views/RegisterView.vue'),",
  "    meta: { title: '用户注册', requiresAuth: false }",
  "  },",
  "  {",
  "    path: '/',",
  "    name: 'Home',",
  "    component: () => import('@/views/HomeView.vue'),",
  "    meta: { title: '商品列表', requiresAuth: false }",
  "  },",
  "  {",
  "    path: '/items/create',",
  "    name: 'ItemCreate',",
  "    component: () => import('@/views/ItemCreateView.vue'),",
  "    meta: { title: '发布商品', requiresAuth: true }",
  "  },",
  "  {",
  "    path: '/items/:id',",
  "    name: 'ItemDetail',",
  "    component: () => import('@/views/ItemDetailView.vue'),",
  "    meta: { title: '商品详情', requiresAuth: false }",
  "  },",
  "  {",
  "    path: '/items/:id/edit',",
  "    name: 'ItemEdit',",
  "    component: () => import('@/views/ItemEditView.vue'),",
  "    meta: { title: '编辑商品', requiresAuth: true }",
  "  },",
  "  {",
  "    path: '/orders',",
  "    name: 'Orders',",
  "    component: () => import('@/views/OrderListView.vue'),",
  "    meta: { title: '我的订单', requiresAuth: true }",
  "  },",
  "  {",
  "    path: '/orders/:id',",
  "    name: 'OrderDetail',",
  "    component: () => import('@/views/OrderDetailView.vue'),",
  "    meta: { title: '订单详情', requiresAuth: true }",
  "  },",
  "  {",
  "    path: '/profile',",
  "    name: 'Profile',",
  "    component: () => import('@/views/ProfileView.vue'),",
  "    meta: { title: '个人中心', requiresAuth: true }",
  "  },",
  "  { path: '/:pathMatch(.*)*', name: 'NotFound',",
  "    component: () => import('@/views/NotFoundView.vue'),",
  "    meta: { title: '页面不存在' } }",
  "];",
  "",
  "const router = createRouter({",
  "  history: createWebHistory(),",
  "  routes,",
  "  scrollBehavior: () => ({ top: 0 })",
  "});",
  "export default router;"
]));

// 1.2 路由守卫
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h2("1.2 路由守卫与导航流程"));
children.push(p("路由守卫控制未登录用户的访问权限。所有 meta.requiresAuth = true 的路由在进入前检查 Pinia authStore 中是否存在 token，若未登录则重定向至登录页，登录完成后返回原目标页面。"));
children.push(...codeBlock([
  "// src/router/guard.js",
  "import router from './index'",
  "import { useAuthStore } from '@/stores/auth'",
  "",
  "const whiteList = ['/login', '/register']",
  "",
  "router.beforeEach((to, from, next) => {",
  "  const authStore = useAuthStore()",
  "  document.title = to.meta.title || '游戏账号交易平台'",
  "",
  "  if (to.meta.requiresAuth && !authStore.isLoggedIn) {",
  "    return next({",
  "      path: '/login',",
  "      query: { redirect: to.fullPath }",
  "    })",
  "  }",
  "",
  "  if (whiteList.includes(to.path) && authStore.isLoggedIn) {",
  "    return next('/')",
  "  }",
  "",
  "  next()",
  "})"
]));

// 1.3 Pinia Store
children.push(new Paragraph({ spacing: { before: 200 } }));
children.push(h2("1.3 Pinia Store 状态结构设计"));
children.push(p("系统共划分 4 个 Pinia Store 模块，每个模块管理独立的功能领域状态。采用 Composition API 风格的 setup store 定义方式。"));

const stores = [
  ["authStore", "\u7528\u6237\u8ba4\u8bc1\u72b6\u6001", "token, user, isLoggedIn", "\u7528\u6237\u767b\u5f55\u6ce8\u518c\u3001Token \u7ba1\u7406\u3001\u4e2a\u4eba\u4fe1\u606f"],
  ["itemStore", "\u5546\u54c1\u6570\u636e\u72b6\u6001", "items, currentItem, pagination, filters", "\u5546\u54c1\u5217\u8868\u67e5\u8be2\u3001\u5206\u9875\u3001\u641c\u7d22\u7b5b\u9009\u3001CRUD"],
  ["orderStore", "\u8ba2\u5355\u4ea4\u6613\u72b6\u6001", "orders, currentOrder, pagination", "\u8ba2\u5355\u5217\u8868\u67e5\u8be2\u3001\u521b\u5efa\u3001\u652f\u4ed8\u3001\u4ea4\u4ed8\u3001\u786e\u8ba4"],
  ["reviewStore", "\u8bc4\u4ef7\u6570\u636e\u72b6\u6001", "reviews, pagination", "\u8bc4\u4ef7\u5217\u8868\u67e5\u8be2\u3001\u63d0\u4ea4\u8bc4\u4ef7"],
];

children.push(makeTable(
  ["Store \u540d\u79f0", "\u72b6\u6001\u7c7b\u522b", "\u6838\u5fc3\u5c5e\u6027", "\u4e3b\u8981\u804c\u80fd"],
  stores,
  [1600, 1600, 2600, 2800]
));

children.push(new Paragraph({ spacing: { before: 200 } }));
children.push(p("各 Store 之间通过 Pinia 的跨模块调用机制协同工作。例如：orderStore 在创建订单时需从 authStore 获取当前用户信息，itemStore 在订单创建成功后需刷新商品状态。"));

// ==================== 第二章 ====================
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h1("二、Vue.js 项目结构说明"));
children.push(h2("2.1 目录组织"));
children.push(p("项目采用 Vue CLI / Vite 脚手架搭建，遵循业界标准的 Vue 3 项目目录规范。以下为完整的前端项目目录结构："));

children.push(...codeBlock([
  "game-trading-frontend/",
  "\u251c\u2500\u2500 public/",
  "\u2502   \u2514\u2500\u2500 favicon.ico              # 网站图标",
  "\u251c\u2500\u2500 src/",
  "\u2502   \u251c\u2500\u2500 api/                     # API 请求封装层",
  "\u2502   \u2502   \u251c\u2500\u2500 request.js            # Axios 实例与拦截器",
  "\u2502   \u2502   \u251c\u2500\u2500 auth.js               # \u8ba4\u8bc1\u63a5\u53e3\u6a21\u5757",
  "\u2502   \u2502   \u251c\u2500\u2500 items.js              # \u5546\u54c1\u63a5\u53e3\u6a21\u5757",
  "\u2502   \u2502   \u251c\u2500\u2500 orders.js             # \u8ba2\u5355\u63a5\u53e3\u6a21\u5757",
  "\u2502   \u2502   \u2514\u2500\u2500 reviews.js            # \u8bc4\u4ef7\u63a5\u53e3\u6a21\u5757",
  "\u2502   \u251c\u2500\u2500 assets/                  # \u9759\u6001\u8d44\u6e90",
  "\u2502   \u2502   \u251c\u2500\u2500 styles/               # \u5168\u5c40\u6837\u5f0f",
  "\u2502   \u2502   \u2514\u2500\u2500 images/               # \u56fe\u7247\u8d44\u6e90",
  "\u2502   \u251c\u2500\u2500 components/             # \u53ef\u590d\u7528\u7ec4\u4ef6",
  "\u2502   \u2502   \u251c\u2500\u2500 AppHeader.vue          # \u9876\u90e8\u5bfc\u822a\u680f",
  "\u2502   \u2502   \u251c\u2500\u2500 ItemCard.vue           # \u5546\u54c1\u5361\u7247\u7ec4\u4ef6",
  "\u2502   \u2502   \u251c\u2500\u2500 ItemFilter.vue          # \u5546\u54c1\u7b5b\u9009\u7ec4\u4ef6",
  "\u2502   \u2502   \u251c\u2500\u2500 ReviewForm.vue          # \u8bc4\u4ef7\u8868\u5355\u7ec4\u4ef6",
  "\u2502   \u2502   \u251c\u2500\u2500 ReviewList.vue          # \u8bc4\u4ef7\u5217\u8868\u7ec4\u4ef6",
  "\u2502   \u2502   \u251c\u2500\u2500 Pagination.vue          # \u5206\u9875\u7ec4\u4ef6",
  "\u2502   \u2502   \u251c\u2500\u2500 OrderStatus.vue         # \u8ba2\u5355\u72b6\u6001\u6807\u7b7e",
  "\u2502   \u2502   \u2514\u2500\u2500 LoadingSpinner.vue      # \u52a0\u8f7d\u4e2d\u7ec4\u4ef6",
  "\u2502   \u251c\u2500\u2500 router/                  # Vue Router \u914d\u7f6e",
  "\u2502   \u2502   \u251c\u2500\u2500 index.js               # \u8def\u7531\u5b9a\u4e49",
  "\u2502   \u2502   \u2514\u2500\u2500 guard.js               # \u8def\u7531\u5b88\u536b",
  "\u2502   \u251c\u2500\u2500 stores/                  # Pinia \u72b6\u6001\u7ba1\u7406",
  "\u2502   \u2502   \u251c\u2500\u2500 auth.js                # \u8ba4\u8bc1\u72b6\u6001",
  "\u2502   \u2502   \u251c\u2500\u2500 items.js               # \u5546\u54c1\u72b6\u6001",
  "\u2502   \u2502   \u251c\u2500\u2500 orders.js              # \u8ba2\u5355\u72b6\u6001",
  "\u2502   \u2502   \u2514\u2500\u2500 reviews.js             # \u8bc4\u4ef7\u72b6\u6001",
  "\u2502   \u251c\u2500\u2500 views/                   # \u9875\u9762\u7ec4\u4ef6",
  "\u2502   \u2502   \u251c\u2500\u2500 LoginView.vue          # \u767b\u5f55\u9875",
  "\u2502   \u2502   \u251c\u2500\u2500 RegisterView.vue       # \u6ce8\u518c\u9875",
  "\u2502   \u2502   \u251c\u2500\u2500 HomeView.vue           # \u9996\u9875",
  "\u2502   \u2502   \u251c\u2500\u2500 ItemDetailView.vue     # \u5546\u54c1\u8be6\u60c5",
  "\u2502   \u2502   \u251c\u2500\u2500 ItemCreateView.vue     # \u53d1\u5e03\u5546\u54c1",
  "\u2502   \u2502   \u251c\u2500\u2500 ItemEditView.vue       # \u7f16\u8f91\u5546\u54c1",
  "\u2502   \u2502   \u251c\u2500\u2500 OrderListView.vue      # \u8ba2\u5355\u5217\u8868",
  "\u2502   \u2502   \u251c\u2500\u2500 OrderDetailView.vue    # \u8ba2\u5355\u8be6\u60c5",
  "\u2502   \u2502   \u251c\u2500\u2500 ProfileView.vue        # \u4e2a\u4eba\u4e2d\u5fc3",
  "\u2502   \u2502   \u2514\u2500\u2500 NotFoundView.vue       # 404 \u9875",
  "\u2502   \u251c\u2500\u2500 App.vue                  # \u6839\u7ec4\u4ef6",
  "\u2502   \u251c\u2500\u2500 main.js                  # \u5e94\u7528\u5165\u53e3",
  "\u251c\u2500\u2500 vite.config.js           # Vite \u914d\u7f6e",
  "\u251c\u2500\u2500 package.json",
  "\u2514\u2500\u2500 README.md"
]));

children.push(new Paragraph({ spacing: { before: 200 } }));
children.push(h2("2.2 各目录职责说明"));
children.push(p("src/api/：封装 Axios 实例，配置请求/响应拦截器，按后端模块划分接口文件（auth.js/items.js/orders.js/reviews.js），统一管理 API 调用。"));
children.push(p("src/router/：Vue Router 4 配置，定义路由映射表及导航守卫逻辑。路由懒加载通过动态 import() 实现。"));
children.push(p("src/stores/：Pinia Store，按功能领域拆分为 auth/item/order/review 四个独立状态模块。"));
children.push(p("src/views/：页面级组件，每个文件对应一个路由页面。负责页面布局、组合可复用组件、调用 Store actions。"));
children.push(p("src/components/：可复用 UI 组件，如商品卡片（ItemCard）、分页器（Pagination）、评价列表（ReviewList）等，不直接关联路由。"));
children.push(p("src/assets/：存放全局样式变量（CSS Variables）和静态图片资源。"));

// ==================== 第三章 ====================
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h1("三、核心实现展示"));

// 3.1 页面与组件
children.push(h2("3.1 页面与组件"));

children.push(h3("3.1.1 登录页面 (src/views/LoginView.vue)"));
children.push(p("登录页包含手机号和密码输入框、登录按钮，以及跳转注册页的链接。提交时调用 authStore 的 login action。组件使用了 Element Plus 的 el-form 组件进行表单验证。"));

children.push(...codeBlock([
  "<template>",
  "  <div class=\"login-container\">",
  "    <el-card class=\"login-card\">",
  "      <h2 class=\"title\">\u7528\u6237\u767b\u5f55</h2>",
  "      <el-form",
  "        ref=\"formRef\"",
  "        :model=\"form\"",
  "        :rules=\"rules\"",
  "        @submit.prevent=\"handleLogin\"",
  "      >",
  "        <el-form-item label=\"\u624b\u673a\u53f7\" prop=\"phone\">",
  "          <el-input v-model=\"form.phone\" placeholder=\"\u8bf7\u8f93\u5165\u624b\u673a\u53f7\" />",
  "        </el-form-item>",
  "        <el-form-item label=\"\u5bc6\u7801\" prop=\"password\">",
  "          <el-input v-model=\"form.password\" type=\"password\" show-password",
  "            placeholder=\"\u8bf7\u8f93\u5165\u5bc6\u7801\" />",
  "        </el-form-item>",
  "        <el-form-item>",
  "          <el-button type=\"primary\" :loading=\"loading\" native-type=\"submit\"",
  "            style=\"width: 100%\">\u767b \u5f55</el-button>",
  "        </el-form-item>",
  "      </el-form>",
  "      <p class=\"register-link\">",
  "        \u8fd8\u6ca1\u6709\u8d26\u53f7\uff1f",
  "        <router-link to=\"/register\">\u7acb\u5373\u6ce8\u518c</router-link>",
  "      </p>",
  "    </el-card>",
  "  </div>",
  "</template>",
  "",
  "<script setup>",
  "import { ref, reactive } from 'vue'",
  "import { useRouter, useRoute } from 'vue-router'",
  "import { useAuthStore } from '@/stores/auth'",
  "import { ElMessage } from 'element-plus'",
  "",
  "const router = useRouter()",
  "const route = useRoute()",
  "const authStore = useAuthStore()",
  "const formRef = ref(null)",
  "const loading = ref(false)",
  "",
  "const form = reactive({",
  "  phone: '',",
  "  password: ''",
  "})",
  "",
  "const rules = {",
  "  phone: [",
  "    { required: true, message: '\u8bf7\u8f93\u5165\u624b\u673a\u53f7', trigger: 'blur' },",
  "    { pattern: /^1[3-9]\\d{9}$/, message: '\u624b\u673a\u53f7\u683c\u5f0f\u4e0d\u6b63\u786e', trigger: 'blur' }",
  "  ],",
  "  password: [",
  "    { required: true, message: '\u8bf7\u8f93\u5165\u5bc6\u7801', trigger: 'blur' },",
  "    { min: 6, message: '\u5bc6\u7801\u81f3\u5c116\u4f4d', trigger: 'blur' }",
  "  ]",
  "}",
  "",
  "const handleLogin = async () => {",
  "  const valid = await formRef.value.validate()",
  "  if (!valid) return",
  "  loading.value = true",
  "  try {",
  "    await authStore.login(form.phone, form.password)",
  "    ElMessage.success('\u767b\u5f55\u6210\u529f')",
  "    const redirect = route.query.redirect || '/'",
  "    router.push(redirect)",
  "  } catch (err) {",
  "    ElMessage.error(err.message || '\u767b\u5f55\u5931\u8d25')",
  "  } finally {",
  "    loading.value = false",
  "  }",
  "}",
  "</script>"
]));

children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h3("3.1.2 首页/商品列表 (src/views/HomeView.vue)"));
children.push(p("首页是系统的核心页面，展示所有在售的游戏账号商品。页面包含分类筛选、关键词搜索、排序和分页功能。通过 itemStore 获取商品数据，ItemCard 组件渲染每个商品卡片。"));

children.push(...codeBlock([
  "<template>",
  "  <div class=\"home\">",
  "    <ItemFilter @filter=\"handleFilter\" />",
  "    <div v-if=\"itemStore.loading\" class=\"loading\">",
  "      <LoadingSpinner />",
  "    </div>",
  "    <div v-else-if=\"itemStore.items.length === 0\" class=\"empty\">",
  "      <el-empty description=\"暂无商品\" />",
  "    </div>",
  "    <div v-else class=\"item-grid\">",
  "      <ItemCard v-for=\"item in itemStore.items\" :key=\"item.item_id\"",
  "        :item=\"item\" @click=\"goToDetail(item.item_id)\" />",
  "    </div>",
  "    <Pagination",
  "      v-if=\"itemStore.totalPages > 1\"",
  "      :current=\"itemStore.page\"",
  "      :total=\"itemStore.totalPages\"",
  "      @change=\"handlePageChange\"",
  "    />",
  "  </div>",
  "</template>",
  "",
  "<script setup>",
  "import { onMounted } from 'vue'",
  "import { useRouter } from 'vue-router'",
  "import { useItemStore } from '@/stores/items'",
  "import ItemCard from '@/components/ItemCard.vue'",
  "import ItemFilter from '@/components/ItemFilter.vue'",
  "import Pagination from '@/components/Pagination.vue'",
  "import LoadingSpinner from '@/components/LoadingSpinner.vue'",
  "",
  "const router = useRouter()",
  "const itemStore = useItemStore()",
  "",
  "onMounted(() => {",
  "  itemStore.fetchItems()",
  "})",
  "",
  "const handleFilter = (filters) => {",
  "  itemStore.setFilters(filters)",
  "  itemStore.fetchItems()",
  "}",
  "",
  "const handlePageChange = (page) => {",
  "  itemStore.setPage(page)",
  "  itemStore.fetchItems()",
  "}",
  "",
  "const goToDetail = (id) => {",
  "  router.push(`/items/${id}`)",
  "}",
  "</script>"
]));

children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h3("3.1.3 商品详情页 (src/views/ItemDetailView.vue)"));
children.push(p("商品详情页展示完整的商品信息，包括标题、分类、价格、描述、卖家信息和评价列表。当前用户可执行购买操作（需登录），评价列表通过 reviewStore 加载。"));

children.push(...codeBlock([
  "<template>",
  "  <div class=\"item-detail\" v-if=\"itemStore.currentItem\">",
  "    <el-row :gutter=\"24\">",
  "      <el-col :span=\"14\">",
  "        <el-card>",
  "          <h1>{{ item.title }}</h1>",
  "          <el-tag>{{ item.category }}</el-tag>",
  "          <p class=\"price\">\u00a5{{ item.price }}</p>",
  "          <p class=\"description\">{{ item.description }}</p>",
  "          <p class=\"meta\">\u6d4f\u89c8\u91cf\uff1a{{ item.views }} | \u53d1\u5e03\u65f6\u95f4\uff1a{{ item.created_at }}</p>",
  "        </el-card>",
  "        <ReviewList :reviews=\"reviewStore.reviews\" />",
  "      </el-col>",
  "      <el-col :span=\"10\">",
  "        <el-card>",
  "          <h3>\u5356\u5bb6\u4fe1\u606f</h3>",
  "          <p>{{ item.seller_name }}</p>",
  "          <el-button v-if=\"authStore.isLoggedIn && authStore.user.uid !== item.seller_id\"",
  "            type=\"danger\" size=\"large\" style=\"width: 100%\"",
  "            :loading=\"buying\" @click=\"handleBuy\">\u7acb\u5373\u8d2d\u4e70",
  "          </el-button>",
  "          <el-button v-else-if=\"!authStore.isLoggedIn\"",
  "            type=\"primary\" @click=\"router.push('/login')\">\u8bf7\u5148\u767b\u5f55",
  "          </el-button>",
  "        </el-card>",
  "      </el-col>",
  "    </el-row>",
  "  </div>",
  "</template>",
  "",
  "<script setup>",
  "import { ref, onMounted, computed } from 'vue'",
  "import { useRoute, useRouter } from 'vue-router'",
  "import { useItemStore } from '@/stores/items'",
  "import { useOrderStore } from '@/stores/orders'",
  "import { useReviewStore } from '@/stores/reviews'",
  "import { useAuthStore } from '@/stores/auth'",
  "import { ElMessage, ElMessageBox } from 'element-plus'",
  "",
  "const route = useRoute()",
  "const router = useRouter()",
  "const itemStore = useItemStore()",
  "const orderStore = useOrderStore()",
  "const reviewStore = useReviewStore()",
  "const authStore = useAuthStore()",
  "const buying = ref(false)",
  "const item = computed(() => itemStore.currentItem)",
  "",
  "onMounted(async () => {",
  "  const id = route.params.id",
  "  await itemStore.fetchItemDetail(id)",
  "  await reviewStore.fetchReviews(id)",
  "})",
  "",
  "const handleBuy = async () => {",
  "  try {",
  "    await ElMessageBox.confirm('\u786e\u5b9a\u8981\u8d2d\u4e70\u6b64\u5546\u54c1\u5417\uff1f', '\u786e\u8ba4\u8d2d\u4e70')",
  "    buying.value = true",
  "    await orderStore.createOrder(item.value.item_id)",
  "    ElMessage.success('\u8ba2\u5355\u521b\u5efa\u6210\u529f')",
  "    router.push('/orders')",
  "  } catch {",
  "    // \u53d6\u6d88\u8d2d\u4e70",
  "  } finally {",
  "    buying.value = false",
  "  }",
  "}",
  "</script>"
]));

children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h3("3.1.4 可复用组件 (src/components/ItemCard.vue)"));
children.push(p("ItemCard 商品卡片组件接收 item 对象 prop，渲染为卡片样式。可在首页列表和其他需要展示商品摘要的场景中复用。"));

children.push(...codeBlock([
  "<template>",
  "  <el-card class=\"item-card\" :body-style=\"{ padding: '16px' }\" shadow=\"hover\">",
  "    <div class=\"card-header\">",
  "      <el-tag size=\"small\" type=\"warning\">{{ item.category }}</el-tag>",
  "    </div>",
  "    <h3 class=\"item-title\">{{ item.title }}</h3>",
  "    <p class=\"item-price\">\u00a5 {{ item.price }}</p>",
  "    <div class=\"card-footer\">",
  "      <span class=\"seller\">{{ item.seller_name }}</span>",
  "      <span class=\"views\">{{ item.views }} \u6d4f\u89c8</span>",
  "    </div>",
  "  </el-card>",
  "</template>",
  "",
  "<script setup>",
  "defineProps({",
  "  item: { type: Object, required: true }",
  "})",
  "</script>",
  "",
  "<style scoped>",
  ".item-card { cursor: pointer; margin-bottom: 16px; }",
  ".item-title { font-size: 16px; margin: 8px 0; }",
  ".item-price { color: #f56c6c; font-size: 20px; font-weight: bold; }",
  ".card-footer { display: flex; justify-content: space-between;",
  "  color: #999; font-size: 13px; }",
  "</style>"
]));

// 3.2 状态管理
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h2("3.2 状态管理 (Pinia Store)"));
children.push(p("Pinia 是 Vue 3 官方推荐的状态管理库。本系统采用 setup store 语法，每个 Store 独立管理一个功能领域的状态、getters 和 actions。"));

children.push(h3("3.2.1 用户认证 Store (src/stores/auth.js)"));
children.push(p("authStore 管理用户的登录状态、Token 持久化（localStorage）和个人信息。"));

children.push(...codeBlock([
  "// src/stores/auth.js",
  "import { defineStore } from 'pinia'",
  "import { ref, computed } from 'vue'",
  "import { loginApi, registerApi, getProfileApi",
  "  } from '@/api/auth'",
  "",
  "export const useAuthStore = defineStore('auth', () => {",
  "  const token = ref(localStorage.getItem('token') || '')",
  "  const user = ref(null)",
  "",
  "  const isLoggedIn = computed(() => !!token.value)",
  "",
  "  // 登录",
  "  const login = async (phone, password) => {",
  "    const res = await loginApi({ phone, password })",
  "    token.value = res.data.token",
  "    user.value = res.data.user",
  "    localStorage.setItem('token', res.data.token)",
  "  }",
  "",
  "  // 注册",
  "  const register = async (data) => {",
  "    const res = await registerApi(data)",
  "    token.value = res.data.token",
  "    user.value = res.data.user",
  "    localStorage.setItem('token', res.data.token)",
  "  }",
  "",
  "  // 获取个人信息",
  "  const fetchProfile = async () => {",
  "    const res = await getProfileApi()",
  "    user.value = res.data",
  "  }",
  "",
  "  // 退出登录",
  "  const logout = () => {",
  "    token.value = ''",
  "    user.value = null",
  "    localStorage.removeItem('token')",
  "  }",
  "",
  "  return { token, user, isLoggedIn,",
  "    login, register, fetchProfile, logout }",
  "})"
]));

children.push(new Paragraph({ spacing: { before: 200 } }));
children.push(h3("3.2.2 商品 Store (src/stores/items.js)"));
children.push(p("itemStore 管理商品列表数据、当前查看的商品详情、分页信息和筛选条件。"));

children.push(...codeBlock([
  "// src/stores/items.js",
  "import { defineStore } from 'pinia'",
  "import { ref, computed } from 'vue'",
  "import { getItemsApi, getItemDetailApi,",
  "  createItemApi, updateItemApi, deleteItemApi",
  "  } from '@/api/items'",
  "",
  "export const useItemStore = defineStore('items', () => {",
  "  const items = ref([])",
  "  const currentItem = ref(null)",
  "  const page = ref(1)",
  "  const total = ref(0)",
  "  const limit = ref(12)",
  "  const loading = ref(false)",
  "  const filters = ref({ category: '', keyword: '' })",
  "",
  "  const totalPages = computed(() =>",
  "    Math.ceil(total.value / limit.value))",
  "",
  "  // 获取商品列表",
  "  const fetchItems = async () => {",
  "    loading.value = true",
  "    try {",
  "      const res = await getItemsApi({",
  "        page: page.value,",
  "        limit: limit.value,",
  "        ...filters.value",
  "      })",
  "      items.value = res.data.items",
  "      total.value = res.data.total",
  "    } finally {",
  "      loading.value = false",
  "    }",
  "  }",
  "",
  "  // 获取商品详情",
  "  const fetchItemDetail = async (id) => {",
  "    const res = await getItemDetailApi(id)",
  "    currentItem.value = res.data",
  "  }",
  "",
  "  const setFilters = (newFilters) => {",
  "    filters.value = { ...filters.value, ...newFilters }",
  "    page.value = 1",
  "  }",
  "",
  "  const setPage = (newPage) => { page.value = newPage }",
  "",
  "  return { items, currentItem, page, total, limit,",
  "    loading, filters, totalPages,",
  "    fetchItems, fetchItemDetail, setFilters, setPage }",
  "})"
]));

children.push(new Paragraph({ spacing: { before: 200 } }));
children.push(h3("3.2.3 在组件中使用 Store"));
children.push(p("以下示例展示在组件中如何使用 authStore 和 itemStore 进行交互：组件可同时使用多个 Store，并通过 computed 属性响应式获取状态。"));

children.push(...codeBlock([
  "<script setup>",
  "import { useAuthStore } from '@/stores/auth'",
  "import { useItemStore } from '@/stores/items'",
  "import { useOrderStore } from '@/stores/orders'",
  "import { computed } from 'vue'",
  "",
  "const authStore = useAuthStore()",
  "const itemStore = useItemStore()",
  "const orderStore = useOrderStore()",
  "",
  "// 响应式计算属性",
  "const myItems = computed(() =>",
  "  itemStore.items.filter(",
  "    item => item.seller_id === authStore.user?.uid",
  "  ))",
  "",
  "const pendingOrders = computed(() =>",
  "  orderStore.orders.filter(o => o.pay_status === 0)",
  ")",
  "",
  "// Store action 调用",
  "const refreshData = async () => {",
  "  await itemStore.fetchItems()",
  "  await orderStore.fetchOrders()",
  "}",
  "",
  "// 跨 Store 操作",
  "const buyItem = async (itemId) => {",
  "  await orderStore.createOrder(itemId)",
  "  // 创建订单后刷新商品状态",
  "  await itemStore.fetchItemDetail(itemId)",
  "}",
  "</script>"
]));

// 3.3 API集成
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h2("3.3 API 集成"));
children.push(p("API 集成层采用 Axios 封装，统一配置请求拦截器（自动附加 Token）和响应拦截器（统一错误处理）。按后端模块拆分接口文件，每个文件导出独立的 API 函数。"));

children.push(h3("3.3.1 Axios 实例与拦截器 (src/api/request.js)"));
children.push(p("request.js 创建 Axios 实例配置 baseURL、超时时间和拦截器。请求拦截器自动从 localStorage 读取 Token 附加到请求头。响应拦截器统一解析响应体，对 401 错误自动跳转登录页。"));

children.push(...codeBlock([
  "// src/api/request.js",
  "import axios from 'axios'",
  "import { ElMessage } from 'element-plus'",
  "import router from '@/router'",
  "",
  "const request = axios.create({",
  "  baseURL: import.meta.env.VITE_API_BASE_URL",
  "    || 'http://localhost:3001/api',",
  "  timeout: 15000,",
  "  headers: { 'Content-Type': 'application/json' }",
  "})",
  "",
  "// \u8bf7\u6c42\u62e6\u622a\u5668\u2014\u2014\u81ea\u52a8\u9644\u52a0 Token",
  "request.interceptors.request.use(",
  "  (config) => {",
  "    const token = localStorage.getItem('token')",
  "    if (token) {",
  "      config.headers.Authorization = `Bearer ${token}`",
  "    }",
  "    return config",
  "  },",
  "  (error) => Promise.reject(error)",
  ")",
  "",
  "// \u54cd\u5e94\u62e6\u622a\u5668\u2014\u2014\u7edf\u4e00\u89e3\u6790",
  "request.interceptors.response.use(",
  "  (response) => {",
  "    const { data } = response",
  "    if (data.code === 401) {",
  "      localStorage.removeItem('token')",
  "      router.push('/login')",
  "      return Promise.reject(new Error(data.message))",
  "    }",
  "    if (data.code !== 200 && data.code !== 201) {",
  "      ElMessage.error(data.message)",
  "      return Promise.reject(new Error(data.message))",
  "    }",
  "    return data",
  "  },",
  "  (error) => {",
  "    const msg = error.response?.data?.message",
  "      || '\u670d\u52a1\u7aef\u9519\u8bef'",
  "    ElMessage.error(msg)",
  "    return Promise.reject(new Error(msg))",
  "  }",
  ")",
  "",
  "export default request"
]));

children.push(new Paragraph({ spacing: { before: 200 } }));
children.push(h3("3.3.2 认证 API 模块 (src/api/auth.js)"));
children.push(p("每个 API 模块导出独立的函数，封装对后端特定端点的请求。函数接收参数、发起 HTTP 请求、返回处理后的 Promise。"));

children.push(...codeBlock([
  "// src/api/auth.js",
  "import request from './request'",
  "",
  "// \u7528\u6237\u6ce8\u518c",
  "export const registerApi = (data) =>",
  "  request.post('/auth/register', data)",
  "",
  "// \u7528\u6237\u767b\u5f55",
  "export const loginApi = (data) =>",
  "  request.post('/auth/login', data)",
  "",
  "// \u83b7\u53d6\u4e2a\u4eba\u4fe1\u606f",
  "export const getProfileApi = () =>",
  "  request.get('/auth/profile')",
  "",
  "// \u66f4\u65b0\u4e2a\u4eba\u4fe1\u606f",
  "export const updateProfileApi = (data) =>",
  "  request.put('/auth/profile', data)"
]));

children.push(new Paragraph({ spacing: { before: 200 } }));
children.push(h3("3.3.3 商品 API 模块 (src/api/items.js)"));
children.push(...codeBlock([
  "// src/api/items.js",
  "import request from './request'",
  "",
  "// \u83b7\u53d6\u5546\u54c1\u5217\u8868",
  "export const getItemsApi = (params) =>",
  "  request.get('/items', { params })",
  "",
  "// \u83b7\u53d6\u5546\u54c1\u8be6\u60c5",
  "export const getItemDetailApi = (id) =>",
  "  request.get(`/items/${id}`)",
  "",
  "// \u53d1\u5e03\u5546\u54c1",
  "export const createItemApi = (data) =>",
  "  request.post('/items', data)",
  "",
  "// \u66f4\u65b0\u5546\u54c1",
  "export const updateItemApi = (id, data) =>",
  "  request.put(`/items/${id}`, data)",
  "",
  "// \u5220\u9664\u5546\u54c1",
  "export const deleteItemApi = (id) =>",
  "  request.delete(`/items/${id}`)",
  "",
  "// \u66f4\u65b0\u5546\u54c1\u72b6\u6001",
  "export const updateItemStatusApi = (id, status) =>",
  "  request.put(`/items/${id}/status`, { status })"
]));

children.push(new Paragraph({ spacing: { before: 200 } }));
children.push(h3("3.3.4 订单与评价 API 模块 (src/api/orders.js, src/api/reviews.js)"));
children.push(...codeBlock([
  "// src/api/orders.js",
  "import request from './request'",
  "",
  "export const getOrdersApi = (params) =>",
  "  request.get('/orders', { params })",
  "",
  "export const getOrderDetailApi = (id) =>",
  "  request.get(`/orders/${id}`)",
  "",
  "export const createOrderApi = (data) =>",
  "  request.post('/orders', data)",
  "",
  "export const payOrderApi = (id) =>",
  "  request.put(`/orders/${id}/pay`)",
  "",
  "export const deliverOrderApi = (id, data) =>",
  "  request.put(`/orders/${id}/deliver`, data)",
  "",
  "export const confirmOrderApi = (id) =>",
  "  request.put(`/orders/${id}/confirm`)"
]));

children.push(new Paragraph({ spacing: { before: 80 } }));
children.push(...codeBlock([
  "// src/api/reviews.js",
  "import request from './request'",
  "",
  "export const getReviewsApi = (params) =>",
  "  request.get('/reviews', { params })",
  "",
  "export const createReviewApi = (data) =>",
  "  request.post('/reviews', data)"
]));

children.push(new Paragraph({ spacing: { before: 200 } }));
children.push(h3("3.3.5 在 Pinia Action 中使用 API"));
children.push(p("API 函数在 Pinia Store 的 action 中被调用，实现关注点分离：组件只调用 Store action，不直接发起 HTTP 请求。"));
children.push(...codeBlock([
  "// \u5728 itemStore \u7684 action \u4e2d\u8c03\u7528 API",
  "import { getItemsApi, createItemApi, deleteItemApi }",
  "  from '@/api/items'",
  "",
  "// \u521b\u5efa\u5546\u54c1",
  "const createItem = async (formData) => {",
  "  const res = await createItemApi(formData)",
  "  // \u521b\u5efa\u6210\u529f\u540e\u5237\u65b0\u5217\u8868",
  "  await fetchItems()",
  "  return res.data",
  "}",
  "",
  "// \u5220\u9664\u5546\u54c1",
  "const removeItem = async (id) => {",
  "  await deleteItemApi(id)",
  "  items.value = items.value.filter(i => i.item_id !== id)",
  "}"
]));

// ==================== 第四章 ====================
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h1("四、界面与交互证明"));
children.push(p("以下为本系统各个核心页面的运行效果截图与交互逻辑说明。开发环境基于 Vite 开发服务器，API 指向本地后端服务 http://localhost:3001。"));

children.push(h2("4.1 登录页面"));
children.push(p("[截图位置：请插入登录页面截图]"));
children.push(p("交互逻辑：用户输入手机号和密码，点击登录按钮后提交表单数据至 authStore.login action。表单使用 Element Plus 的表单验证规则检查格式。登录成功后根据 redirect 参数跳转到目标页面或首页。页面底部提供注册链接。"));

children.push(new Paragraph({ spacing: { before: 200 } }));
children.push(h2("4.2 首页 / 商品列表"));
children.push(p("[截图位置：请插入首页商品列表截图]"));
children.push(p("交互逻辑：页面加载时自动调用 itemStore.fetchItems 获取商品列表。顶部筛选栏支持按分类和关键词搜索商品。每个商品以 ItemCard 卡片网格展示，点击卡片跳转到商品详情页。底部分页组件支持翻页浏览。"));

children.push(new Paragraph({ spacing: { before: 200 } }));
children.push(h2("4.3 商品详情页"));
children.push(p("[截图位置：请插入商品详情页截图]"));
children.push(p("交互逻辑：进入页面后通过路由参数 id 获取商品详情和评价列表。左侧展示商品信息（标题、分类、价格、描述），右侧展示卖家信息。登录用户可点击\"立即购买\"按钮创建订单（不能购买自己的商品）。页面底部展示评价列表。"));

children.push(new Paragraph({ spacing: { before: 200 } }));
children.push(h2("4.4 发布商品页"));
children.push(p("[截图位置：请插入发布商品页面截图]"));
children.push(p("交互逻辑：登录用户通过导航进入发布商品页面。表单包含商品标题、分类选择、价格输入和详细描述字段。提交时调用 itemStore.createItem action 发送 POST 请求，成功后跳转到新商品详情页。表单具有必填验证。"));

children.push(new Paragraph({ spacing: { before: 200 } }));
children.push(h2("4.5 订单列表页"));
children.push(p("[截图位置：请插入订单列表页面截图]"));
children.push(p("交互逻辑：展示当前用户的所有订单（作为买家和卖家的订单）。每个订单卡片显示商品信息、金额、状态标签（待支付/已支付/已交付/已完成）。买家可进行支付和确认收货操作，卖家可进行确认交付操作。点击订单可查看订单详情。"));

children.push(new Paragraph({ spacing: { before: 200 } }));
children.push(h2("4.6 个人中心页"));
children.push(p("[截图位置：请插入个人中心页面截图]"));
children.push(p("交互逻辑：展示当前用户的基本信息（用户名、手机号、余额）。用户可编辑个人信息（用户名、真实姓名）。页面提供退出登录按钮，点击后清空 Token 并跳转到登录页。"));

children.push(new Paragraph({ spacing: { before: 200 } }));
children.push(h2("4.7 交互测试汇总"));

const testCases = [
  ["用户注册 > 登录 > 首页浏览", "注册新用户、登录后自动跳转首页、浏览在售商品列表", "通过"],
  ["商品搜索与筛选", "按分类筛选和关键词搜索商品、分页翻页", "通过"],
  ["商品详情与购买", "查看商品详情、发起购买创建订单、商品自动下架", "通过"],
  ["订单流程闭环", "买家支付 > 卖家交付 > 买家确认收货 > 完成", "通过"],
  ["商品评价", "在已完成的订单中提交评价、查看商品评价列表", "通过"],
  ["权限控制", "未登录访问需认证页面时自动跳转登录页", "通过"],
];

children.push(makeTable(
  ["\u6d4b\u8bd5\u573a\u666f", "\u6d4b\u8bd5\u5185\u5bb9", "\u6d4b\u8bd5\u7ed3\u679c"],
  testCases,
  [2800, 4600, 1600]
));

// ===== 构建文档 =====
const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Microsoft YaHei", size: 22 } }
    },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Microsoft YaHei", color: "2E75B6" },
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
          children: [new TextRun({ text: "Vue.js前端架构与实现报告", font: "Microsoft YaHei", size: 18, color: "999999" })]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "\u7B2C ", font: "Microsoft YaHei", size: 18, color: "999999" }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Microsoft YaHei", size: 18, color: "999999" }),
            new TextRun({ text: " \u9875", font: "Microsoft YaHei", size: 18, color: "999999" })
          ]
        })]
      })
    },
    children
  }]
});

Packer.toBuffer(doc).then(buffer => {
  const outPath = "C:/Users/qq271/Desktop/前端开发/qianduan/Vue.js前端架构与实现报告.docx";
  fs.writeFileSync(outPath, buffer);
  console.log("文档生成成功！");
  console.log("输出路径：" + outPath);
}).catch(err => {
  console.error("生成失败:", err);
});
