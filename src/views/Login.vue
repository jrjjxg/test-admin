<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">在线管理系统</h2>
      <div class="login-tabs">
        <span class="active-tab">账号密码登录</span>
      </div>
      <el-form :model="loginForm" class="login-form">
        <el-form-item>
          <el-input v-model="loginForm.username" placeholder="用户名" prefix-icon="User"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input type="password" v-model="loginForm.password" placeholder="密码" prefix-icon="Lock"></el-input>
        </el-form-item>
        <div class="login-options">
          <div></div>
          <span class="register-link" @click="goToRegister">注册账号</span>
        </div>
        <el-button type="primary" class="login-button" @click="handleLogin">登 录</el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const loginForm = reactive({
  username: '',
  password: ''
})

const handleLogin = async () => {
  try {
    const response = await axios.post('/api/admin/login', loginForm)

    localStorage.setItem('token', response.data.data.id) // 假设后端返回用户ID作为token
    ElMessage.success('登录成功')
    router.push('/admin/test-types')
  } catch (error) {
    ElMessage.error(error.response.data.message || '登录失败')
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
/* 添加全局样式重置，确保没有默认边距和填充 */
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  /* 防止出现滚动条 */
}

.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('');
  /* 这里预留背景图片路径 */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: fixed;
  /* 固定定位确保覆盖整个视口 */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
  background-color: #e67e22;
  /* 橙色背景 */
  background-image: linear-gradient(135deg, #e67e22, #f39c12);
  /* 橙色渐变效果 */
}

.login-box {
  width: 400px;
  padding: 30px;
  border-radius: 8px;
  background-color: rgba(255, 245, 222, 0.8);
  /* 更改为类似图片中的米黄色 */
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.login-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.active-tab {
  color: #409EFF;
  font-weight: bold;
  position: relative;
  padding: 0 20px 10px;
}

.active-tab::after {
  content: '';
  position: absolute;
  bottom: -11px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #409EFF;
}

.login-form {
  margin-top: 20px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.register-link {
  color: #409EFF;
  cursor: pointer;
}

.login-button {
  width: 100%;
  height: 40px;
  font-size: 16px;
}
</style>