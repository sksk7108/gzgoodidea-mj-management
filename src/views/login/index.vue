<template>
  <div class="login-container" :style="{ backgroundImage: `url(${appStore.config.loginBg || '/bg4.jpg'})` }">
    <div class="login-card">
      <div v-if="configLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <div class="loading-text">加载中...</div>
      </div>
      <template v-else>
        <div class="logo-container">
          <img :src="appStore.config.logo" class="logo-img" alt="logo">
          <h2 class="logo-text">{{ appStore.config.title }}</h2>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-item">
            <input
                    v-model="loginForm.username"
                    type="text"
                    placeholder="请输入用户名"
                    :class="{'input-error': errors.username}"
                    @keyup.enter="handleLogin"
            />
          </div>

          <div class="form-item">
            <input
                    v-model="loginForm.password"
                    type="password"
                    placeholder="请输入密码"
                    :class="{'input-error': errors.password}"
                    @keyup.enter="handleLogin"
            />
          </div>

          <div class="form-item remember-me">
            <input type="checkbox" id="rememberMe" v-model="loginForm.rememberMe" />
            <label for="rememberMe">记住密码</label>
            
          </div>

          <div class="form-item">
            <button type="submit" :disabled="loading" class="login-button">
              {{ loading ? '登录中...' : '登录' }}
            </button>
          </div>
        </form>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import { ElMessage } from 'element-plus'
import { getCompanyIdFromUrl, saveCompanyId } from '@/utils/companyConfig'
import { saveCredentials, getCredentials, clearCredentials } from '@/utils/crypto'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

const loading = ref(false)
const configLoading = ref(true)

// 登录表单
const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false,
  companyId: ''
})


const errors = reactive({
  username: '',
  password: ''
})

// 表单验证规则
const validateForm = () => {
  let isValid = true
  if (!loginForm.username) {
    errors.username = '请输入用户名'
    isValid = false
  } else if (loginForm.username.length < 3 || loginForm.username.length > 20) {
    errors.username = '用户名长度在 3 到 20 个字符'
    isValid = false
  } else {
    errors.username = ''
  }

  if (!loginForm.password) {
    errors.password = '请输入密码'
    isValid = false
  } else if (loginForm.password.length < 8 || loginForm.password.length > 30) {
    errors.password = '密码长度在 8 到 30 个字符'
    isValid = false
  } else {
    errors.password = ''
  }

  if (errors.username){
    ElMessage.warning(errors.username)
  } else if (errors.password) {
    ElMessage.warning(errors.password)
  }

  return isValid
}

// 处理登录
const handleLogin = async () => {
  if (!validateForm()) return

  loading.value = true
  try {
    loginForm.companyId = route.params.companyId || getCompanyIdFromUrl()
    
    // 保存公司ID到本地存储
    saveCompanyId(loginForm.companyId)
    
    const success = await userStore.loginAction(loginForm)
    if (success) {
      // 处理记住密码
      if (loginForm.rememberMe) {
        saveCredentials(loginForm.username, loginForm.password)
      } else {
        clearCredentials()
      }

      // 获取用户信息
      await userStore.getUserInfoAction()
      
      // 重定向
      const redirect = route.query.redirect || '/'
      router.push(redirect)
      
      ElMessage.success('登录成功')
    }
  } catch (error) {
    console.error('登录失败', error)
  } finally {
    loading.value = false
  }
}

// 获取公司配置
const initCompanyConfig = async () => {
  configLoading.value = true
  
  const companyId = route.params.companyId
  if (companyId) {
    try {
      appStore.resetState()
      // 从API获取公司配置
      await appStore.fetchCompanyConfig(companyId)
      console.log(companyId)
      document.title = appStore.config.title || '后台管理系统'
      
      // 获取保存的凭证
      loadSavedCredentials()
    } catch (error) {
      console.error('获取公司配置失败', error)
    } finally {
      configLoading.value = false
    }
  } else {
    configLoading.value = false
  }
}

// 加载保存的凭证
const loadSavedCredentials = () => {
  const credentials = getCredentials()
  if (credentials) {
    loginForm.username = credentials.username
    loginForm.password = credentials.password
    loginForm.rememberMe = true
  }
}

onMounted(() => {
  initCompanyConfig()
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-size: cover;
  background-position: center;
  background-color: rgba(59, 137, 154, 1.000);
}

.login-card {
  width: 420px;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  backdrop-filter: blur(5px);
}

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

.loading-text {
  margin-top: 15px;
  color: #fff;
  font-size: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
}

.logo-img {
  width: 50px;
  height: 50px;
  margin-right: 10px;
}

.logo-text {
  font-size: 24px;
  color: #f0f0f0;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.form-item {
  width: 80%;
  display: flex;
  margin-bottom: 15px;
}

.form-item.remember-me {
  position: relative;
  align-items: center;
}

.form-item label {
  color: white;
  font-size: 14px;
  margin-left: 5px;
}

.remember-tip:hover .tip-content {
  display: block;
}

.form-item input:focus,
.form-item button:focus {
  outline: none;
}

.form-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.form-item input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-item input:not([type="checkbox"]),
.form-item button {
  flex: 1;
  margin: 6px 0;
  font-size: 15px;
  height: 46px;
  background-color: rgba(255, 255, 255, .2);
  border: 1px solid #ffffff00;
  border-radius: 4px;
  padding: 0 14px;
  color: white;
}

.input-error {
  border: 1px solid rgba(255, 87, 87, 0.7) !important;
}

.login-button {
  position: relative;
  margin-top: 22px;
  background-color: rgba(93, 128, 137, .4);
  color: #ffffff;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s;
}

.login-button::before,
.login-button::after {
  content: '';
  display: block;
  width: 80px;
  height: 100%;
  background-color: rgba(179, 255, 241, 0.5);
  opacity: 0.5;
  position: absolute;
  left: 0;
  top: 0;
  transform: skewX(-15deg);
  filter: blur(30px);
  overflow: hidden;
  transform: translateX(-100px);
}

.login-button::after {
  width: 40px;
  background-color: rgba(179, 255, 232, 0.3);
  left: 60px;
  filter: blur(5px);
  opacity: 0;
}

.login-button:hover:not(:disabled)::before {
  transition: all 1s;
  transform: translateX(320px);
  opacity: 0.7;
}

.login-button:hover:not(:disabled)::after {
  transition: all 1s;
  transform: translateX(320px);
  opacity: 1;
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-button:hover:not(:disabled) {
  background-color: rgba(27, 130, 134, 0.67);
}
</style>
