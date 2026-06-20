/**
 * Vue Router 路由配置 — 账号交易系统
 *
 * 路由结构：
 *   /                          → 重定向到 /trade/items
 *   /trade/items               → 账号商城
 *   /trade/items/:id           → 商品详情
 *   /trade/publish             → 发布/编辑账号
 *   /trade/orders              → 我的订单
 *   /trade/orders/:id          → 订单详情（支付/交付/收货/评价）
 *   /trade/login               → 登录/注册
 *   /trade/profile             → 个人中心
 *   /:pathMatch(.*)*           → 404
 */
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // 首页重定向到商城
  { path: '/', redirect: '/trade/items' },

  // ====== 账号交易系统 ======
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
    path: '/trade/my-items',
    name: 'MyItems',
    component: () => import('@/views/trade/MyItems.vue'),
    meta: { title: '我的发布' }
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
    path: '/trade/login',
    name: 'TradeLogin',
    component: () => import('@/views/trade/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/trade/profile',
    name: 'TradeProfile',
    component: () => import('@/views/trade/Profile.vue'),
    meta: { title: '个人中心' }
  },

  // ====== 管理员 ======
  {
    path: '/trade/admin/audits',
    name: 'AdminAudits',
    component: () => import('@/views/trade/AuditList.vue'),
    meta: { title: '商品审核', requiresAdmin: true }
  },
  {
    path: '/trade/admin/users',
    name: 'AdminUsers',
    component: () => import('@/views/trade/AdminUsers.vue'),
    meta: { title: '用户管理', requiresAdmin: true }
  },

  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '404' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 全局前置守卫：设置页面标题 + 管理员权限校验
router.beforeEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — 账号交易` : '账号交易平台'

  // 管理员路由权限检查
  if (to.meta.requiresAdmin) {
    const user = JSON.parse(localStorage.getItem('trade_user') || 'null')
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return '/trade/login'
    }
  }
})

export default router
