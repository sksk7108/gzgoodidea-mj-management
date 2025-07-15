import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getCompanyIdFromUrl } from "@/utils/companyConfig.js";
import router from "@/router/index.js";
import { useUserStore } from "@/stores/user.js";


// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/system',
  timeout: 15000,
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data
    // 根据后端接口规范判断请求是否成功
    if (res.code !== 200) {
      ElMessage({
        message: res.message || '请求失败',
        type: 'error',
        duration: 5 * 1000
      })
      
      // 401: 未登录或token过期
      if (res.code === 401) {
        // 重定向到登录页
        const userStore = useUserStore()
        userStore.resetState()
        router.replace('/login')
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    } else {
      return res
    }
  },
  (error) => {
    // 处理HTTP错误
    let message = '连接服务器失败';
    if (error.response) {
      switch (error.response.status) {
        case 401:
          const userStore = useUserStore()
          message = '未授权或token失效，请重新登录';
          userStore.resetState()
          router.replace(`/login`)
          break;
        case 403:
          message = '拒绝访问';
          break;
        case 404:
          message = '请求的资源不存在';
          break;
        case 500:
          message = '服务器内部错误';
          break;
        default:
          message = `请求失败: ${error.response.status}`;
      }
    }

    return Promise.reject(new Error(message))
  }
)

export default service 