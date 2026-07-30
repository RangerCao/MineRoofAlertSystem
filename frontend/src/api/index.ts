import axios from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      // Token 过期或无效，清除并跳转登录
      localStorage.removeItem('token')
      // 使用 router 实例跳转（避免循环依赖，延迟导入）
      import('@/router').then(({ default: router }) => {
        const currentPath = router.currentRoute.value.fullPath
        if (currentPath !== '/login') {
          router.push({ path: '/login', query: { redirect: currentPath } })
        } else {
          router.push('/login')
        }
      })
    }
    return Promise.reject(error)
  }
)

export default service
