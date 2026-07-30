<template>
  <div class="dashboard">
    <!-- 顶部状态栏 -->
    <el-row :gutter="16" class="status-row">
      <el-col :span="6">
        <div class="data-panel">
          <div class="data-panel__title">传感器总数</div>
          <div class="data-panel__value">{{ sensorTotal }}</div>
          <div class="data-panel__sub">
            <span class="online">在线 {{ onlineCount }}</span>
            <span class="alarm">报警 {{ alarmCount }}</span>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="data-panel">
          <div class="data-panel__title">活跃预警</div>
          <div class="data-panel__value" :style="{ color: riskColor }">{{ activeWarnings }}</div>
          <div class="data-panel__sub">
            <span>24h新增 {{ recent24h }}</span>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="data-panel">
          <div class="data-panel__title">综合风险评分</div>
          <div class="data-panel__value" :style="{ color: riskColor }">{{ riskScore }}</div>
          <div class="data-panel__sub">
            <el-tag :type="riskTagType" size="small">{{ riskLevelName }}</el-tag>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="data-panel">
          <div class="data-panel__title">系统健康状态</div>
          <div class="data-panel__value" :style="{ color: healthColor }">{{ healthName }}</div>
          <div class="data-panel__sub">
            <span>解决率 {{ resolutionRate }}%</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span>传感器类型分布</span>
          </template>
          <div ref="sensorTypeChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span>预警等级分布</span>
          </template>
          <div ref="warningLevelChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最新预警 -->
    <el-card class="recent-warnings">
      <template #header>
        <div class="card-header">
          <span>最新预警事件</span>
          <el-button text type="primary" @click="$router.push('/warning')">查看全部</el-button>
        </div>
      </template>
      <el-table :data="recentWarnings" style="width: 100%">
        <el-table-column prop="event_code" label="事件编号" width="200" />
        <el-table-column prop="warning_level" label="等级" width="80">
          <template #default="{ row }">
            <el-tag :type="getLevelTagType(row.warning_level)" size="small">
              {{ getLevelName(row.warning_level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="warning_type" label="类型" width="120" />
        <el-table-column prop="location" label="位置" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="created_at" label="时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useECharts } from '@/composables/useECharts'

// 模拟数据（后续替换为真实API数据）
const sensorTotal = ref(128)
const onlineCount = ref(115)
const alarmCount = ref(5)
const activeWarnings = ref(8)
const recent24h = ref(3)
const riskScore = ref(42)
const riskLevel = ref(2)
const systemHealth = ref('healthy')
const resolutionRate = ref(87.5)

const recentWarnings = ref([
  { event_code: 'WRN-20260720-001', warning_level: 3, warning_type: '应力异常', location: '1201工作面', description: '顶板应力超过阈值', created_at: '2026-07-20 14:30:00' },
  { event_code: 'WRN-20260720-002', warning_level: 2, warning_type: '位移偏大', location: '1203工作面', description: '顶板下沉速率偏快', created_at: '2026-07-20 13:15:00' },
  { event_code: 'WRN-20260720-003', warning_level: 4, warning_type: '多场耦合', location: '1201工作面', description: '应力+位移联合预警', created_at: '2026-07-20 12:00:00' },
])

const riskColor = computed(() => {
  const colors: Record<number, string> = { 1: '#52c41a', 2: '#faad14', 3: '#ff7a45', 4: '#f5222d' }
  return colors[riskLevel.value] || '#999'
})

const riskTagType = computed(() => {
  const types: Record<number, string> = { 1: 'success', 2: 'warning', 3: 'warning', 4: 'danger' }
  return (types[riskLevel.value] || 'info') as any
})

const riskLevelName = computed(() => {
  const names: Record<number, string> = { 1: '正常', 2: '关注', 3: '预警', 4: '危险' }
  return names[riskLevel.value] || '未知'
})

const healthColor = computed(() => {
  const colors: Record<string, string> = { healthy: '#10b981', warning: '#f59e0b', critical: '#ef4444' }
  return colors[systemHealth.value] || '#999'
})

const healthName = computed(() => {
  const names: Record<string, string> = { healthy: '正常', warning: '注意', critical: '异常' }
  return names[systemHealth.value] || '未知'
})

function getLevelName(level: number) {
  const names: Record<number, string> = { 1: '正常', 2: '关注', 3: '预警', 4: '危险' }
  return names[level] || '未知'
}

function getLevelTagType(level: number) {
  const types: Record<number, string> = { 1: 'success', 2: 'warning', 3: 'warning', 4: 'danger' }
  return (types[level] || 'info') as any
}

// 图表
const sensorTypeChartRef = ref<HTMLElement | null>(null)
const warningLevelChartRef = ref<HTMLElement | null>(null)
const { setOption: setSensorChart } = useECharts(sensorTypeChartRef)
const { setOption: setWarningChart } = useECharts(warningLevelChartRef)

onMounted(() => {
  // 传感器类型分布图
  setSensorChart({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: 35, name: '应力传感器' },
        { value: 28, name: '位移传感器' },
        { value: 22, name: '裂隙传感器' },
        { value: 18, name: '渗流传感器' },
        { value: 15, name: '环境传感器' },
        { value: 10, name: '空间传感器' },
      ],
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' } },
    }],
  })

  // 预警等级分布图
  setWarningChart({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['I级-正常', 'II级-关注', 'III级-预警', 'IV级-危险'] },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data: [
        { value: 85, itemStyle: { color: '#52c41a' } },
        { value: 25, itemStyle: { color: '#faad14' } },
        { value: 12, itemStyle: { color: '#ff7a45' } },
        { value: 3, itemStyle: { color: '#f5222d' } },
      ],
      barWidth: '40%',
    }],
  })
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-row {
  margin-bottom: 0;
}

.data-panel__sub {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  gap: 12px;
}

.data-panel__sub .online { color: #10b981; }
.data-panel__sub .alarm { color: #ef4444; }

.chart-row {
  margin-bottom: 0;
}

.chart-card {
  background: var(--bg-card);
  border-color: var(--border-color);
}

.chart-card :deep(.el-card__header) {
  border-bottom-color: var(--border-color);
  color: var(--text-primary);
  padding: 12px 16px;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.recent-warnings {
  background: var(--bg-card);
  border-color: var(--border-color);
}

.recent-warnings :deep(.el-card__header) {
  border-bottom-color: var(--border-color);
  color: var(--text-primary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
