<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'

const userStore = useUserStore()
const appStore = useAppStore()

// 欢迎信息
const welcomeMessage = ref('')
const currentTime = ref('')

// 更新时间
const updateTime = () => {
  const now = new Date()
  const hours = now.getHours()
  
  // 根据时间段设置欢迎语
  if (hours < 6) {
    welcomeMessage.value = '凌晨好'
  } else if (hours < 9) {
    welcomeMessage.value = '早上好'
  } else if (hours < 12) {
    welcomeMessage.value = '上午好'
  } else if (hours < 14) {
    welcomeMessage.value = '中午好'
  } else if (hours < 17) {
    welcomeMessage.value = '下午好'
  } else if (hours < 19) {
    welcomeMessage.value = '傍晚好'
  } else {
    welcomeMessage.value = '晚上好'
  }
  
  // 格式化时间
  currentTime.value = now.toLocaleString()
}

// 统计数据
const statistics = reactive({
  userCount: 0,
  todayActiveUsers: 0,
  newUsers: 0,
  totalPowerPoint: 0
})

// 加载统计数据
const loadStatistics = () => {
  // 模拟数据，实际项目中应从API获取
  statistics.userCount = 1024
  statistics.todayActiveUsers = 256
  statistics.newUsers = 64
  statistics.totalPowerPoint = 9876543
}

onMounted(() => {
  updateTime()
  loadStatistics()
  
  // 每分钟更新一次时间
  setInterval(updateTime, 60000)
})
</script>

<template>
  <div class="dashboard-container">
    <!-- 欢迎信息 -->
    <el-card class="welcome-card">
      <div class="welcome-content">
        <div class="left">
          <div class="greeting">
            {{ welcomeMessage }}，{{ userStore.userInfo.nickname || userStore.userInfo.username }}
          </div>
          <div class="company">{{ appStore.config.title }}</div>
          <div class="time">当前时间：{{ currentTime }}</div>
        </div>
        <div class="right">
          <el-avatar :size="64" :src="userStore.userInfo.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
        </div>
      </div>
    </el-card>
    
    <!-- 统计卡片 -->
    <div class="statistics-cards">
      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>用户总数</span>
          </div>
        </template>
        <div class="card-value">{{ statistics.userCount }}</div>
        <div class="card-icon">
          <el-icon><User /></el-icon>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>今日活跃用户</span>
          </div>
        </template>
        <div class="card-value">{{ statistics.todayActiveUsers }}</div>
        <div class="card-icon">
          <el-icon><View /></el-icon>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>新增用户</span>
          </div>
        </template>
        <div class="card-value">{{ statistics.newUsers }}</div>
        <div class="card-icon">
          <el-icon><Plus /></el-icon>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>总算力点</span>
          </div>
        </template>
        <div class="card-value">{{ statistics.totalPowerPoint }}</div>
        <div class="card-icon">
          <el-icon><Cpu /></el-icon>
        </div>
      </el-card>
    </div>
    
    <!-- 系统信息 -->
    <el-card class="system-card">
      <template #header>
        <div class="card-header">
          <span>系统信息</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="系统名称">{{ appStore.config.title }}</el-descriptions-item>
        <el-descriptions-item label="公司ID">{{ appStore.config.companyId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="当前用户">{{ userStore.userInfo.username || '-' }}</el-descriptions-item>
        <el-descriptions-item label="用户角色">{{ userStore.userInfo.role || '-' }}</el-descriptions-item>
        <el-descriptions-item label="最后登录时间">{{ userStore.userInfo.last_login_time || '-' }}</el-descriptions-item>
        <el-descriptions-item label="最后登录IP">{{ userStore.userInfo.last_login_ip || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-container {
  .welcome-card {
    margin-bottom: 20px;
    
    .welcome-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .left {
        .greeting {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        
        .company {
          font-size: 16px;
          color: #606266;
          margin-bottom: 10px;
        }
        
        .time {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }
  
  .statistics-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 20px;
    
    .stat-card {
      position: relative;
      overflow: hidden;
      
      .card-header {
        font-weight: 600;
      }
      
      .card-value {
        font-size: 28px;
        font-weight: bold;
        margin-top: 10px;
      }
      
      .card-icon {
        position: absolute;
        right: 20px;
        bottom: 20px;
        font-size: 48px;
        opacity: 0.2;
      }
    }
  }
  
  .system-card {
    .card-header {
      font-weight: 600;
    }
  }
}

// 响应式布局
@media (max-width: 1200px) {
  .dashboard-container {
    .statistics-cards {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    .statistics-cards {
      grid-template-columns: 1fr;
    }
  }
}
</style> 