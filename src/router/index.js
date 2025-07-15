import { createRouter, createWebHistory } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'

// 布局
const Layout = () => import('@/layouts/MainLayout.vue')
const EmptyLayout = () => import('@/layouts/EmptyLayout.vue')

// 路由配置
const routes = [
  {
    path: '/login',
    redirect: '/login/MJ-10001',
    hidden: true
  },
  {
    path: '/login/:companyId',
    component: () => import('@/views/login/index.vue'),
    hidden: true
  },
  {
    path: '',
    redirect: '/user',
    hidden: true
  },
  {
    path: '/dashboard',
    component: Layout,
    redirect: '/dashboard',
    meta: { title: '仪表盘', icon: 'Odometer', module: 'dashboard' },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        // component: () => import('@/views/dashboard/index.vue'),
        component: EmptyLayout,
        meta: { title: '仪表盘', icon: 'Odometer', module: 'dashboard' }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    redirect: '/user/list',
    meta: { title: '用户管理', icon: 'User', module: 'user' },
    children: [
      {
        path: 'list',
        name: 'UserList',
        component: () => import('@/views/user/list.vue'),
        meta: { title: '用户列表', icon: 'List', module: 'user' }
      }
    ]
  },
  {
    path: '/system',
    component: Layout,
    redirect: '/system/settings',
    meta: { title: '系统管理', icon: 'Setting', module: 'system' },
    children: [
      {
        path: 'settings',
        name: 'SystemSettings',
        component: EmptyLayout,
        meta: { title: '系统设置', icon: 'Tools', module: 'system' }
      }
    ]
  },
  {
    path: '/404',
    component: () => import('@/views/error/404.vue'),
    hidden: true
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    hidden: true
  }
]

const router = createRouter({
  history: createWebHistory('/admin/'),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 获取token
  const userStore = useUserStore()
  const hasToken = userStore.token
  
  if (hasToken) {
    if (to.path.startsWith('/login')) {
      // 已登录则重定向到首页
      next({ path: '/' })
    } else {
      // 判断是否有用户信息
      const hasUserInfo = Object.keys(userStore.userInfo).length > 0
      
      if (hasUserInfo) {
        // 检查模块权限
        const appStore = useAppStore()
        const module = to.meta.module
        if (module && !appStore.isModuleAvailable(module)) {
          next('/404')
        } else {
          next()
        }
      } else {
        try {
          // 获取用户信息
          await userStore.getUserInfoAction()
          
          // 检查模块权限
          const appStore = useAppStore()
          const module = to.meta.module
          if (module && !appStore.isModuleAvailable(module)) {
            next('/404')
          } else {
            next()
          }
        } catch (error) {
          // 获取用户信息失败，重置token并跳转到登录页
          userStore.resetState()
          next(`/login?redirect=${to.path}`)
        }
      }
    }
  } else {
    // 未登录可以访问白名单页面
    if (to.path.startsWith('/login')) {
      next()
    } else {
      // 重定向到登录页
      next(`/login?redirect=${to.path}`)
    }
  }
})

export default router 