<template>
  <div class="landing-page">
    <!-- 背景图片层 -->
    <div class="bg-layer">
      <img src="/images/mining-tunnel.jpg" alt="矿井隧道" class="bg-image" />
      <div class="bg-overlay"></div>
      <div class="bg-vignette"></div>
    </div>

    <!-- Canvas 动画层 -->
    <canvas ref="canvasRef" class="animation-canvas"></canvas>

    <!-- 内容层 -->
    <div class="content-layer">
      <!-- 顶部导航条 -->
      <nav class="top-nav">
        <div class="nav-brand" @click="scrollToTop">
          <div class="logo-wrapper">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="nav-logo">
              <rect x="4" y="20" width="32" height="16" rx="2" stroke="#06b6d4" stroke-width="2"/>
              <path d="M8 20V12C8 8 12 4 20 4C28 4 32 8 32 12V20" stroke="#3b82f6" stroke-width="2"/>
              <circle cx="20" cy="28" r="3" fill="#06b6d4"/>
              <line x1="20" y1="31" x2="20" y2="35" stroke="#06b6d4" stroke-width="2"/>
            </svg>
            <div class="logo-glow"></div>
          </div>
          <div class="brand-text">
            <span class="nav-title">矿穹智警</span>
            <span class="nav-subtitle">喀斯特矿区顶板灾变数字孪生预警与协同平台</span>
          </div>
        </div>

        <div class="nav-links">
          <a class="nav-link active" href="javascript:;" @click="scrollToTop">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </a>
          <a class="nav-link" href="javascript:;" @click="scrollToSection(featuresRef)">
            <el-icon><Monitor /></el-icon>
            <span>功能</span>
          </a>
          <a class="nav-link" href="javascript:;" @click="scrollToSection(techRef)">
            <el-icon><Cpu /></el-icon>
            <span>技术</span>
          </a>
          <a class="nav-link" href="javascript:;" @click="scrollToSection(safetyRef)">
            <el-icon><Lock /></el-icon>
            <span>安全</span>
          </a>
        </div>

        <el-button class="nav-login-btn" @click="handleEnter">
          <el-icon><User /></el-icon>
          <span>{{ authStore.isLoggedIn ? '进入系统' : '登录' }}</span>
        </el-button>

        <!-- 导航底部光晕线 -->
        <div class="nav-glow-line"></div>
      </nav>

      <!-- 主英雄区 -->
      <div class="hero-section">
        <div class="hero-badge">数字孪生 · 智能预警</div>
        <h1 class="hero-title">
          <span class="title-line">矿穹智警</span>
          <span class="title-line title-accent">喀斯特矿区顶板灾变数字孪生预警与协同平台</span>
        </h1>
        <p class="hero-subtitle">
          基于多场耦合感知与数字孪生技术，实现煤矿顶板应力、位移、裂隙、渗流、环境、空间六维实时监测与智能预警
        </p>
        <div class="hero-actions">
          <el-button type="primary" size="large" class="enter-btn" @click="handleEnter">
            进入系统
            <el-icon class="el-icon--right"><ArrowRight /></el-icon>
          </el-button>
        </div>

        <!-- 特性标签 -->
        <div class="feature-tags">
          <span class="tag" v-for="tag in featureTags" :key="tag">{{ tag }}</span>
        </div>
      </div>

      <!-- 底部信息栏 -->
      <div class="bottom-bar">
        <div class="bottom-item">
          <span class="bottom-label">传感器在线</span>
          <span class="bottom-value online">{{ animatedSensorCount }}</span>
        </div>
        <div class="bottom-divider"></div>
        <div class="bottom-item">
          <span class="bottom-label">系统运行</span>
          <span class="bottom-value normal">正常</span>
        </div>
        <div class="bottom-divider"></div>
        <div class="bottom-item">
          <span class="bottom-label">数据更新</span>
          <span class="bottom-value">{{ currentTime }}</span>
        </div>
      </div>

      <!-- 功能介绍区 -->
      <div class="info-section" ref="featuresRef">
        <div class="section-header">
          <span class="section-tag">CORE FEATURES</span>
          <h2 class="section-title">核心功能</h2>
          <p class="section-desc">六维感知 · 智能预警 · 数字孪生 · 可视化决策</p>
        </div>
        <div class="feature-grid">
          <div class="feature-card" v-for="f in featureCards" :key="f.title">
            <div class="feature-icon" :style="{ background: f.bg }">
              <el-icon :size="28"><component :is="f.icon" /></el-icon>
            </div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </div>

      <!-- 技术架构区 -->
      <div class="info-section" ref="techRef">
        <div class="section-header">
          <span class="section-tag">TECHNOLOGY</span>
          <h2 class="section-title">技术架构</h2>
          <p class="section-desc">多场耦合感知 + 数字孪生 + AI 智能分析</p>
        </div>
        <div class="tech-grid">
          <div class="tech-item" v-for="t in techItems" :key="t.title">
            <div class="tech-num">{{ t.num }}</div>
            <div class="tech-info">
              <h4>{{ t.title }}</h4>
              <p>{{ t.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 安全体系区 -->
      <div class="info-section" ref="safetyRef">
        <div class="section-header">
          <span class="section-tag">SAFETY SYSTEM</span>
          <h2 class="section-title">安全体系</h2>
          <p class="section-desc">四级预警 · 多级联动 · 闭环管控</p>
        </div>
        <div class="safety-grid">
          <div class="safety-card" v-for="s in safetyItems" :key="s.level">
            <div class="safety-level" :style="{ color: s.color, borderColor: s.color }">{{ s.level }}</div>
            <h4>{{ s.title }}</h4>
            <p>{{ s.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, HomeFilled, Monitor, Cpu, Lock, User, DataAnalysis, Platform, WarningFilled, Connection, Setting } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useRoofScanAnimation } from '@/composables/useRoofScanAnimation'

const router = useRouter()
const authStore = useAuthStore()
const canvasRef = ref<HTMLCanvasElement>()
const featuresRef = ref<HTMLElement | null>(null)
const techRef = ref<HTMLElement | null>(null)
const safetyRef = ref<HTMLElement | null>(null)

// 特性标签
const featureTags = [
  '应力场监测', '位移场感知', '裂隙场分析', '渗流场预警', '环境场监控', '空间场建模'
]

// 功能卡片数据
const featureCards = [
  { title: '六维实时监测', desc: '应力、位移、裂隙、渗流、环境、空间六维传感器数据实时采集与可视化', icon: DataAnalysis, bg: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.15))' },
  { title: '数字孪生建模', desc: '基于Three.js构建井下三维地质体模型，真实还原巷道结构与传感器空间分布', icon: Platform, bg: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.15))' },
  { title: '智能预警引擎', desc: '多级阈值联动分析，四级预警机制，支持趋势预测与异常模式识别', icon: WarningFilled, bg: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(239,68,68,0.15))' },
  { title: '设备接入管理', desc: '多协议设备接入(MQTT/OPC-UA/Modbus)，产品-设备分层管理，在线状态实时监控', icon: Connection, bg: 'linear-gradient(135deg, rgba(20,184,166,0.2), rgba(16,185,129,0.15))' },
  { title: '数据分析中心', desc: '历史数据趋势分析、多传感器对比、统计报表自动生成', icon: Monitor, bg: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(139,92,246,0.15))' },
  { title: '系统配置管理', desc: '灵活的系统参数配置、用户权限管理、日志审计与系统维护', icon: Setting, bg: 'linear-gradient(135deg, rgba(107,114,128,0.2), rgba(75,85,99,0.15))' },
]

// 技术架构数据
const techItems = [
  { num: '01', title: '感知层', desc: '矿用本安型传感器阵列，支持应力(0-60MPa)、位移(0-50mm)、微振动、渗流量、温湿度、气体浓度六维采集' },
  { num: '02', title: '传输层', desc: '井下工业环网+5G融合传输，MQTT/OPC-UA协议适配，边缘网关数据预处理与本地缓存' },
  { num: '03', title: '平台层', desc: 'Spring Boot微服务架构，时序数据库(TDengine)存储，Redis缓存，Kafka消息队列' },
  { num: '04', title: '应用层', desc: 'Vue3 + Three.js数字孪生前端，多场耦合仿真引擎，LSTM/Transformer趋势预测模型' },
]

// 安全体系数据
const safetyItems = [
  { level: 'I级', title: '蓝色 · 提示', desc: '传感器数据轻微波动，在安全阈值内，系统自动记录并持续监测', color: '#3b82f6' },
  { level: 'II级', title: '黄色 · 关注', desc: '数据接近预警阈值，系统发送关注通知，值班人员加强巡查', color: '#f59e0b' },
  { level: 'III级', title: '橙色 · 警告', desc: '数据超过预警阈值，触发报警通知，启动应急预案，相关人员到位', color: '#f97316' },
  { level: 'IV级', title: '红色 · 危险', desc: '数据严重超标，紧急撤人通知，全矿区联动响应，启动灾变处置流程', color: '#ef4444' },
]

// 动态数据
const animatedSensorCount = ref(143)
const currentTime = ref('')

// 数据动态更新
let dataTimer: number | null = null
let timeTimer: number | null = null
let stopAnimation: (() => void) | null = null

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false })
}

function updateData() {
  animatedSensorCount.value = 140 + Math.floor(Math.random() * 6)
}

function scrollToTop() {
  const el = document.querySelector('.landing-page')
  if (el) el.scrollTo({ top: 0, behavior: 'smooth' })
}

function scrollToSection(target: HTMLElement | null) {
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function handleEnter() {
  if (authStore.isLoggedIn) {
    router.push('/app')
  } else {
    router.push('/login')
  }
}

onMounted(() => {
  updateTime()
  timeTimer = window.setInterval(updateTime, 1000)
  dataTimer = window.setInterval(updateData, 3000)

  // 启动 Canvas 动画
  if (canvasRef.value) {
    const { start, stop } = useRoofScanAnimation(canvasRef.value)
    start()
    stopAnimation = stop
  }
})

onUnmounted(() => {
  if (stopAnimation) stopAnimation()
  if (dataTimer) clearInterval(dataTimer)
  if (timeTimer) clearInterval(timeTimer)
})
</script>

<style scoped>
.landing-page {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  background: #0a1628;
  scroll-behavior: smooth;
}

/* 背景层 */
.bg-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(10, 22, 40, 0.5) 0%,
    rgba(10, 22, 40, 0.6) 40%,
    rgba(10, 22, 40, 0.85) 100%
  );
}

.bg-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 40%,
    rgba(10, 22, 40, 0.6) 100%
  );
}

/* Canvas 动画层 */
.animation-canvas {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

/* 内容层 */
.content-layer {
  position: relative;
  z-index: 2;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 顶部导航 */
.top-nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  background: linear-gradient(180deg, rgba(10, 22, 40, 0.92) 0%, rgba(10, 22, 40, 0.6) 70%, transparent 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(59, 130, 246, 0.08);
  z-index: 10;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.nav-brand:hover {
  opacity: 0.85;
}

.logo-wrapper {
  position: relative;
  width: 36px;
  height: 36px;
}

.nav-logo {
  width: 36px;
  height: 36px;
  filter: drop-shadow(0 0 6px rgba(6, 182, 212, 0.4));
}

.logo-glow {
  position: absolute;
  inset: -4px;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, transparent 70%);
  border-radius: 50%;
  animation: logoPulse 3s ease-in-out infinite;
}

@keyframes logoPulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.15); }
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-title {
  font-size: 16px;
  font-weight: 700;
  color: #e8edf5;
  letter-spacing: 1.5px;
  line-height: 1.2;
}

.nav-subtitle {
  font-size: 10px;
  color: #6b87b8;
  letter-spacing: 1px;
  font-weight: 400;
}

/* 导航链接 */
.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  font-size: 13px;
  color: #8b9dc3;
  text-decoration: none;
  border-radius: 7px;
  transition: all 0.25s ease;
  position: relative;
}

.nav-link:hover {
  color: #c8d6f0;
  background: rgba(59, 130, 246, 0.08);
}

.nav-link.active {
  color: #93c5fd;
  background: rgba(59, 130, 246, 0.12);
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.08);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6, #06b6d4);
  border-radius: 1px;
}

.nav-link .el-icon {
  font-size: 14px;
}

/* 登录按钮 */
.nav-login-btn {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(6, 182, 212, 0.1));
  border: 1px solid rgba(59, 130, 246, 0.25);
  color: #93c5fd;
  border-radius: 9px;
  padding: 8px 22px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.06);
}

.nav-login-btn:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(6, 182, 212, 0.18));
  border-color: rgba(59, 130, 246, 0.45);
  color: #bfdbfe;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15);
  transform: translateY(-1px);
}

/* 导航底部光晕线 */
.nav-glow-line {
  position: absolute;
  bottom: -1px;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), rgba(6, 182, 212, 0.4), rgba(59, 130, 246, 0.3), transparent);
  pointer-events: none;
}

/* 英雄区 */
.hero-section {
  text-align: center;
  max-width: 800px;
  padding: 0 24px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.hero-badge {
  display: inline-block;
  padding: 6px 20px;
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.25);
  border-radius: 20px;
  color: #06b6d4;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 2px;
  margin-bottom: 24px;
  animation: badgePulse 3s ease-in-out infinite;
}

@keyframes badgePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.2); }
  50% { box-shadow: 0 0 20px 4px rgba(6, 182, 212, 0.15); }
}

.hero-title {
  margin: 0 0 20px;
}

.title-line {
  display: block;
  font-size: 48px;
  font-weight: 800;
  color: #ffffff;
  line-height: 1.3;
  letter-spacing: 2px;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
}

.title-accent {
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: titleGlow 4s ease-in-out infinite;
}

@keyframes titleGlow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.2); }
}

.hero-subtitle {
  font-size: 16px;
  color: #94a3b8;
  line-height: 1.8;
  margin: 0 0 36px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  margin-bottom: 40px;
}

.enter-btn {
  height: 52px;
  padding: 0 40px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #06b6d4);
  letter-spacing: 2px;
  transition: all 0.3s;
}

.enter-btn:hover {
  background: linear-gradient(135deg, #2563eb, #0891b2);
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
}

/* 特性标签 */
.feature-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.tag {
  padding: 5px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #8b9dc3;
  font-size: 12px;
  transition: all 0.3s;
}

.tag:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  color: #93c5fd;
}

/* 底部信息栏 */
.bottom-bar {
  position: fixed;
  bottom: 24px;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 10px 28px;
  background: rgba(16, 30, 54, 0.7);
  border: 1px solid rgba(59, 130, 246, 0.1);
  border-radius: 10px;
  backdrop-filter: blur(10px);
  z-index: 10;
}

.bottom-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bottom-label {
  font-size: 12px;
  color: #6b7fa3;
}

.bottom-value {
  font-size: 13px;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.bottom-value.online { color: #22c55e; }
.bottom-value.normal { color: #06b6d4; }

.bottom-divider {
  width: 1px;
  height: 16px;
  background: rgba(139, 157, 195, 0.2);
}

/* 信息区块通用 */
.info-section {
  width: 100%;
  max-width: 1100px;
  padding: 80px 32px 60px;
}

.section-header {
  text-align: center;
  margin-bottom: 48px;
}

.section-tag {
  display: inline-block;
  padding: 4px 14px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 3px;
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.08);
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: 4px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  color: #e8edf5;
  margin: 0 0 12px;
  letter-spacing: 2px;
}

.section-desc {
  font-size: 14px;
  color: #6b87b8;
  margin: 0;
  letter-spacing: 1px;
}

/* 功能卡片网格 */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.feature-card {
  padding: 28px 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.feature-card:hover {
  background: rgba(59, 130, 246, 0.06);
  border-color: rgba(59, 130, 246, 0.2);
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.1);
}

.feature-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: #93c5fd;
}

.feature-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #e0e7f1;
  margin: 0 0 8px;
}

.feature-card p {
  font-size: 13px;
  color: #7b8fb8;
  line-height: 1.7;
  margin: 0;
}

/* 技术架构网格 */
.tech-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 720px;
  margin: 0 auto;
}

.tech-item {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.tech-item:hover {
  background: rgba(59, 130, 246, 0.05);
  border-color: rgba(59, 130, 246, 0.15);
}

.tech-num {
  font-size: 28px;
  font-weight: 800;
  color: rgba(59, 130, 246, 0.25);
  font-family: 'Courier New', monospace;
  line-height: 1;
  min-width: 48px;
}

.tech-info h4 {
  font-size: 15px;
  font-weight: 600;
  color: #c8d6f0;
  margin: 0 0 6px;
}

.tech-info p {
  font-size: 13px;
  color: #7b8fb8;
  line-height: 1.7;
  margin: 0;
}

/* 安全体系网格 */
.safety-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.safety-card {
  padding: 24px 20px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  text-align: center;
  transition: all 0.3s ease;
}

.safety-card:hover {
  background: rgba(255, 255, 255, 0.04);
  transform: translateY(-2px);
}

.safety-level {
  display: inline-block;
  padding: 4px 12px;
  border: 1px solid;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 12px;
}

.safety-card h4 {
  font-size: 14px;
  font-weight: 600;
  color: #c8d6f0;
  margin: 0 0 8px;
}

.safety-card p {
  font-size: 12px;
  color: #7b8fb8;
  line-height: 1.7;
  margin: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .title-line { font-size: 32px; }
  .hero-subtitle { font-size: 14px; }
  .bottom-bar { display: none; }
  .feature-grid { grid-template-columns: 1fr; }
  .safety-grid { grid-template-columns: repeat(2, 1fr); }
  .info-section { padding: 60px 20px 40px; }
}
</style>
