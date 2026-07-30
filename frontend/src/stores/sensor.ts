import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { sensorApi } from '@/api/sensor'
import type { Sensor, SensorStatistics } from '@/types/sensor'

export const useSensorStore = defineStore('sensor', () => {
  const sensors = ref<Sensor[]>([])
  const statistics = ref<SensorStatistics | null>(null)
  const loading = ref(false)
  const total = ref(0)

  const onlineCount = computed(() =>
    sensors.value.filter((s) => s.status === 'online').length
  )
  const alarmCount = computed(() =>
    sensors.value.filter((s) => s.status === 'alarm').length
  )

  async function fetchSensors(params?: {
    skip?: number
    limit?: number
    sensor_type?: string
    mine_area?: string
    status?: string
  }) {
    loading.value = true
    try {
      const res = await sensorApi.list(params)
      sensors.value = res.data.items
      total.value = res.data.total
    } finally {
      loading.value = false
    }
  }

  async function fetchStatistics() {
    const res = await sensorApi.statistics()
    statistics.value = res.data
  }

  return { sensors, statistics, loading, total, onlineCount, alarmCount, fetchSensors, fetchStatistics }
})
