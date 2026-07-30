import request from './index'
import type { WarningEvent, WarningRule, WarningStatistics } from '@/types/warning'

export const warningApi = {
  listEvents(params?: Record<string, any>) {
    return request.get<WarningEvent[]>('/warnings/events', { params })
  },
  confirmEvent(eventId: number, data: { confirmed_by: string; action: string; note?: string }) {
    return request.post<WarningEvent>(`/warnings/events/${eventId}/confirm`, data)
  },
  listRules(params?: Record<string, any>) {
    return request.get<WarningRule[]>('/warnings/rules', { params })
  },
  createRule(data: Partial<WarningRule>) {
    return request.post<WarningRule>('/warnings/rules', data)
  },
  statistics() {
    return request.get<WarningStatistics>('/warnings/statistics')
  },
}
