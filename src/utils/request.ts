import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '', // 移除 '/api' 前缀
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 可以在这里添加token等认证信息
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    // 检查响应数据结构
    const responseData = response.data
    
    // 如果响应是一个对象，并且只包含 data 字段，则返回 data 的值
    if (responseData && typeof responseData === 'object') {
      if ('data' in responseData && Object.keys(responseData).length === 1) {
        return responseData.data
      }
    }
    
    // 否则返回完整的响应数据
    return responseData
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)


export default request
