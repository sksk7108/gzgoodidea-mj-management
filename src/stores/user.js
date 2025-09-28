import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, logout, getUserInfo } from '@/api/auth'
import { ElMessage } from 'element-plus'
import { useAppStore } from './app'
import { clearCompanyId, clearCompanyConfig } from '@/utils/companyConfig'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref({})
  const roles = ref([])
  const permissions = ref([])
  
  // 登录
  const loginAction = async (loginData) => {
    try {
      const res = await login(loginData)
      if (res.data && res.data.token) {
        token.value = res.data.token
        localStorage.setItem('token', res.data.token)
        return true
      }
      return false
    } catch (error) {
      ElMessage.error(error.message || '登录失败')
      return false
    }
  }
  
  // 获取用户信息
  const getUserInfoAction = async () => {
    if (!token.value) {
      return false
    }
    
    try {
      const res = await getUserInfo()
      if (res.data) {
        userInfo.value = res.data
        roles.value = res.data.roles || []
        permissions.value = res.data.permissions || []
        return true
      }
      return false
    } catch (error) {
      // ElMessage.error(error.message || '获取用户信息失败')
      return false
    }
  }
  
  // 登出
  const logoutAction = async () => {
    try {
      if (token.value) {
        logout(token.value)
      }
      resetState()
      
      // 清除公司ID
      // clearCompanyId()
      
      return true
    } catch (error) {
      ElMessage.error(error.message || '登出失败')
      return false
    }
  }
  
  // 重置状态
  const resetState = () => {
    token.value = ''
    userInfo.value = {}
    roles.value = []
    permissions.value = []
    localStorage.removeItem('token')
  }
  
  return {
    token,
    userInfo,
    roles,
    permissions,
    loginAction,
    getUserInfoAction,
    logoutAction,
    resetState
  }
}) 