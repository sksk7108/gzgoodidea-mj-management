<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import * as echarts from 'echarts'
import { getUserInfoIndex, getUserInfo } from '@/api/dashboard'
import { User, View, Plus, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const appStore = useAppStore()

// 欢迎信息
const welcomeMessage = ref('')
const currentTime = ref('')
let timer = null

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
  todayActiveUserCount: 0,
  todayNewUserCount: 0,
  weekNewUserCount: 0
})

// 图表实例
const userChartRef = ref(null)
const activityChartRef = ref(null)
let userChart = null
let activityChart = null

// 图表数据
const chartData = reactive({
  dates: [],
  newUsers: [],
  activityRates: []
})

// 加载状态
const loading = reactive({
  statistics: false,
  charts: false
})

// 加载统计数据
const loadStatistics = async () => {
  loading.statistics = true
  try {
    const res = await getUserInfoIndex()
    if (res && res.data) {
      statistics.userCount = res.data.userCount || 0
      statistics.todayActiveUserCount = res.data.todayActiveUserCount || 0
      statistics.todayNewUserCount = res.data.todayNewUserCount || 0
      statistics.weekNewUserCount = res.data.weekNewUserCount || 0
    }
  } catch (error) {
    console.error('获取统计数据失败', error)
    ElMessage.error('获取统计数据失败')
  } finally {
    loading.statistics = false
  }
}

// 加载图表数据
const loadChartData = async () => {
  loading.charts = true
  try {
    // 获取最近30天的数据
    const endTime = new Date()
    const startTime = new Date()
    startTime.setDate(startTime.getDate() - 30)
    
    const params = {
      startTime: formatDate(startTime),
      endTime: formatDate(endTime),
      statDimension: 'daily'
    }
    
    const res = await getUserInfo(params)
    if (res && res.data && res.data.length > 0) {
      chartData.dates = res.data.map(item => item.statDateDesc.substring(5))
      chartData.newUsers = res.data.map(item => item.newUserCount)
      chartData.activityRates = res.data.map(item => (item.activityRate * 100).toFixed(2))
      
      initCharts()
    }
  } catch (error) {
    console.error('获取图表数据失败', error)
    ElMessage.error('获取图表数据失败')
  } finally {
    loading.charts = false
  }
}

// 日期格式化函数
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 初始化图表
const initCharts = () => {
  // 销毁旧的图表实例
  if (userChart) {
    userChart.dispose()
  }
  if (activityChart) {
    activityChart.dispose()
  }
  
  // 初始化新用户图表
  if (userChartRef.value) {
    userChart = echarts.init(userChartRef.value)
    userChart.setOption({
      title: {
        text: '新增用户趋势',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        name: '日期',
        data: chartData.dates,
        axisLabel: {
          interval: 1,
          rotate: 0
        }
      },
      yAxis: {
        type: 'value',
        name: '人数'
      },
      series: [
        {
          name: '新增用户',
          type: 'bar',
          data: chartData.newUsers,
          itemStyle: {
            color: '#409EFF'
          }
        }
      ]
    })
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      userChart && userChart.resize()
    })
  }
  
  // 初始化用户活跃度图表
  if (activityChartRef.value) {
    activityChart = echarts.init(activityChartRef.value)
    activityChart.setOption({
      title: {
        text: '用户活跃度趋势',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: chartData.dates,
        name: '日期',
        axisLabel: {
          interval: 1,
          rotate: 0
        }
      },
      yAxis: {
        type: 'value',
        name: '活跃度(%)',
        max: 100
      },
      series: [
        {
          name: '活跃度',
          type: 'line',
          data: chartData.activityRates,
          smooth: true,
          itemStyle: {
            color: '#67C23A'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(103, 194, 58, 0.5)'
                },
                {
                  offset: 1,
                  color: 'rgba(103, 194, 58, 0.1)'
                }
              ]
            }
          }
        }
      ]
    })
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      activityChart && activityChart.resize()
    })
  }
}

// 组件卸载时清理资源
onUnmounted(() => {
  window.removeEventListener('resize', () => {
    userChart && userChart.resize()
    activityChart && activityChart.resize()
  })
  userChart && userChart.dispose()
  activityChart && activityChart.dispose()
  
  // 清除定时器
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})

onMounted(() => {
  updateTime()
  // 每分钟更新一次时间
  timer = setInterval(updateTime, 60000)
  loadStatistics()
  loadChartData()
})

// 刷新数据
const refreshData = () => {
  loading.statistics = true
  loading.charts = true
  loadStatistics()
  loadChartData()
  ElMessage.success('数据已刷新')
}
</script>

<template>
  <div class="dashboard-container">
    
    <!-- 统计卡片 -->
    <div class="statistics-cards">
      <el-card class="stat-card" v-loading="loading.statistics">
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
      
      <el-card class="stat-card" v-loading="loading.statistics">
        <template #header>
          <div class="card-header">
            <span>今日活跃用户</span>
          </div>
        </template>
        <div class="card-value">{{ statistics.todayActiveUserCount }}</div>
        <div class="card-icon">
          <el-icon><View /></el-icon>
        </div>
      </el-card>
      
      <el-card class="stat-card" v-loading="loading.statistics">
        <template #header>
          <div class="card-header">
            <span>今日新增用户</span>
          </div>
        </template>
        <div class="card-value">{{ statistics.todayNewUserCount }}</div>
        <div class="card-icon">
          <el-icon><Plus /></el-icon>
        </div>
      </el-card>
      
      <el-card class="stat-card" v-loading="loading.statistics">
        <template #header>
          <div class="card-header">
            <span>本周新增用户</span>
          </div>
        </template>
        <div class="card-value">{{ statistics.weekNewUserCount }}</div>
        <div class="card-icon">
          <el-icon><Plus /></el-icon>
        </div>
      </el-card>
    </div>
    
    <!-- 图表区域 -->
    <div class="chart-container">
      <el-card class="chart-card" v-loading="loading.charts">
        <div ref="userChartRef" class="chart"></div>
      </el-card>
      
      <el-card class="chart-card" v-loading="loading.charts">
        <div ref="activityChartRef" class="chart"></div>
      </el-card>
    </div>
    
  </div>
</template>

<style lang="scss" scoped>
.dashboard-container {
  .welcome-card {
    margin-bottom: 20px;
    
    .welcome-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
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
  
  .chart-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 20px;
    
    .chart-card {
      .chart {
        height: 400px;
        width: 100%;
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
    
    .chart-container {
      grid-template-columns: 1fr;
    }
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    .statistics-cards {
      grid-template-columns: 1fr;
    }
    
    .chart-container {
      grid-template-columns: 1fr;
    }
  }
}
</style> 