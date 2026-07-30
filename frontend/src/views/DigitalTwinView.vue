<template>
  <div class="digital-twin-view">
    <!-- 顶部标题栏 -->
    <header class="twin-header">
      <div class="header-left">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#06b6d4" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1 class="header-title">矿穹智警</h1>
        <span class="header-subtitle">喀斯特矿区顶板灾变数字孪生预警与协同平台</span>
      </div>
      <div class="header-center">
        <button
          v-for="v in views"
          :key="v.key"
          class="view-btn"
          :class="{ active: sceneAPI.currentView.value === v.key }"
          @click="sceneAPI.setView(v.key)"
        >
          <span class="view-btn-icon" v-html="v.icon"></span>
          {{ v.label }}
        </button>
      </div>
      <div class="header-right">
        <div class="header-stat">
          <span class="stat-dot normal"></span>
          <span>正常 <b>{{ sensorStats.normal }}</b></span>
        </div>
        <div class="header-stat">
          <span class="stat-dot warning"></span>
          <span>预警 <b>{{ sensorStats.warning }}</b></span>
        </div>
        <div class="header-stat">
          <span class="stat-dot alarm"></span>
          <span>报警 <b>{{ sensorStats.alarm }}</b></span>
        </div>
        <div class="header-time">{{ currentTime }}</div>
      </div>
    </header>

    <!-- 主体区域 -->
    <div class="twin-main">
      <!-- 3D 场景 -->
      <div ref="threeContainer" class="three-container"></div>

      <!-- 左侧工具栏 -->
      <div class="left-toolbar">
        <button
          class="tool-btn"
          :class="{ active: sceneAPI.isWireframe.value }"
          @click="sceneAPI.toggleWireframe()"
          title="线框模式"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="12" y1="3" x2="12" y2="21" />
          </svg>
        </button>
        <button
          class="tool-btn"
          :class="{ active: sceneAPI.showLabels.value }"
          @click="sceneAPI.toggleLabels()"
          title="标注开关"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
        </button>
        <button
          class="tool-btn"
          @click="sceneAPI.resetView()"
          title="重置视角"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
          </svg>
        </button>
      </div>

      <!-- 右侧信息面板 -->
      <aside class="right-panel">
        <!-- 传感器详情 -->
        <div v-if="sceneAPI.selectedSensor.value" class="panel-card sensor-panel">
          <div class="panel-header">
            <span class="panel-indicator sensor-indicator"></span>
            <span>传感器详情</span>
            <button class="panel-close" @click="sceneAPI.selectedSensor.value = null">&times;</button>
          </div>
          <div class="panel-body">
            <div class="info-row">
              <span class="info-label">名称</span>
              <span class="info-value">{{ sceneAPI.selectedSensor.value.name }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">类型</span>
              <span class="info-value">
                <span class="type-badge" :style="{ borderColor: typeColor(sceneAPI.selectedSensor.value.type), color: typeColor(sceneAPI.selectedSensor.value.type) }">
                  {{ sensorTypeLabel(sceneAPI.selectedSensor.value.type) }}
                </span>
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">数值</span>
              <span class="info-value big-value">
                {{ sceneAPI.selectedSensor.value.value }}
                <span class="unit">{{ sceneAPI.selectedSensor.value.unit }}</span>
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">状态</span>
              <span class="status-badge" :class="sceneAPI.selectedSensor.value.status">
                {{ sensorStatusLabel(sceneAPI.selectedSensor.value.status) }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">坐标</span>
              <span class="info-value mono">
                ({{ sceneAPI.selectedSensor.value.position.map(p => p.toFixed(1)).join(', ') }})
              </span>
            </div>
          </div>
        </div>

        <!-- 设施详情 -->
        <div v-if="sceneAPI.selectedFacility.value" class="panel-card facility-panel">
          <div class="panel-header">
            <span class="panel-indicator facility-indicator"></span>
            <span>设施信息</span>
            <button class="panel-close" @click="sceneAPI.selectedFacility.value = null">&times;</button>
          </div>
          <div class="panel-body">
            <div class="info-row">
              <span class="info-label">名称</span>
              <span class="info-value">{{ sceneAPI.selectedFacility.value.name }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">类型</span>
              <span class="info-value">{{ facilityTypeLabel(sceneAPI.selectedFacility.value.type) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">编号</span>
              <span class="info-value mono">{{ sceneAPI.selectedFacility.value.id }}</span>
            </div>
            <div class="facility-status-row">
              <span class="status-dot online"></span>
              <span>在线运行</span>
            </div>
          </div>
        </div>

        <!-- 传感器列表 -->
        <div class="panel-card sensor-list-panel">
          <div class="panel-header">
            <span class="panel-indicator list-indicator"></span>
            <span>监测传感器</span>
            <span class="panel-count">{{ sensorStats.total }}</span>
          </div>
          <div class="panel-body sensor-list">
            <div
              v-for="s in sensorSummary"
              :key="s.id"
              class="sensor-item"
            >
              <span class="sensor-dot" :class="s.status"></span>
              <span class="sensor-name">{{ s.name }}</span>
              <span class="sensor-val" :class="s.status">{{ s.value }}{{ s.unit }}</span>
            </div>
          </div>
        </div>

        <!-- 图例 -->
        <div class="panel-card legend-panel">
          <div class="panel-header">
            <span class="panel-indicator legend-indicator"></span>
            <span>图例</span>
          </div>
          <div class="panel-body">
            <div class="legend-row">
              <span class="legend-dot" style="background:#10b981"></span>正常
              <span class="legend-dot" style="background:#f59e0b;margin-left:10px"></span>预警
              <span class="legend-dot" style="background:#ef4444;margin-left:10px"></span>报警
            </div>
            <div class="legend-row">
              <span class="legend-dot" style="background:#3b82f6"></span>压力
              <span class="legend-dot" style="background:#06b6d4;margin-left:10px"></span>离层
              <span class="legend-dot" style="background:#f59e0b;margin-left:10px"></span>应力
              <span class="legend-dot" style="background:#ef4444;margin-left:10px"></span>温度
            </div>
          </div>
        </div>
      </aside>

      <!-- 底部状态栏 -->
      <footer class="twin-footer">
        <div class="footer-item">
          <span class="footer-label">工作面</span>
          <span class="footer-value">1201喀斯特矿区</span>
        </div>
        <div class="footer-item">
          <span class="footer-label">监测点</span>
          <span class="footer-value">{{ sensorStats.total }} 个</span>
        </div>
        <div class="footer-item">
          <span class="footer-label">数据更新</span>
          <span class="footer-value pulse-text">实时</span>
        </div>
        <div class="footer-item">
          <span class="footer-label">系统状态</span>
          <span class="footer-value online-text">正常运行</span>
        </div>
        <div class="footer-item">
          <span class="footer-label">地形</span>
          <span class="footer-value">贵州荔波喀斯特</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMineScene } from '@/composables/useMineScene'

const threeContainer = ref<HTMLElement | null>(null)
const sceneAPI = useMineScene(threeContainer)

// 视图切换
const views = [
  { key: 'overview' as const, label: '全景', icon: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="10" r="7"/><line x1="10" y1="3" x2="10" y2="17"/><line x1="3" y1="10" x2="17" y2="10"/></svg>' },
  { key: 'tunnel' as const, label: '巷道', icon: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="6" width="14" height="10" rx="1"/><path d="M3 10h14"/></svg>' },
  { key: 'sensor' as const, label: '传感器', icon: '<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10" cy="8" r="3"/><path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>' },
]

// 时间显示
const currentTime = ref('')
let timeInterval: number

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  })
}

onMounted(() => {
  updateTime()
  timeInterval = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  clearInterval(timeInterval)
})

// 传感器统计
const sensorStats = computed(() => {
  // 从场景中的传感器数据计算
  const allSensors = [
    { status: 'normal' }, { status: 'warning' }, { status: 'alarm' }, { status: 'normal' },
    { status: 'normal' }, { status: 'warning' }, { status: 'alarm' },
    { status: 'normal' }, { status: 'warning' }, { status: 'normal' },
    { status: 'normal' }, { status: 'warning' },
  ]
  const normal = allSensors.filter(s => s.status === 'normal').length
  const warning = allSensors.filter(s => s.status === 'warning').length
  const alarm = allSensors.filter(s => s.status === 'alarm').length
  return { normal, warning, alarm, total: allSensors.length }
})

// 传感器摘要列表
const sensorSummary = [
  { id: 'K01', name: '顶板压力-01', value: 24.5, unit: 'MPa', status: 'normal' },
  { id: 'K02', name: '顶板压力-02', value: 31.2, unit: 'MPa', status: 'warning' },
  { id: 'K03', name: '顶板压力-03', value: 45.8, unit: 'MPa', status: 'alarm' },
  { id: 'K05', name: '离层监测-01', value: 1.2, unit: 'mm', status: 'normal' },
  { id: 'K06', name: '离层监测-02', value: 3.8, unit: 'mm', status: 'warning' },
  { id: 'K07', name: '离层监测-03', value: 8.5, unit: 'mm', status: 'alarm' },
  { id: 'K08', name: '应力监测-01', value: 15.6, unit: 'MPa', status: 'normal' },
  { id: 'K09', name: '应力监测-02', value: 22.4, unit: 'MPa', status: 'warning' },
  { id: 'K11', name: '温度监测-01', value: 28.3, unit: '°C', status: 'normal' },
]

// 标签辅助
function sensorTypeLabel(type: string) {
  const map: Record<string, string> = { pressure: '压力', displacement: '离层', stress: '应力', temperature: '温度' }
  return map[type] || type
}

function sensorStatusLabel(status: string) {
  const map: Record<string, string> = { normal: '正常', warning: '预警', alarm: '报警' }
  return map[status] || status
}

function typeColor(type: string) {
  const map: Record<string, string> = { pressure: '#3b82f6', displacement: '#06b6d4', stress: '#f59e0b', temperature: '#ef4444' }
  return map[type] || '#3b82f6'
}

function facilityTypeLabel(type: string) {
  const map: Record<string, string> = { building: '建筑', equipment: '设备', zone: '区域', sensor: '传感器' }
  return map[type] || type
}
</script>

<style scoped>
.digital-twin-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #040a18;
  overflow: hidden;
}

/* ─── 顶部标题栏 ─── */
.twin-header {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: linear-gradient(180deg, rgba(6, 20, 40, 0.95) 0%, rgba(4, 10, 24, 0.9) 100%);
  border-bottom: 1px solid rgba(6, 182, 212, 0.15);
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

.twin-header::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.4), transparent);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 6px;
  background: rgba(6, 182, 212, 0.08);
}

.header-title {
  font-size: 16px;
  font-weight: 700;
  color: #e8f0ff;
  letter-spacing: 2px;
  margin: 0;
  background: linear-gradient(135deg, #e8f0ff, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-subtitle {
  font-size: 11px;
  color: rgba(148, 180, 220, 0.6);
  margin-left: 4px;
}

.header-center {
  display: flex;
  gap: 4px;
  background: rgba(10, 22, 40, 0.6);
  border: 1px solid rgba(6, 182, 212, 0.12);
  border-radius: 6px;
  padding: 3px;
}

.view-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 14px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: rgba(180, 200, 230, 0.7);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn:hover {
  background: rgba(6, 182, 212, 0.1);
  color: #c0daf0;
}

.view-btn.active {
  background: rgba(6, 182, 212, 0.18);
  color: #06b6d4;
  box-shadow: 0 0 8px rgba(6, 182, 212, 0.15);
}

.view-btn-icon {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(180, 200, 230, 0.7);
}

.header-stat b {
  color: #e0ecff;
  margin-left: 2px;
}

.stat-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.stat-dot.normal { background: #10b981; box-shadow: 0 0 4px #10b981; }
.stat-dot.warning { background: #f59e0b; box-shadow: 0 0 4px #f59e0b; }
.stat-dot.alarm { background: #ef4444; box-shadow: 0 0 4px #ef4444; animation: alarmPulse 1s infinite; }

@keyframes alarmPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.header-time {
  font-size: 12px;
  color: rgba(148, 180, 220, 0.6);
  font-family: 'Courier New', monospace;
  min-width: 140px;
  text-align: right;
}

/* ─── 主体区域 ─── */
.twin-main {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.three-container {
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center, #0d1f3c 0%, #040a18 100%);
}

/* ─── 左侧工具栏 ─── */
.left-toolbar {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 5;
}

.tool-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(6, 182, 212, 0.2);
  border-radius: 6px;
  background: rgba(4, 10, 24, 0.75);
  color: rgba(180, 200, 230, 0.6);
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(8px);
}

.tool-btn:hover {
  border-color: rgba(6, 182, 212, 0.4);
  color: #a0c0e0;
  background: rgba(6, 182, 212, 0.08);
}

.tool-btn.active {
  border-color: rgba(6, 182, 212, 0.5);
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.12);
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.15);
}

/* ─── 右侧信息面板 ─── */
.right-panel {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  overflow-y: auto;
  z-index: 5;
  pointer-events: none;
}

.right-panel > * {
  pointer-events: auto;
}

.panel-card {
  background: rgba(4, 10, 24, 0.82);
  border: 1px solid rgba(6, 182, 212, 0.12);
  border-radius: 8px;
  backdrop-filter: blur(12px);
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #c0d8f0;
  border-bottom: 1px solid rgba(6, 182, 212, 0.08);
}

.panel-indicator {
  width: 3px;
  height: 14px;
  border-radius: 2px;
}

.sensor-indicator { background: #06b6d4; box-shadow: 0 0 6px rgba(6, 182, 212, 0.5); }
.facility-indicator { background: #3b82f6; box-shadow: 0 0 6px rgba(59, 130, 246, 0.5); }
.list-indicator { background: #10b981; box-shadow: 0 0 6px rgba(16, 185, 129, 0.5); }
.legend-indicator { background: #8b5cf6; box-shadow: 0 0 6px rgba(139, 92, 246, 0.5); }

.panel-close {
  margin-left: auto;
  background: none;
  border: none;
  color: rgba(180, 200, 230, 0.4);
  font-size: 16px;
  cursor: pointer;
  padding: 0 2px;
  line-height: 1;
}

.panel-close:hover {
  color: #ef4444;
}

.panel-count {
  margin-left: auto;
  font-size: 11px;
  color: rgba(6, 182, 212, 0.7);
  background: rgba(6, 182, 212, 0.1);
  padding: 1px 8px;
  border-radius: 10px;
}

.panel-body {
  padding: 10px 14px;
}

/* ─── 信息行 ─── */
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 0;
  border-bottom: 1px solid rgba(6, 182, 212, 0.05);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 12px;
  color: rgba(148, 180, 220, 0.6);
}

.info-value {
  font-size: 13px;
  color: #d0e0f5;
  font-weight: 500;
}

.info-value.big-value {
  font-size: 18px;
  font-weight: 700;
  color: #06b6d4;
}

.info-value .unit {
  font-size: 12px;
  font-weight: 400;
  color: rgba(148, 180, 220, 0.6);
  margin-left: 2px;
}

.info-value.mono {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  color: rgba(148, 180, 220, 0.5);
}

.type-badge {
  font-size: 11px;
  padding: 2px 8px;
  border: 1px solid;
  border-radius: 3px;
  font-weight: 500;
}

.status-badge {
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 3px;
  font-weight: 600;
}

.status-badge.normal { background: rgba(16, 185, 129, 0.15); color: #10b981; }
.status-badge.warning { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
.status-badge.alarm { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

.facility-status-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-top: 8px;
  font-size: 12px;
  color: #10b981;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-dot.online {
  background: #10b981;
  box-shadow: 0 0 4px #10b981;
}

/* ─── 传感器列表 ─── */
.sensor-list {
  max-height: 240px;
  overflow-y: auto;
}

.sensor-list::-webkit-scrollbar {
  width: 3px;
}

.sensor-list::-webkit-scrollbar-thumb {
  background: rgba(6, 182, 212, 0.2);
  border-radius: 2px;
}

.sensor-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(6, 182, 212, 0.04);
  font-size: 12px;
}

.sensor-item:last-child {
  border-bottom: none;
}

.sensor-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.sensor-dot.normal { background: #10b981; }
.sensor-dot.warning { background: #f59e0b; }
.sensor-dot.alarm { background: #ef4444; animation: alarmPulse 1s infinite; }

.sensor-name {
  flex: 1;
  color: rgba(180, 200, 230, 0.7);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sensor-val {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  font-size: 11px;
}

.sensor-val.normal { color: #10b981; }
.sensor-val.warning { color: #f59e0b; }
.sensor-val.alarm { color: #ef4444; }

/* ─── 图例 ─── */
.legend-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: rgba(180, 200, 230, 0.6);
  padding: 4px 0;
}

.legend-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 3px;
}

/* ─── 底部状态栏 ─── */
.twin-footer {
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  background: rgba(4, 10, 24, 0.9);
  border-top: 1px solid rgba(6, 182, 212, 0.1);
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

.twin-footer::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.3), transparent);
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.footer-label {
  color: rgba(148, 180, 220, 0.45);
}

.footer-value {
  color: rgba(180, 200, 230, 0.75);
}

.pulse-text {
  color: #10b981;
  position: relative;
}

.pulse-text::before {
  content: '';
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #10b981;
  margin-right: 4px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 2px #10b981; }
  50% { opacity: 0.4; box-shadow: 0 0 6px #10b981; }
}

.online-text {
  color: #10b981;
}

/* ─── 滚动条全局 ─── */
.right-panel::-webkit-scrollbar {
  width: 0;
}
</style>
