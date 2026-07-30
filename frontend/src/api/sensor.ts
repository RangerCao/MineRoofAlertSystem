import request from './index'
import type { Sensor, SensorListResponse, SensorStatistics } from '@/types/sensor'

export const sensorApi = {
  list(params?: Record<string, any>) {
    return request.get<SensorListResponse>('/sensors/', { params })
  },
  getById(id: number) {
    return request.get<Sensor>(`/sensors/${id}`)
  },
  create(data: Partial<Sensor>) {
    return request.post<Sensor>('/sensors/', data)
  },
  update(id: number, data: Partial<Sensor>) {
    return request.put<Sensor>(`/sensors/${id}`, data)
  },
  statistics() {
    return request.get<SensorStatistics>('/sensors/statistics')
  },
}
