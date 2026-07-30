/**
 * ECharts 图表组合式函数
 */
import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

export function useECharts(
  chartRef: Ref<HTMLElement | null>,
  darkMode: boolean = true
) {
  const chartInstance = ref<echarts.ECharts | null>(null)

  function initChart() {
    if (!chartRef.value) return
    chartInstance.value = echarts.init(chartRef.value, darkMode ? 'dark' : undefined)
  }

  function setOption(option: EChartsOption) {
    if (chartInstance.value) {
      chartInstance.value.setOption(option, { notMerge: true })
    }
  }

  function resize() {
    chartInstance.value?.resize()
  }

  function dispose() {
    chartInstance.value?.dispose()
    chartInstance.value = null
  }

  onMounted(() => {
    initChart()
    window.addEventListener('resize', resize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', resize)
    dispose()
  })

  return { chartInstance, setOption, resize, dispose }
}
