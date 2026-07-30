import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { warningApi } from '@/api/warning'
import type { WarningEvent, WarningStatistics } from '@/types/warning'

export const useWarningStore = defineStore('warning', () => {
  const events = ref<WarningEvent[]>([])
  const statistics = ref<WarningStatistics | null>(null)
  const loading = ref(false)

  const activeWarnings = computed(() =>
    events.value.filter((e) => e.status === 'active')
  )
  const criticalCount = computed(() =>
    activeWarnings.value.filter((e) => e.warning_level === 4).length
  )

  async function fetchEvents(params?: {
    skip?: number
    limit?: number
    warning_level?: number
    status?: string
    mine_area?: string
  }) {
    loading.value = true
    try {
      const res = await warningApi.listEvents(params)
      events.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function fetchStatistics() {
    const res = await warningApi.statistics()
    statistics.value = res.data
  }

  async function confirmEvent(eventId: number, data: { confirmed_by: string; action: string; note?: string }) {
    await warningApi.confirmEvent(eventId, data)
    await fetchEvents()
  }

  return { events, statistics, loading, activeWarnings, criticalCount, fetchEvents, fetchStatistics, confirmEvent }
})
