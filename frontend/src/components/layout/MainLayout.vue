<template>
  <el-container class="main-layout">
    <!-- 左侧导航 -->
    <el-aside :width="isCollapsed ? '64px' : '220px'" class="sidebar">
      <div class="logo">
        <div class="logo-icon-wrap">
          <img src="@/assets/logo.svg" alt="Logo" class="logo-icon" />
        </div>
        <transition name="fade">
          <span v-if="!isCollapsed" class="logo-text">矿穹智警</span>
        </transition>
      </div>
      <el-menu
        :default-active="currentRoute"
        :collapse="isCollapsed"
        router
        class="sidebar-menu"
        background-color="transparent"
        text-color="#8b9dc3"
        active-text-color="#3b82f6"
      >
        <template v-for="group in menuGroups" :key="group.label">
          <div v-if="!isCollapsed" class="nav-section-title">{{ group.label }}</div>
          <div v-else class="nav-section-dot"></div>
          <el-menu-item
            v-for="item in group.items"
            :key="item.path"
            :index="item.path"
            class="nav-item"
          >
            <el-icon :size="18" :color="getIconColor(item.path)">
              <component :is="item.icon" />
            </el-icon>
            <template #title>
              <span class="nav-title">{{ item.title }}</span>
              <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
            </template>
          </el-menu-item>
        </template>
      </el-menu>
      <div class="sidebar-footer" v-if="!isCollapsed">
        <div class="footer-text">v1.0.0</div>
      </div>
    </el-aside>

    <!-- 右侧主区域 -->
    <el-container class="main-content">
      <!-- 顶部栏 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="toggleCollapse">
            <Fold v-if="!isCollapsed" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-tooltip content="系统通知" placement="bottom">
            <el-badge :value="warningCount" :hidden="warningCount === 0" class="warning-badge">
              <el-icon :size="20"><Bell /></el-icon>
            </el-badge>
          </el-tooltip>
          <el-tooltip content="全屏" placement="bottom">
            <el-icon :size="18" class="header-action" @click="toggleFullscreen">
              <FullScreen />
            </el-icon>
          </el-tooltip>
          <el-dropdown @command="handleUserCommand">
            <span class="user-info">
              <el-avatar :size="32" icon="UserFilled" class="user-avatar" />
              <span class="username">{{ authStore.userName }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item disabled>
                  {{ authStore.userInfo?.role ? roleLabels[authStore.userInfo.role] : '用户' }}
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="content-area">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Fold, Expand, Bell, FullScreen,
  Odometer, Monitor, Platform, WarningFilled, DataAnalysis, Cpu, Setting, Connection,
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isCollapsed = ref(false)
const warningCount = ref(3)

const roleLabels: Record<string, string> = {
  admin: '系统管理员',
  enterprise: '企业用户',
  think_tank: '智库专家',
  regulatory: '监管人员',
  operator: '操作员',
}

const menuGroups = [
  {
    label: '监控中心',
    items: [
      { path: '/app', title: '态势总览', icon: Odometer, color: '#3b82f6' },
      { path: '/app/digital-twin', title: '数字孪生', icon: Platform, color: '#06b6d4' },
      { path: '/app/monitor', title: '实时监测', icon: Monitor, color: '#10b981' },
    ],
  },
  {
    label: '预警分析',
    items: [
      { path: '/app/warning', title: '预警中心', icon: WarningFilled, color: '#f59e0b', badge: 3 },
      { path: '/app/analytics', title: '数据分析', icon: DataAnalysis, color: '#8b5cf6' },
    ],
  },
  {
    label: '设备管理',
    items: [
      { path: '/app/sensors', title: '传感器管理', icon: Cpu, color: '#ec4899' },
      { path: '/app/device-access', title: '设备接入', icon: Connection, color: '#14b8a6' },
    ],
  },
  {
    label: '系统',
    items: [
      { path: '/app/settings', title: '系统设置', icon: Setting, color: '#6b7280' },
    ],
  },
]

// 扁平化所有菜单项
const allMenuItems = menuGroups.flatMap(g => g.items)

function getIconColor(path: string): string {
  const item = allMenuItems.find(m => m.path === path)
  return item?.color || '#8b9dc3'
}

const currentRoute = computed(() => route.path)
const currentTitle = computed(() => {
  const item = allMenuItems.find((m) => m.path === route.path)
  return item?.title || '态势总览'
})

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

function handleUserCommand(command: string) {
  if (command === 'logout') {
    authStore.logout()
    router.push('/')
  }
}

onMounted(() => {
  authStore.initAuth()
})
</script>

<style scoped>
.main-layout {
  height: 100vh;
  background: var(--bg-primary);
}

.sidebar {
  background: linear-gradient(180deg, #111d35 0%, #0a1628 100%);
  border-right: 1px solid var(--border-color);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

.sidebar::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(180deg, rgba(59,130,246,0.3) 0%, rgba(6,182,212,0.1) 50%, transparent 100%);
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  border-bottom: 1px solid var(--border-color);
  background: linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(6,182,212,0.05) 100%);
}

.logo-icon-wrap {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(6, 182, 212, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(6, 182, 212, 0.2);
  flex-shrink: 0;
}

.logo-icon {
  width: 20px;
  height: 20px;
}

.logo-text {
  font-size: 15px;
  font-weight: 700;
  background: linear-gradient(135deg, #06b6d4, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
  margin-left: 10px;
  letter-spacing: 1px;
}

.sidebar-menu {
  border-right: none;
  padding: 8px 0;
  flex: 1;
  overflow-y: auto;
}

.sidebar-menu::-webkit-scrollbar {
  width: 0;
}

/* 分组标题 */
.nav-section-title {
  padding: 16px 20px 6px;
  font-size: 11px;
  font-weight: 600;
  color: #4a5a7a;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  user-select: none;
}

.nav-section-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #3a4a6a;
  margin: 12px auto 4px;
}

/* 菜单项样式 */
.nav-item {
  margin: 2px 8px;
  border-radius: 8px;
  transition: all 0.25s ease;
  height: 44px;
  line-height: 44px;
}

.nav-item:hover {
  background: rgba(59, 130, 246, 0.08) !important;
}

.nav-item.is-active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%) !important;
  border-right: none;
  position: relative;
}

.nav-item.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: linear-gradient(180deg, #3b82f6, #06b6d4);
  border-radius: 0 3px 3px 0;
}

.nav-title {
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.nav-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: #ef4444;
  border-radius: 10px;
  margin-left: auto;
}

/* 侧边栏底部 */
.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.footer-text {
  font-size: 11px;
  color: var(--text-secondary);
  opacity: 0.5;
}

/* 顶部栏 */
.header {
  height: 60px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  cursor: pointer;
  font-size: 20px;
  color: var(--text-secondary);
  transition: color 0.2s, transform 0.2s;
}

.collapse-btn:hover {
  color: var(--accent-blue);
  transform: scale(1.1);
}

.breadcrumb {
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.warning-badge {
  cursor: pointer;
  transition: transform 0.2s;
}

.warning-badge:hover {
  transform: scale(1.1);
}

.header-action {
  cursor: pointer;
  color: var(--text-secondary);
  transition: color 0.2s, transform 0.2s;
}

.header-action:hover {
  color: var(--accent-cyan);
  transform: scale(1.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.user-info:hover {
  background: rgba(59, 130, 246, 0.08);
}

.user-avatar {
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
}

.username {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
}

.content-area {
  background: var(--bg-primary);
  padding: 16px;
  overflow-y: auto;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
