/**
 * ============================================================
 * Vue Router 路由配置
 * ============================================================
 *
 * 本文件展示：
 * 1. 路由表的定义（嵌套路由、动态路由）
 * 2. 路由懒加载（动态 import）
 * 3. 导航守卫（全局前置守卫、路由独享守卫）
 *
 * 路由结构：
 *   /                          → Home（首页）
 *   /dashboard                 → Dashboard（仪表盘）
 *   /users                     → UserManagement（用户管理 — 组件化模块）
 *   /users/:id                 → UserDetail（用户详情 — 动态路由）
 *   /users/:id/profile         → UserProfile（用户资料 — 嵌套动态路由）
 *   /about                     → About（关于项目）
 *   /:pathMatch(.*)*           → NotFound（404）
 */

import { createRouter, createWebHistory } from 'vue-router'

// ============================================================
// 1. 路由表定义
// ============================================================
// 全部使用动态 import() 实现路由懒加载
// 每个路由组件只在首次访问时才加载，减小首屏体积
const routes = [
  // ---- 首页 ----
  {
    path: '/',
    name: 'Home',
    // 路由懒加载：() => import(...)
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页', requiresAuth: false }
  },

  // ---- 仪表盘（需要登录） ----
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: '仪表盘', requiresAuth: true },
    // 路由独享守卫：进入前检查
    beforeEnter: (to, from) => {
      // 演示：路由独享守卫
      console.log('[Router Guard] 路由独享守卫 → Dashboard')
      // 此处可以添加权限校验逻辑
    }
  },

  // ---- 用户管理（嵌套路由 + 动态路由） ----
  {
    path: '/users',
    name: 'Users',
    component: () => import('@/views/users/UserManagement.vue'),
    meta: { title: '用户管理' },
    // 子路由（嵌套路由）
    children: [
      // 动态路由：:id 是路径参数
      {
        path: ':id',
        name: 'UserDetail',
        component: () => import('@/views/users/UserDetail.vue'),
        meta: { title: '用户详情' },
        // 将路径参数作为 props 传递给组件（解耦）
        props: true
      },
      // 嵌套的动态路由：二级子路由
      {
        path: ':id/profile',
        name: 'UserProfile',
        component: () => import('@/views/users/UserProfile.vue'),
        meta: { title: '用户资料' },
        props: true
      }
    ]
  },

  // ---- 账号交易系统 ----
  {
    path: '/trade/login',
    name: 'TradeLogin',
    component: () => import('@/views/trade/Login.vue'),
    meta: { title: '登录 — 账号交易' }
  },
  {
    path: '/trade/items',
    name: 'TradeItemList',
    component: () => import('@/views/trade/ItemList.vue'),
    meta: { title: '账号商城' }
  },
  {
    path: '/trade/items/:id',
    name: 'TradeItemDetail',
    component: () => import('@/views/trade/ItemDetail.vue'),
    meta: { title: '商品详情' }
  },
  {
    path: '/trade/publish',
    name: 'TradePublish',
    component: () => import('@/views/trade/PublishItem.vue'),
    meta: { title: '发布账号' }
  },
  {
    path: '/trade/orders',
    name: 'TradeOrderList',
    component: () => import('@/views/trade/OrderList.vue'),
    meta: { title: '我的订单' }
  },
  {
    path: '/trade/orders/:id',
    name: 'TradeOrderDetail',
    component: () => import('@/views/trade/OrderDetail.vue'),
    meta: { title: '订单详情' }
  },
  {
    path: '/trade/profile',
    name: 'TradeProfile',
    component: () => import('@/views/trade/Profile.vue'),
    meta: { title: '个人中心' }
  },

  // ---- 关于项目 ----
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
    meta: { title: '关于项目' }
  },

  // ---- 404 页面（通配符路由，必须放在最后） ----
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '404' }
  }
]

// ============================================================
// 2. 创建路由实例
// ============================================================
const router = createRouter({
  // HTML5 History 模式（URL 中不带 # 号）
  history: createWebHistory(),
  routes,
  // 页面切换后滚动到顶部
  scrollBehavior() {
    return { top: 0 }
  }
})

// ============================================================
// 3. 全局导航守卫
// ============================================================

// --- 全局前置守卫 (beforeEach) ---
// 每次路由切换前触发，常用于权限验证
router.beforeEach((to, from) => {
  console.log(`[Router Guard] 全局前置守卫: ${from.path} → ${to.path}`)

  // 3.1 设置页面标题
  document.title = to.meta.title
    ? `${to.meta.title} — Vue Demo`
    : 'Vue Demo'

  // 3.2 权限验证示例
  // 如果目标路由需要登录，检查 Token 是否存在
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      // 没有 Token → 模拟（实际项目中跳转到 /login）
      console.warn('[Router Guard] 需要登录才能访问此页面！')
      // 此处演示不阻拦，只打印警告
      // return { name: 'Login' }  // 实际项目取消此行注释
    }
  }
})

// --- 全局后置钩子 (afterEach) ---
// 路由切换完成后触发，常用于页面统计
router.afterEach((to) => {
  console.log(`[Router Guard] 全局后置钩子: 已进入 ${to.path}`)
  // 例：发送 PV/UV 统计数据
})

export default router
