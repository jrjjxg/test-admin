import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Layout from '../views/Layout.vue'
// 导入 TestQuestionManager 组件
import TestQuestionManager from '../views/admin/TestQuestionManager.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/register',
      name: 'register',
      component: Register
    },
    {
      path: '/',
      component: Layout,
      redirect: '/admin/test-questions', // 重定向到测试题目管理页面
      children: [
        {
          path: '/admin/test-questions', // 使用绝对路径
          name: 'test-questions',
          component: TestQuestionManager // 使用 TestQuestionManager 组件
        }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.name !== 'login' && to.name !== 'register' && !token) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
