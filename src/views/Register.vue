<template>
  <div class="register-container">
    <div class="register-box">
      <h2 class="register-title">在线管理系统</h2>
      <div class="register-tabs">
        <span class="active-tab">管理员注册</span>
      </div>
      <el-form :model="registerForm" class="register-form">
        <el-form-item>
          <el-input v-model="registerForm.username" placeholder="请输入用户名" prefix-icon="User"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input type="password" v-model="registerForm.password" placeholder="请输入密码" prefix-icon="Lock"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="registerForm.email" placeholder="请输入邮箱" prefix-icon="Message"></el-input>
        </el-form-item>
        <el-form-item class="verification-code-item">
          <el-input v-model="registerForm.code" placeholder="请输入验证码" prefix-icon="Key"></el-input>
          <el-button type="primary" class="code-button" @click="sendVerificationCode" :disabled="codeBtnDisabled">
            {{ codeBtnText }}
          </el-button>
        </el-form-item>
        <div class="register-options">
          <span class="login-link" @click="goToLogin">已有账号？去登录</span>
        </div>
        <el-button type="primary" class="register-button" @click="handleRegister">注 册</el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { User, Lock, Message, Key } from '@element-plus/icons-vue'

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

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.register-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url(''); /* 预留背景图片路径，与登录页保持一致 */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
  background-color: #e67e22; /* 橙色背景 */
  background-image: linear-gradient(135deg, #e67e22, #f39c12); /* 橙色渐变效果 */
}

.register-box {
  width: 400px;
  padding: 30px;
  border-radius: 8px;
  background-color: rgba(255, 245, 222, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.register-title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.register-tabs {
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

.register-form {
  margin-top: 20px;
}

.verification-code-item {
  display: flex;
  align-items: center;
}

.verification-code-item :deep(.el-input) {
  flex: 1;
  margin-right: 10px;
}

.code-button {
  width: 120px;
  font-size: 12px;
  padding: 0 5px;
  height: 40px;
}

.register-options {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.login-link {
  color: #409EFF;
  cursor: pointer;
  font-size: 14px;
}

.register-button {
  width: 100%;
  height: 40px;
  font-size: 16px;
}
</style>