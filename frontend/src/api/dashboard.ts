import request from './index'
import type { DashboardSummary } from '@/types/dashboard'

export const dashboardApi = {
  summary() {
    return request.get<DashboardSummary>('/dashboard/summary')
  },
}
