// src/utils/request.js
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

const service = axios.create({
  baseURL: '',
  timeout: 15000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    console.log('请求配置:', config)  // 添加请求日志
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)  // 添加错误日志
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    console.log('响应数据:', response.data)  // 添加响应日志
    const res = response.data
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  error => {
    console.error('响应错误:', error)  // 添加错误日志
    if (error.response.status === 401) {
      // 未登录或token过期
      ElMessage.error('请先登录')
      localStorage.removeItem('token')
      router.push('/login')
    } else {
      ElMessage.error(error.response.data.message || '请求失败')
    }
    return Promise.reject(error)
  }
)

export default service