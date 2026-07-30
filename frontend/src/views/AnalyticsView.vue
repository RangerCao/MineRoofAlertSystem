<template>
  <div class="analytics-view">
    <el-row :gutter="16">
      <!-- 趋势分析 -->
      <el-col :span="24">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>多场耦合趋势分析</span>
              <div class="controls">
                <el-select v-model="selectedArea" size="small" style="width: 140px">
                  <el-option label="1201工作面" value="1201" />
                  <el-option label="1203工作面" value="1203" />
                </el-select>
                <el-date-picker v-model="dateRange" type="daterange" size="small" start-placeholder="开始" end-placeholder="结束" />
              </div>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="second-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span>预警类型分布</span>
          </template>
          <div ref="pieChartRef" class="chart-container-sm"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span>传感器数据质量</span>
          </template>
          <div ref="qualityChartRef" class="chart-container-sm"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useECharts } from '@/composables/useECharts'

const selectedArea = ref('1201')
const dateRange = ref<[Date, Date] | null>(null)

const trendChartRef = ref<HTMLElement | null>(null)
const pieChartRef = ref<HTMLElement | null>(null)
const qualityChartRef = ref<HTMLElement | null>(null)

const { setOption: setTrend } = useECharts(trendChartRef)
const { setOption: setPie } = useECharts(pieChartRef)
const { setOption: setQuality } = useECharts(qualityChartRef)

onMounted(() => {
  // 趋势图
  const dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return `${d.getMonth() + 1}/${d.getDate()}`
  })

  setTrend({
    tooltip: { trigger: 'axis' },
    legend: { data: ['应力(MPa)', '位移(mm)', '裂隙宽度(mm)', '渗流量(L/min)'], textStyle: { color: '#8b9dc3' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: dates, axisLabel: { color: '#8b9dc3' } },
    yAxis: { type: 'value', axisLabel: { color: '#8b9dc3' } },
    series: [
      { name: '应力(MPa)', type: 'line', smooth: true, data: dates.map(() => 8 + Math.random() * 10) },
      { name: '位移(mm)', type: 'line', smooth: true, data: dates.map(() => 1 + Math.random() * 4) },
      { name: '裂隙宽度(mm)', type: 'line', smooth: true, data: dates.map(() => 0.5 + Math.random() * 2) },
      { name: '渗流量(L/min)', type: 'line', smooth: true, data: dates.map(() => 2 + Math.random() * 5) },
    ],
  })

  // 预警类型饼图
  setPie({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      radius: '65%',
      data: [
        { value: 35, name: '应力异常' },
        { value: 25, name: '位移偏大' },
        { value: 15, name: '裂隙扩展' },
        { value: 12, name: '渗流变化' },
        { value: 8, name: '多场耦合' },
        { value: 5, name: '其他' },
      ],
    }],
  })

  // 数据质量图
  setQuality({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['应力', '位移', '裂隙', '渗流', '环境', '空间'], axisLabel: { color: '#8b9dc3' } },
    yAxis: { type: 'value', max: 100, axisLabel: { color: '#8b9dc3', formatter: '{value}%' } },
    series: [
      {
        name: '有效数据率',
        type: 'bar',
        data: [96, 94, 91, 97, 98, 93],
        itemStyle: { color: '#10b981' },
        barWidth: '40%',
      },
    ],
  })
})
</script>

<style scoped>
.analytics-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.controls {
  display: flex;
  gap: 8px;
}

.chart-container {
  height: 350px;
  width: 100%;
}

.chart-container-sm {
  height: 280px;
  width: 100%;
}

.second-row {
  margin-bottom: 0;
}
</style>
