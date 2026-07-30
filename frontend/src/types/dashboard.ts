export interface DashboardSummary {
  sensor_stats: {
    total_count: number
    online_count: number
    offline_count: number
    alarm_count: number
    by_type: Record<string, number>
    by_mine_area: Record<string, number>
  }
  warning_stats: {
    total_active: number
    by_level: Record<number, number>
    by_type: Record<string, number>
    by_status: Record<string, number>
    recent_24h: number
    resolution_rate: number
  }
  risk_level: 1 | 2 | 3 | 4
  risk_score: number
  system_health: 'healthy' | 'warning' | 'critical' | 'unknown'
  last_updated: string
}
