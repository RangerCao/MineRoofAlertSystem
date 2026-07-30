<template>
  <div class="warning-view">
    <!-- 预警统计 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6" v-for="level in levelStats" :key="level.level">
        <div class="level-card" :style="{ borderColor: level.color }">
          <div class="level-card__header">
            <el-tag :color="level.color" effect="dark" size="small">{{ level.label }}</el-tag>
          </div>
          <div class="level-card__count" :style="{ color: level.color }">{{ level.count }}</div>
          <div class="level-card__desc">活跃预警</div>
        </div>
      </el-col>
    </el-row>

    <!-- 筛选与列表 -->
    <el-card class="events-card">
      <template #header>
        <div class="card-header">
          <span>预警事件列表</span>
          <div class="filters">
            <el-select v-model="filterLevel" placeholder="预警等级" clearable size="small" style="width: 120px">
              <el-option label="I级-正常" :value="1" />
              <el-option label="II级-关注" :value="2" />
              <el-option label="III级-预警" :value="3" />
              <el-option label="IV级-危险" :value="4" />
            </el-select>
            <el-select v-model="filterStatus" placeholder="状态" clearable size="small" style="width: 120px">
              <el-option label="活跃" value="active" />
              <el-option label="已确认" value="confirmed" />
              <el-option label="已解决" value="resolved" />
              <el-option label="已忽略" value="ignored" />
            </el-select>
            <el-input v-model="searchText" placeholder="搜索事件编号/位置" clearable size="small" style="width: 200px" />
          </div>
        </div>
      </template>

      <el-table :data="filteredEvents" style="width: 100%">
        <el-table-column prop="event_code" label="事件编号" width="200" />
        <el-table-column prop="warning_level" label="等级" width="100">
          <template #default="{ row }">
            <el-tag :color="getLevelColor(row.warning_level)" effect="dark" size="small">
              {{ getLevelLabel(row.warning_level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="warning_type" label="类型" width="120" />
        <el-table-column prop="location" label="位置" width="150" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="confidence" label="置信度" width="100">
          <template #default="{ row }">
            {{ row.confidence ? (row.confidence * 100).toFixed(0) + '%' : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="时间" width="180" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'active'" text type="primary" size="small" @click="handleConfirm(row)">
              确认
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="totalEvents"
          layout="total, prev, pager, next"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const filterLevel = ref<number | undefined>()
const filterStatus = ref('')
const searchText = ref('')
const currentPage = ref(1)
const pageSize = 20
const totalEvents = ref(125)

const levelStats = ref([
  { level: 1, label: 'I级-正常', count: 85, color: '#52c41a' },
  { level: 2, label: 'II级-关注', count: 25, color: '#faad14' },
  { level: 3, label: 'III级-预警', count: 12, color: '#ff7a45' },
  { level: 4, label: 'IV级-危险', count: 3, color: '#f5222d' },
])

// 模拟预警事件
const events = ref([
  { id: 1, event_code: 'WRN-20260720-A1B2C3', warning_level: 4, warning_type: '多场耦合', location: '1201工作面', description: '应力+位移联合超限', confidence: 0.92, status: 'active', created_at: '2026-07-20 14:30:00' },
  { id: 2, event_code: 'WRN-20260720-D4E5F6', warning_level: 3, warning_type: '应力异常', location: '1201工作面', description: '顶板应力超过预警阈值', confidence: 0.87, status: 'active', created_at: '2026-07-20 13:15:00' },
  { id: 3, event_code: 'WRN-20260720-G7H8I9', warning_level: 2, warning_type: '位移偏大', location: '1203工作面', description: '顶板下沉速率偏快', confidence: 0.78, status: 'confirmed', created_at: '2026-07-20 12:00:00' },
  { id: 4, event_code: 'WRN-20260720-J1K2L3', warning_level: 3, warning_type: '裂隙扩展', location: '1205工作面', description: '裂隙宽度增速异常', confidence: 0.83, status: 'active', created_at: '2026-07-20 11:30:00' },
  { id: 5, event_code: 'WRN-20260720-M4N5O6', warning_level: 1, warning_type: '渗流变化', location: '1202工作面', description: '渗流量轻微波动', confidence: 0.65, status: 'resolved', created_at: '2026-07-20 10:00:00' },
])

const filteredEvents = computed(() => {
  return events.value.filter((e) => {
    if (filterLevel.value && e.warning_level !== filterLevel.value) return false
    if (filterStatus.value && e.status !== filterStatus.value) return false
    if (searchText.value) {
      const s = searchText.value.toLowerCase()
      if (!e.event_code.toLowerCase().includes(s) && !e.location?.toLowerCase().includes(s)) return false
    }
    return true
  })
})

function getLevelColor(level: number) {
  const colors: Record<number, string> = { 1: '#52c41a', 2: '#faad14', 3: '#ff7a45', 4: '#f5222d' }
  return colors[level] || '#999'
}

function getLevelLabel(level: number) {
  const labels: Record<number, string> = { 1: '正常', 2: '关注', 3: '预警', 4: '危险' }
  return labels[level] || '未知'
}

function getStatusType(status: string) {
  const types: Record<string, string> = { active: 'danger', confirmed: 'warning', resolved: 'success', ignored: 'info' }
  return (types[status] || 'info') as any
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = { active: '活跃', confirmed: '已确认', resolved: '已解决', ignored: '已忽略' }
  return labels[status] || status
}

function handleConfirm(row: any) {
  console.log('确认预警事件', row.event_code)
}
</script>

<style scoped>
.warning-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stats-row {
  margin-bottom: 0;
}

.level-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-left-width: 3px;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.level-card__count {
  font-size: 32px;
  font-weight: 700;
  margin: 8px 0 4px;
}

.level-card__desc {
  font-size: 12px;
  color: var(--text-secondary);
}

.events-card {
  background: var(--bg-card);
  border-color: var(--border-color);
}

.events-card :deep(.el-card__header) {
  border-bottom-color: var(--border-color);
  color: var(--text-primary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filters {
  display: flex;
  gap: 8px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
