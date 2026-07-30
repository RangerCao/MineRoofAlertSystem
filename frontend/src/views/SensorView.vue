<template>
  <div class="sensor-view">
    <el-card class="sensor-card">
      <template #header>
        <div class="card-header">
          <span>传感器管理</span>
          <div class="actions">
            <el-input v-model="searchText" placeholder="搜索传感器" clearable size="small" style="width: 200px" />
            <el-button type="primary" size="small">
              <el-icon><Plus /></el-icon> 添加传感器
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="sensors" style="width: 100%">
        <el-table-column prop="sensor_code" label="编号" width="120" />
        <el-table-column prop="name" label="名称" width="150" />
        <el-table-column prop="sensor_type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ typeLabels[row.sensor_type] || row.sensor_type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="mine_area" label="矿区" width="120" />
        <el-table-column prop="working_face" label="工作面" width="120" />
        <el-table-column prop="location" label="位置" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'online' ? 'success' : row.status === 'alarm' ? 'danger' : 'info'" size="small">
              {{ statusLabels[row.status] || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default>
            <el-button text type="primary" size="small">编辑</el-button>
            <el-button text type="primary" size="small">数据</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="totalSensors"
          layout="total, prev, pager, next"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'

const searchText = ref('')
const currentPage = ref(1)
const pageSize = 20
const totalSensors = ref(128)

const typeLabels: Record<string, string> = {
  stress: '应力', displacement: '位移', crack: '裂隙',
  seepage: '渗流', environment: '环境', spatial: '空间',
}

const statusLabels: Record<string, string> = {
  online: '在线', offline: '离线', alarm: '报警',
}

// 模拟传感器数据
const sensors = ref([
  { sensor_code: 'S-001', name: '应力传感器-01', sensor_type: 'stress', mine_area: 'A区', working_face: '1201', location: '1201工作面-顶板中部', status: 'online' },
  { sensor_code: 'S-002', name: '位移传感器-01', sensor_type: 'displacement', mine_area: 'A区', working_face: '1201', location: '1201工作面-顶板左帮', status: 'online' },
  { sensor_code: 'S-003', name: '裂隙传感器-01', sensor_type: 'crack', mine_area: 'B区', working_face: '1203', location: '1203工作面-顶板右帮', status: 'alarm' },
  { sensor_code: 'S-004', name: '渗流传感器-01', sensor_type: 'seepage', mine_area: 'A区', working_face: '1202', location: '1202工作面-底板', status: 'online' },
  { sensor_code: 'S-005', name: '环境传感器-01', sensor_type: 'environment', mine_area: 'B区', working_face: '1205', location: '1205工作面-回风巷', status: 'offline' },
])
</script>

<style scoped>
.sensor-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sensor-card {
  background: var(--bg-card);
  border-color: var(--border-color);
}

.sensor-card :deep(.el-card__header) {
  border-bottom-color: var(--border-color);
  color: var(--text-primary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions {
  display: flex;
  gap: 8px;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
