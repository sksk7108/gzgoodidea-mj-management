<script setup>
import {ref, computed, onMounted} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import * as Icons from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

// 获取当前激活的菜单
const activeMenu = computed(() => {
  return route.path
})

// 过滤路由，只显示有权限的菜单
const filterRoutes = computed(() => {
  const routes = router.options.routes
  return routes.filter(route => {
    if (route.hidden) return false
    if (route.meta && route.meta.module && !appStore.isModuleAvailable(route.meta.module)) return false
    
    if (route.children) {
      route.children = route.children.filter(child => {
        if (child.hidden) return false
        if (child.meta && child.meta.module && !appStore.isModuleAvailable(child.meta.module)) return false
        return true
      })
      return route.children.length > 0
    }
    
    return true
  })
})

// 处理登出
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await userStore.logoutAction()
    router.push('/login')
  }).catch(() => {})
}

// 动态获取图标组件
const getIcon = (iconName) => {
  return Icons[iconName]
}

</script>

<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <div class="sidebar-container" :class="{ 'is-collapse': appStore.isCollapse }">
      <!-- Logo -->
      <div class="logo-container">
        <img :src="appStore.config.logo" alt="logo" class="logo">
        <h1 v-if="!appStore.isCollapse" class="title">{{ appStore.config.title }}</h1>
      </div>
      
      <!-- 菜单 -->
      <el-menu
        :default-active="activeMenu"
        :collapse="appStore.isCollapse"
        :background-color="appStore.config.theme.menuBgColor || '#304156'"
        :text-color="appStore.config.theme.menuTextColor"
        :active-text-color="appStore.config.theme.menuActiveTextColor"
        router
        unique-opened
      >
        <template v-for="(route, index) in filterRoutes" :key="index">
          <!-- 无子菜单 -->
          <el-menu-item v-if="!route.children || route.children.length === 0" :index="route.path">
            <el-icon v-if="route.meta && route.meta.icon">
              <component :is="getIcon(route.meta.icon)" />
            </el-icon>
            <template #title>{{ route.meta ? route.meta.title : route.name }}</template>
          </el-menu-item>
          
          <!-- 只有一个子菜单 -->
          <el-menu-item 
            v-else-if="route.children.length === 1" 
            :index="route.path + '/' + route.children[0].path"
          >
            <el-icon v-if="route.children[0].meta && route.children[0].meta.icon">
              <component :is="getIcon(route.children[0].meta.icon)" />
            </el-icon>
            <template #title>{{ route.children[0].meta ? route.children[0].meta.title : route.children[0].name }}</template>
          </el-menu-item>
          
          <!-- 多个子菜单 -->
          <el-sub-menu v-else :index="route.path">
            <template #title>
              <el-icon v-if="route.meta && route.meta.icon">
                <component :is="getIcon(route.meta.icon)" />
              </el-icon>
              <span>{{ route.meta ? route.meta.title : route.name }}</span>
            </template>
            
            <el-menu-item 
              v-for="(child, childIndex) in route.children" 
              :key="childIndex" 
              :index="route.path + '/' + child.path"
            >
              <el-icon v-if="child.meta && child.meta.icon">
                <component :is="getIcon(child.meta.icon)" />
              </el-icon>
              <template #title>{{ child.meta ? child.meta.title : child.name }}</template>
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>
    </div>
    
    <!-- 主容器 -->
    <div class="main-container">
      <!-- 头部 -->
      <div class="header">
        <div class="left">
          <el-icon class="toggle-button" @click="appStore.toggleSideBar">
            <component :is="appStore.isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.meta && route.meta.title">{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="right">
          <el-dropdown trigger="click">
            <div class="avatar-container">
              <el-avatar :size="30" :src="appStore.config.logo || '/management.svg'" />
              <span class="username">{{ userStore.userInfo.nickname || userStore.userInfo.username }}</span>
              <el-icon><CaretBottom /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
<!--                <el-dropdown-item @click="router.push('/user/profile')">个人中心</el-dropdown-item>-->
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <!-- 内容区 -->
      <div class="content-container">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.layout-container {
  display: flex;
  height: 100vh;
  width: 100%;
  
  .sidebar-container {
    width: 250px;
    height: 100%;
    background-color: var(--menu-bg-color);
    transition: width 0.3s;
    overflow: hidden;
    
    &.is-collapse {
      width: 64px;
    }
    
    .logo-container {
      height: 60px;
      display: flex;
      align-items: center;
      padding: 0 15px;
      overflow: hidden;
      
      .logo {
        width: 32px;
        height: 32px;
        object-fit: contain;
      }
      
      .title {
        margin-left: 10px;
        color: #fff;
        font-size: 18px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
      }
    }
    
    :deep(.el-menu) {
      border-right: none;
    }
  }
  
  .main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    
    .header {
      height: 60px;
      padding: 0 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #eee;
      background-color: #fff;
      
      .left {
        display: flex;
        align-items: center;
        
        .toggle-button {
          font-size: 20px;
          cursor: pointer;
          margin-right: 20px;
          
          &:hover {
            color: var(--el-color-primary);
          }
        }
      }
      
      .right {
        .avatar-container {
          display: flex;
          align-items: center;
          cursor: pointer;
          
          .username {
            margin: 0 5px;
            font-size: 14px;
          }
        }
      }
    }
    
    .content-container {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      background-color: #f5f7fa;
    }
  }
}

// 路由切换动画
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style> 