export interface Sensor {
  id: number
  sensor_code: string
  name: string
  sensor_type: SensorType
  location: string | null
  mine_area: string | null
  working_face: string | null
  coordinates: { x: number; y: number; z: number } | null
  status: 'online' | 'offline' | 'alarm'
  install_date: string | null
  created_at: string
  updated_at: string
}

export type SensorType = 'stress' | 'displacement' | 'crack' | 'seepage' | 'environment' | 'spatial'

export interface SensorReading {
  id: number
  sensor_id: number
  sensor_code: string
  measurement: string
  value: number
  unit: string | null
  quality_flag: 'valid' | 'suspect' | 'invalid'
  recorded_at: string
  created_at: string
}

export interface SensorStatistics {
  total_count: number
  online_count: number
  offline_count: number
  alarm_count: number
  by_type: Record<string, number>
  by_mine_area: Record<string, number>
}

export interface SensorListResponse {
  total: number
  items: Sensor[]
}
