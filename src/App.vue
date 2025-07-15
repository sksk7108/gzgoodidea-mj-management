<script setup>
import { onMounted } from 'vue'
import { useAppStore } from './stores/app'
import { getCompanyIdFromUrl, clearCompanyId, clearCompanyConfig } from './utils/companyConfig'

const appStore = useAppStore()

onMounted(async () => {
  clearCompanyId()
  // 获取公司ID
  const companyId = getCompanyIdFromUrl()
  
  // 获取公司配置
  if (companyId) {
    await appStore.fetchCompanyConfig(companyId.toUpperCase())
  }
})
</script>

<template>
  <router-view />
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
</style>
