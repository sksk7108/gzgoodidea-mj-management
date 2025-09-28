import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCompanyIdFromUrl, saveCompanyId } from '@/utils/companyConfig'
import { getCompanyConfig } from '@/api/config'
import companyConfig from '@/config/companyConfig.json'
import { ElMessage } from 'element-plus'

// 存储配置的key
const STORE_CONFIG_KEY = 'store_company_config'

// 默认配置
const defaultConfig = {
  logo: '/admin/management.svg',
  title: '后台管理系统',
  loginBg: '/admin/bg4.jpg',
  theme: {
    primaryColor: '#409EFF',
    menuBgColor: '#304156',
    menuTextColor: '#bfcbd9',
    menuActiveTextColor: '#409EFF'
  },
  modules: ['user']
}

// 从localStorage获取存储的配置
const getStoredConfig = () => {
  try {
    const storedConfig = localStorage.getItem(STORE_CONFIG_KEY)
    if (storedConfig) {
      return JSON.parse(storedConfig)
    }
  } catch (error) {
    console.error('解析存储的配置失败', error)
  }
  return null
}

// 保存配置到localStorage
const saveConfigToStorage = (config) => {
  try {
    localStorage.setItem(STORE_CONFIG_KEY, JSON.stringify(config))
  } catch (error) {
    console.error('保存配置到本地存储失败', error)
  }
}

export const useAppStore = defineStore('app', () => {
  // 初始化配置，优先使用localStorage中的配置
  const storedConfig = getStoredConfig()
  const isCollapse = ref(false)
  const config = ref(storedConfig || defaultConfig)
  const loading = ref(false)
  const isLoaded = ref(false)
  
  // 从API获取公司配置
  const fetchCompanyConfig = async (companyId) => {
    if (isLoaded.value) return true
    if (loading.value) return false

    if (!companyId) {
      companyId = getCompanyIdFromUrl()
    }
    
    if (!companyId) {
      return false
    }

    loading.value = true
    try {
      // const res = await getCompanyConfig(companyId)
      // 暂时使用模拟方式
      const res = await new Promise((resolve)=>{
        setTimeout(()=>{
          resolve({code:200,data:companyConfig[companyId] || defaultConfig, message: '获取公司配置成功'})
        }, 500)
      })
      if (res.code === 200 && res.data) {
        const newConfig = {
          ...defaultConfig,
          ...res.data,
          companyId
        } 
        config.value = newConfig
        
        // 保存配置到localStorage
        saveConfigToStorage(newConfig)
        
        // 保存公司ID
        saveCompanyId(companyId)

        isLoaded.value = true

        applyTheme()
        return true
      } else {
        ElMessage.error(res.message || '获取公司配置失败')
        return false
      }
    } catch (error) {
      console.error('获取公司配置失败', error)
      ElMessage.error('获取公司配置失败，将使用默认配置')
      return false
    } finally {
      loading.value = false
    }
  }
  
  // 应用主题配置
  const applyTheme = () => {
    const theme = config.value.theme
    const style = document.createElement('style')
    
    style.textContent = `
      :root {
        --el-color-primary: ${theme.primaryColor};
        --menu-bg-color: ${theme.menuBgColor};
        --menu-text-color: ${theme.menuTextColor};
        --menu-active-text-color: ${theme.menuActiveTextColor};
      }
    `
    
    document.head.appendChild(style)
  }
  
  // 检查模块是否可用
  const isModuleAvailable = (moduleName) => {
    return config.value.modules.includes(moduleName)
  }
  
  // 切换菜单折叠状态
  const toggleSideBar = () => {
    isCollapse.value = !isCollapse.value
  }
  
  // 清除配置
  const clearConfig = () => {
    config.value = defaultConfig
    localStorage.removeItem(STORE_CONFIG_KEY)
  }

  // 重置状态
  const resetState = () => {
    isCollapse.value = false
    config.value = { ...defaultConfig }
    loading.value = false
    isLoaded.value = false
    localStorage.removeItem(STORE_CONFIG_KEY)
    localStorage.removeItem('store_company_id')
  }
  
  // 如果有存储的配置，初始化时应用主题
  if (storedConfig) {
    applyTheme()
  }
  
  return {
    isCollapse,
    config,
    loading,
    fetchCompanyConfig,
    applyTheme,
    isModuleAvailable,
    toggleSideBar,
    clearConfig,
    resetState
  }
}) 