<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// 返回首页
const goHome = () => {
  router.push('/')
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}
</script>

<template>
  <div class="error-container">
    <div class="error-content">
      <h1 class="error-code">404</h1>
      <div class="error-message">抱歉，您访问的页面不存在</div>
      <div class="error-actions">
        <el-button type="primary" @click="goHome">返回首页</el-button>
        <el-button @click="goBack">返回上一页</el-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
  
  .error-content {
    text-align: center;
    
    .error-code {
      font-size: 120px;
      font-weight: bold;
      color: var(--el-color-primary);
      margin: 0;
      line-height: 1.2;
    }
    
    .error-message {
      font-size: 24px;
      color: #606266;
      margin: 20px 0 30px;
    }
    
    .error-actions {
      .el-button {
        margin: 0 10px;
      }
    }
  }
}
</style> 