<template>
  <div class="system-list-wrap">
    <div class="list-header">
      <span class="list-title">已接入系统</span>
      <div class="list-actions">
        <el-input v-model="searchText" placeholder="搜索系统..." prefix-icon="Search" clearable style="width: 200px" />
        <el-button type="primary" @click="showForm = true">
          <el-icon style="margin-right: 4px"><Plus /></el-icon>
          接入系统
        </el-button>
      </div>
    </div>

    <el-row :gutter="16">
      <el-col :span="8" v-for="sys in filteredSystems" :key="sys.id">
        <div class="system-card">
          <div class="system-card__header">
            <span class="system-card__name">{{ sys.name }}</span>
            <el-tag
              :type="SYSTEM_STATUS_TAG_TYPE[sys.status]"
              size="small"
              effect="light"
            >
              {{ SYSTEM_STATUS_LABELS[sys.status] }}
            </el-tag>
          </div>
          <div class="system-card__body">
            <div class="info-row">
              <span class="info-label">接口类型</span>
              <span class="info-value">{{ INTERFACE_TYPE_LABELS[sys.interface_type] }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">接入地址</span>
              <span class="info-value mono">{{ sys.endpoint_url }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">数据方向</span>
              <span class="info-value">{{ dataDirectionLabel(sys.data_direction) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">API数量</span>
              <span class="info-value">{{ sys.api_count }} 个</span>
            </div>
            <div class="info-row" v-if="sys.last_sync_at">
              <span class="info-label">最近同步</span>
              <span class="info-value">{{ formatTime(sys.last_sync_at) }}</span>
            </div>
          </div>
          <div class="system-card__footer">
            <el-button link type="primary" size="small" @click="handleEdit(sys)">编辑</el-button>
            <el-button link type="primary" size="small">测试连接</el-button>
            <el-button link type="danger" size="small">移除</el-button>
          </div>
        </div>
      </el-col>
    </el-row>

    <SystemFormDialog v-model:visible="showForm" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDeviceAccessStore } from '@/stores/deviceAccess'
import { INTERFACE_TYPE_LABELS, SYSTEM_STATUS_LABELS, SYSTEM_STATUS_TAG_TYPE } from '@/types/deviceAccess'
import type { SystemIntegration } from '@/types/deviceAccess'
import SystemFormDialog from './SystemFormDialog.vue'

const store = useDeviceAccessStore()
const searchText = ref('')
const showForm = ref(false)

const filteredSystems = computed(() => {
  if (!searchText.value) return store.systems
  const kw = searchText.value.toLowerCase()
  return store.systems.filter(s =>
    s.name.toLowerCase().includes(kw) || s.system_code.toLowerCase().includes(kw)
  )
})

function dataDirectionLabel(dir: string) {
  const map: Record<string, string> = { pull: '拉取', push: '推送', bidirectional: '双向' }
  return map[dir] || dir
}

function handleEdit(sys: SystemIntegration) {
  // TODO: 打开编辑表单
  console.log('edit system', sys.id)
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.system-list-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.list-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.list-actions {
  display: flex;
  gap: 12px;
}

.system-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: border-color 0.2s;
}

.system-card:hover {
  border-color: var(--accent-blue);
}

.system-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.system-card__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.system-card__body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-row {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.info-label {
  color: var(--text-secondary);
  width: 72px;
  flex-shrink: 0;
}

.info-value {
  color: var(--text-primary);
}

.info-value.mono {
  font-family: 'Consolas', monospace;
  font-size: 11px;
  word-break: break-all;
}

.system-card__footer {
  display: flex;
  gap: 8px;
  border-top: 1px solid var(--border-color);
  padding-top: 10px;
}
</style>
