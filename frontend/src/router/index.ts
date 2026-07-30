import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('@/views/LandingView.vue'),
    meta: { title: '首页', public: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: '登录', public: true },
  },
  {
    path: '/app',
    component: () => import('@/components/layout/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: { title: '系统总览', icon: 'Odometer' },
      },
      {
        path: 'monitor',
        name: 'Monitor',
        component: () => import('@/views/MonitorView.vue'),
        meta: { title: '实时监测', icon: 'Monitor' },
      },
      {
        path: 'digital-twin',
        name: 'DigitalTwin',
        component: () => import('@/views/DigitalTwinView.vue'),
        meta: { title: '数字孪生', icon: 'Platform' },
      },
      {
        path: 'warning',
        name: 'Warning',
        component: () => import('@/views/WarningView.vue'),
        meta: { title: '预警管理', icon: 'WarningFilled' },
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: () => import('@/views/AnalyticsView.vue'),
        meta: { title: '数据分析', icon: 'DataAnalysis' },
      },
      {
        path: 'sensors',
        name: 'Sensors',
        component: () => import('@/views/SensorView.vue'),
        meta: { title: '传感器管理', icon: 'Cpu' },
      },
      {
        path: 'device-access',
        name: 'DeviceAccess',
        component: () => import('@/views/DeviceAccessView.vue'),
        meta: { title: '设备接入', icon: 'Connection' },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/SettingsView.vue'),
        meta: { title: '系统设置', icon: 'Setting' },
      },
    ],
  },
  // 兜底重定向
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  const title = to.meta.title as string
  if (title) {
    document.title = `${title} - 矿穹智警`
  }

  const token = localStorage.getItem('token')
  const isPublic = to.meta.public === true

  // 公开页面直接放行
  if (isPublic) {
    // 已登录用户访问 / 或 /login → 重定向到仪表盘
    if (token && (to.path === '/' || to.path === '/login')) {
      next({ path: '/app' })
    } else {
      next()
    }
    return
  }

  // 需要认证的页面
  if (!token) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  next()
})

export default router
