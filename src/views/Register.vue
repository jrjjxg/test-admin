<template>
    <div class="register-container">
      <h2>管理员注册</h2>
      <el-form :model="registerForm" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="registerForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input type="password" v-model="registerForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="registerForm.email"></el-input>
        </el-form-item>
        <el-form-item label="验证码">
          <el-input v-model="registerForm.code"></el-input>
          <el-button type="primary" @click="sendVerificationCode" :disabled="codeBtnDisabled">
            {{ codeBtnText }}
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleRegister">注册</el-button>
        </el-form-item>
      </el-form>
    </div>
  </template>
  
  <script setup>
  import { reactive, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import axios from 'axios'
  
  const router = useRouter()
  const registerForm = reactive({
    username: '',
    password: '',
    email: '',
    code: ''
  })
  
  const codeBtnDisabled = ref(false)
  const codeBtnText = ref('获取验证码')
  let countdown = 60
  
  const sendVerificationCode = async () => {
    if (!registerForm.email) {
      ElMessage.warning('请输入邮箱')
      return
    }
    try {
      //这里使用了相对路径 /api/admin/register/send-code。在没有配置代理的情况下，浏览器会直接将这个请求发送到前端服务器的地址，也就是 http://localhost:5173。
      await axios.post('/api/admin/register/send-code', { email: registerForm.email })
      ElMessage.success('验证码已发送')
      codeBtnDisabled.value = true
      codeBtnText.value = `${countdown}秒后重试`
      const timer = setInterval(() => {
        countdown--
        codeBtnText.value = `${countdown}秒后重试`
        if (countdown <= 0) {
          clearInterval(timer)
          codeBtnDisabled.value = false
          codeBtnText.value = '获取验证码'
          countdown = 60
        }
      }, 1000)
    } catch (error) {
      ElMessage.error(error.response.data.message || '发送失败')
    }
  }
  
  const handleRegister = async () => {
    try {
      await axios.post('/api/admin/register', registerForm)
      ElMessage.success('注册成功，请登录')
      router.push('/login')
    } catch (error) {
      ElMessage.error(error.response.data.message || '注册失败')
    }
  }
  </script>