export interface WarningEvent {
  id: number
  event_code: string
  warning_level: 1 | 2 | 3 | 4
  warning_type: string
  source_sensors: string[] | null
  location: string | null
  mine_area: string | null
  working_face: string | null
  description: string | null
  trigger_value: number | null
  threshold_value: number | null
  algorithm_used: string | null
  confidence: number | null
  status: 'active' | 'confirmed' | 'resolved' | 'ignored'
  confirmed_by: string | null
  confirmed_at: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}

export interface WarningRule {
  id: number
  name: string
  description: string | null
  sensor_type: string
  measurement: string
  threshold_config: Record<string, any>
  algorithm: string | null
  is_active: number
  created_at: string
  updated_at: string
}

export interface WarningStatistics {
  total_active: number
  by_level: Record<number, number>
  by_type: Record<string, number>
  by_status: Record<string, number>
  recent_24h: number
  resolution_rate: number
}

/** 预警等级定义 */
export const WARNING_LEVELS = {
  1: { label: '正常', color: '#52c41a', tagType: 'success' as const },
  2: { label: '关注', color: '#faad14', tagType: 'warning' as const },
  3: { label: '预警', color: '#ff7a45', tagType: 'warning' as const },
  4: { label: '危险', color: '#f5222d', tagType: 'danger' as const },
} as const
