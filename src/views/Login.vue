<template>
    <div class="login-container">
      <h2>管理员登录</h2>
      <el-form :model="loginForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="loginForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input type="password" v-model="loginForm.password"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin">登录</el-button>
          <el-button @click="goToRegister">注册</el-button>
        </el-form-item>
      </el-form>
    </div>
  </template>
  
  <script setup>
  import { reactive } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import axios from 'axios'
  
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
      router.push('/admin/test-questions')
    } catch (error) {
      ElMessage.error(error.response.data.message || '登录失败')
    }
  }
  
  const goToRegister = () => {
    router.push('/register')
  }
  </script>