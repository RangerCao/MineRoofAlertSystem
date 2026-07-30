import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DashboardSummary } from '@/types/dashboard'
import { dashboardApi } from '@/api/dashboard'

export const useDashboardStore = defineStore('dashboard', () => {
  const summary = ref<DashboardSummary | null>(null)
  const loading = ref(false)

  async function fetchSummary() {
    loading.value = true
    try {
      const res = await dashboardApi.summary()
      summary.value = res.data
    } finally {
      loading.value = false
    }
  }

  return { summary, loading, fetchSummary }
})
