<template>
  <div class="settings-view">
    <el-card class="settings-card">
      <template #header>
        <span>系统设置</span>
      </template>

      <el-tabs>
        <el-tab-pane label="预警规则配置">
          <div class="rule-section">
            <el-table :data="rules" style="width: 100%">
              <el-table-column prop="name" label="规则名称" />
              <el-table-column prop="sensor_type" label="传感器类型" width="120" />
              <el-table-column prop="algorithm" label="算法" width="120" />
              <el-table-column prop="is_active" label="状态" width="80">
                <template #default="{ row }">
                  <el-switch v-model="row.is_active" :active-value="1" :inactive-value="0" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default>
                  <el-button text type="primary" size="small">编辑</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="系统参数">
          <el-form label-width="160px" style="max-width: 600px">
            <el-form-item label="数据刷新间隔(秒)">
              <el-input-number v-model="refreshInterval" :min="1" :max="300" />
            </el-form-item>
            <el-form-item label="WebSocket 重连间隔(秒)">
              <el-input-number v-model="wsReconnect" :min="1" :max="60" />
            </el-form-item>
            <el-form-item label="预警推送通知">
              <el-switch v-model="enableNotify" />
            </el-form-item>
            <el-form-item label="暗色主题">
              <el-switch v-model="darkMode" disabled />
            </el-form-item>
            <el-form-item>
              <el-button type="primary">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="用户管理">
          <el-table :data="users" style="width: 100%">
            <el-table-column prop="username" label="用户名" />
            <el-table-column prop="full_name" label="姓名" />
            <el-table-column prop="role" label="角色" width="120">
              <template #default="{ row }">
                <el-tag size="small">{{ roleLabels[row.role] || row.role }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="organization" label="组织" />
            <el-table-column label="操作" width="120">
              <template #default>
                <el-button text type="primary" size="small">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const refreshInterval = ref(5)
const wsReconnect = ref(3)
const enableNotify = ref(true)
const darkMode = ref(true)

const roleLabels: Record<string, string> = {
  admin: '管理员', enterprise: '企业端', think_tank: '智库端', regulatory: '监管端', operator: '操作员',
}

const rules = ref([
  { name: '应力超限预警', sensor_type: 'stress', algorithm: 'threshold', is_active: 1 },
  { name: '位移速率预警', sensor_type: 'displacement', algorithm: 'lstm', is_active: 1 },
  { name: '裂隙扩展预警', sensor_type: 'crack', algorithm: 'xgboost', is_active: 1 },
  { name: '多场耦合预警', sensor_type: 'coupled', algorithm: 'st-attention', is_active: 0 },
])

const users = ref([
  { username: 'admin', full_name: '系统管理员', role: 'admin', organization: '系统' },
  { username: 'enterprise01', full_name: '张工', role: 'enterprise', organization: '中建筑港' },
  { username: 'thinktank01', full_name: '李研究员', role: 'think_tank', organization: '研究院' },
])
</script>

<style scoped>
.settings-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.settings-card {
  background: var(--bg-card);
  border-color: var(--border-color);
}

.settings-card :deep(.el-card__header) {
  border-bottom-color: var(--border-color);
  color: var(--text-primary);
}

.settings-card :deep(.el-tabs__item) {
  color: var(--text-secondary);
}

.settings-card :deep(.el-tabs__item.is-active) {
  color: var(--accent-blue);
}

.rule-section {
  padding-top: 8px;
}
</style>
