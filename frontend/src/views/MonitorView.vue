<template>
  <div class="monitor-view">
    <el-row :gutter="16">
      <!-- 左侧：实时数据面板 -->
      <el-col :span="8">
        <el-card class="monitor-card">
          <template #header>
            <div class="card-header">
              <span>实时监测数据</span>
              <el-tag type="success" size="small">
                <el-icon><CircleCheck /></el-icon> 实时
              </el-tag>
            </div>
          </template>

          <!-- 传感器类型选择 -->
          <el-select v-model="selectedType" placeholder="选择传感器类型" class="type-select">
            <el-option label="应力场" value="stress" />
            <el-option label="位移场" value="displacement" />
            <el-option label="裂隙场" value="crack" />
            <el-option label="渗流场" value="seepage" />
            <el-option label="环境场" value="environment" />
            <el-option label="空间场" value="spatial" />
          </el-select>

          <!-- 实时数据列表 -->
          <div class="data-list">
            <div v-for="item in sensorData" :key="item.id" class="data-item">
              <div class="data-item__header">
                <span class="data-item__name">{{ item.name }}</span>
                <el-tag :type="item.status === 'online' ? 'success' : 'danger'" size="small">
                  {{ item.status === 'online' ? '在线' : '离线' }}
                </el-tag>
              </div>
              <div class="data-item__value">
                <span class="value">{{ item.value }}</span>
                <span class="unit">{{ item.unit }}</span>
              </div>
              <div class="data-item__bar">
                <el-progress
                  :percentage="item.percentage"
                  :color="item.percentage > 80 ? '#ef4444' : item.percentage > 60 ? '#f59e0b' : '#10b981'"
                  :stroke-width="6"
                  :show-text="false"
                />
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：实时曲线图 -->
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>实时数据曲线</span>
              <el-radio-group v-model="timeRange" size="small">
                <el-radio-button value="1h">1小时</el-radio-button>
                <el-radio-button value="6h">6小时</el-radio-button>
                <el-radio-button value="24h">24小时</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="realtimeChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { CircleCheck } from '@element-plus/icons-vue'
import { useECharts } from '@/composables/useECharts'

const selectedType = ref('stress')
const timeRange = ref('1h')

// 模拟传感器数据
const sensorData = ref([
  { id: 1, name: '应力传感器-S01', value: 12.5, unit: 'MPa', percentage: 62, status: 'online' },
  { id: 2, name: '应力传感器-S02', value: 8.3, unit: 'MPa', percentage: 41, status: 'online' },
  { id: 3, name: '应力传感器-S03', value: 18.7, unit: 'MPa', percentage: 93, status: 'online' },
  { id: 4, name: '应力传感器-S04', value: 15.2, unit: 'MPa', percentage: 76, status: 'alarm' },
  { id: 5, name: '应力传感器-S05', value: 6.8, unit: 'MPa', percentage: 34, status: 'online' },
])

const realtimeChartRef = ref<HTMLElement | null>(null)
const { setOption } = useECharts(realtimeChartRef)

onMounted(() => {
  // 生成模拟时间序列
  const times = Array.from({ length: 60 }, (_, i) => {
    const d = new Date()
    d.setMinutes(d.getMinutes() - (59 - i))
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  })

  setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['S01', 'S02', 'S03', 'S04', 'S05'], textStyle: { color: '#8b9dc3' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: times, axisLabel: { color: '#8b9dc3' } },
    yAxis: { type: 'value', name: 'MPa', axisLabel: { color: '#8b9dc3' }, nameTextStyle: { color: '#8b9dc3' } },
    series: [
      { name: 'S01', type: 'line', smooth: true, data: times.map(() => 10 + Math.random() * 5) },
      { name: 'S02', type: 'line', smooth: true, data: times.map(() => 6 + Math.random() * 4) },
      { name: 'S03', type: 'line', smooth: true, data: times.map(() => 15 + Math.random() * 6) },
      { name: 'S04', type: 'line', smooth: true, data: times.map(() => 12 + Math.random() * 8) },
      { name: 'S05', type: 'line', smooth: true, data: times.map(() => 5 + Math.random() * 3) },
    ],
  })
})
</script>

<style scoped>
.monitor-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.monitor-card, .chart-card {
  background: var(--bg-card);
  border-color: var(--border-color);
}

.monitor-card :deep(.el-card__header),
.chart-card :deep(.el-card__header) {
  border-bottom-color: var(--border-color);
  color: var(--text-primary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.type-select {
  width: 100%;
  margin-bottom: 16px;
}

.data-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.data-item {
  padding: 12px;
  background: rgba(59, 130, 246, 0.05);
  border-radius: 6px;
  border: 1px solid var(--border-color);
}

.data-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.data-item__name {
  font-size: 13px;
  color: var(--text-secondary);
}

.data-item__value {
  margin-bottom: 8px;
}

.data-item__value .value {
  font-size: 24px;
  font-weight: 700;
  color: var(--accent-cyan);
}

.data-item__value .unit {
  font-size: 12px;
  color: var(--text-secondary);
  margin-left: 4px;
}

.chart-container {
  height: 400px;
  width: 100%;
}
</style>
