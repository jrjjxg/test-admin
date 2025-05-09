import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Layout from '../views/Layout.vue'
import TestTypeManager from '../views/admin/TestTypeManager.vue'
import TestQuestionManager from '@/views/admin/TestQuestionManager.vue'
import CategoryManager from '../views/media/CategoryManager.vue'
import ResourceManager from '../views/media/ResourceManager.vue'
import Dashboard from '../views/Dashboard.vue'
/**
 * 创建路由实例
 * createWebHistory: 使用HTML5 History模式，URL不带#
 * BASE_URL: 从环境变量获取基础路径
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: { requiresAuth: false }
    },
   {
    path: '/',
    component: Layout,
    redirect: '/admin/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: '/admin/dashboard',
        name: 'dashboard',
        component: Dashboard,
        meta: { 
          requiresAuth: true,
          title: '数据看板' 
        }
      },
      {
        path: '/admin/test-types',
        name: 'test-types',
        component: TestTypeManager,
        meta: { requiresAuth: true }
      },
      {
        path: '/admin/test-questions',
        name: 'TestQuestionManager',
        component: TestQuestionManager,
        meta: {
          requiresAuth: true,
          title: '测试题目管理'
        }
      },
      {
        path: '/admin/audit-list',
        name: 'audit-list',
        component: () => import('@/views/admin/AuditList.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/admin/media/resource',
        name: 'media-resource',
        component: () => import('@/views/media/ResourceManager.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/admin/media/category',
        name: 'media-category',
        component: CategoryManager,
        meta: { requiresAuth: true }
      },
      {
        path: '/admin/test-score-level',
        name: 'TestScoreLevelManager',
        component: () => import('@/views/admin/TestScoreLevelManager.vue'),
        meta: { title: '测试分数解读管理', requireAuth: true }
      },
      {
        path: '/admin/test/category',
        name: 'CategoryManager',
        component: () => import('@/views/admin/CategoryManager.vue'),
        meta: { title: '测试分类管理' }
      }
    ]
  }
  ]
})

/**
 * 全局前置守卫
 * 在每次路由导航前执行
 * @param {Object} to - 目标路由对象
 * @param {Object} from - 来源路由对象
 * @param {Function} next - 控制导航的函数
 */
router.beforeEach((to, from, next) => {
  // 从localStorage获取token
  const token = localStorage.getItem('token')
  
  // 检查目标路由是否需要认证（通过meta.requiresAuth判断）
  // matched数组包含当前路由及其所有父级路由
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  // 如果页面需要认证且没有token
  if (requiresAuth && !token) {
    console.log('需要登录，重定向到登录页')
    next({ name: 'login' }) // 重定向到登录页
  } 
  // 如果已登录且要去登录页或注册页
  else if (token && (to.name === 'login' || to.name === 'register')) {
    console.log('已登录，重定向到首页')
    next({ path: '/admin/dashboard' }) // 重定向到数据看板页面
  }
  // 情况3: 其他正常情况，放行
  else {
    next() // 继续导航
  }
})

export default router
