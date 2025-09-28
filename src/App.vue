<script setup>
import { onMounted } from 'vue'
import { useAppStore } from './stores/app'
import { getCompanyIdFromUrl } from './utils/companyConfig'
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores/user.js";
import FlyLoading from './components/loading/FlyLoading.vue'

const appStore = useAppStore()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

onMounted(async () => {
  // clearCompanyId()
  // 获取公司ID
  const companyId = getCompanyIdFromUrl()
  if (!companyId) {
    userStore.resetState()
    router.replace('/login')
  }
  
  // 获取公司配置
  if (companyId && !route.path.includes('login')) {
    await appStore.fetchCompanyConfig(companyId.toUpperCase())
  }
})
</script>

<template>
  <div class="app-container">
    <div v-if="appStore.loading && !route.path.includes('login')" class="loading-status">
      <FlyLoading />
    </div>
    <router-view v-else />
  </div>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}

#app {
  height: 100%;
  width: 100%;
}
.loading-status {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}

</style>
