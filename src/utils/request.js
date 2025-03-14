// src/utils/request.js
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'
import { getToken } from '@/utils/auth'

/**
 * 创建axios实例
 * 可以设置基础URL、超时时间等全局配置
 */
const service = axios.create({
  baseURL: '',
  timeout: 15000
})

/**
 * 请求拦截器
 * 在发送请求前执行，可以修改请求配置
 */
service.interceptors.request.use(
  // 成功拦截器
  config => {
    console.log('请求配置:', config)  // 添加请求日志，便于调试
    
    const token = getToken()
    
    // 如果有token，添加到请求头中
    if (token) {
      // 添加Bearer认证头，这是JWT的标准用法
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    return config // 返回修改后的配置
  },
  // 错误拦截器
  error => {
    console.error('请求错误:', error)  // 记录请求错误
    return Promise.reject(error) // 将错误继续向下传递，便于后续处理
  }
)

/**
 * 响应拦截器
 * 在接收响应后执行，可以统一处理响应数据和错误
 */
service.interceptors.response.use(
  // 成功响应拦截器
  response => {
    console.log('响应数据:', response.data)  // 添加响应日志，便于调试
    
    const res = response.data
    
    // 假设后端API返回格式为 {code: 200, data: {...}, message: '成功'}
    // 这里检查响应状态码，非200表示业务逻辑错误
    if (res.code !== 200) {
      // 显示错误消息
      ElMessage.error(res.message || '请求失败')
      // 返回Promise.reject，使调用方可以捕获到错误
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    
    // 返回响应数据，这里直接返回res而不是response
    // 这样调用方可以直接获取到业务数据，而不需要再通过response.data访问
    return res
  },
  // 错误响应拦截器
  error => {
    console.error('响应错误:', error)  // 添加错误日志
    if (error.response.status === 401) {
      // 未登录或token过期
      ElMessage.error('请先登录')
      // 清除无效的token
      localStorage.removeItem('token')
      // 重定向到登录页
      router.push('/login')
    } else {
      // 处理其他错误
      ElMessage.error(error.response?.data?.message || '请求失败')
    }
    
    // 将错误继续向下传递，便于调用方处理
    return Promise.reject(error)
  }
)

export default service