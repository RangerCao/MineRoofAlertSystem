<template>
  <div class="datasource-list-wrap">
    <div class="list-header">
      <span class="list-title">已接入数据源</span>
      <div class="list-actions">
        <el-select v-model="filterCategory" placeholder="按类型筛选" clearable style="width: 150px">
          <el-option v-for="(label, key) in DATASOURCE_CATEGORY_LABELS" :key="key" :label="label" :value="key" />
        </el-select>
        <el-input v-model="searchText" placeholder="搜索数据源..." prefix-icon="Search" clearable style="width: 180px" />
        <el-button type="primary" @click="showForm = true">
          <el-icon style="margin-right: 4px"><Plus /></el-icon>
          接入数据源
        </el-button>
      </div>
    </div>

    <el-row :gutter="14">
      <el-col :span="6" v-for="ds in filteredSources" :key="ds.id">
        <div class="ds-card">
          <div class="ds-card__header">
            <div class="ds-card__type-badge">
              {{ ds.db_type.toUpperCase().replace('-', ' ') }}
            </div>
            <span
              class="ds-card__status-dot"
              :class="`status-${ds.status}`"
            />
          </div>
          <div class="ds-card__name">{{ ds.name }}</div>
          <div class="ds-card__meta">
            <span class="ds-card__category">{{ DATASOURCE_CATEGORY_LABELS[ds.category] }}</span>
          </div>
          <div class="ds-card__addr">
            {{ ds.host }}:{{ ds.port }}
          </div>
          <div class="ds-card__info" v-if="ds.database_name">
            数据库: {{ ds.database_name }}
          </div>
          <div class="ds-card__info" v-if="ds.topic_count">
            Topic: {{ ds.topic_count }} 个
          </div>
          <div class="ds-card__info" v-if="ds.table_count">
            数据表: {{ ds.table_count }} 张
          </div>
          <div class="ds-card__footer">
            <el-button link type="primary" size="small">编辑</el-button>
            <el-button link type="primary" size="small">测试</el-button>
            <el-button link type="danger" size="small">移除</el-button>
          </div>
        </div>
      </el-col>
    </el-row>

    <DataSourceFormDialog v-model:visible="showForm" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDeviceAccessStore } from '@/stores/deviceAccess'
import { DATASOURCE_CATEGORY_LABELS } from '@/types/deviceAccess'
import DataSourceFormDialog from './DataSourceFormDialog.vue'

const store = useDeviceAccessStore()
const searchText = ref('')
const filterCategory = ref('')
const showForm = ref(false)

const filteredSources = computed(() => {
  let list = store.dataSources
  if (filterCategory.value) {
    list = list.filter(ds => ds.category === filterCategory.value)
  }
  if (searchText.value) {
    const kw = searchText.value.toLowerCase()
    list = list.filter(ds =>
      ds.name.toLowerCase().includes(kw) ||
      ds.db_type.toLowerCase().includes(kw) ||
      ds.host.toLowerCase().includes(kw)
    )
  }
  return list
})
</script>

<style scoped>
.datasource-list-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.list-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.list-actions {
  display: flex;
  gap: 10px;
}

.ds-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color 0.2s;
  margin-bottom: 14px;
}

.ds-card:hover {
  border-color: var(--accent-blue);
}

.ds-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ds-card__type-badge {
  background: rgba(59, 130, 246, 0.15);
  color: var(--accent-blue);
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.ds-card__status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.status-connected {
  background: var(--accent-green);
  box-shadow: 0 0 6px var(--accent-green);
}

.status-disconnected {
  background: var(--text-secondary);
}

.status-testing {
  background: var(--accent-yellow);
  animation: pulse 1s infinite;
}

.status-error {
  background: var(--accent-red);
  box-shadow: 0 0 6px var(--accent-red);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.ds-card__name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.ds-card__meta {
  display: flex;
  align-items: center;
}

.ds-card__category {
  font-size: 11px;
  color: var(--accent-cyan);
}

.ds-card__addr {
  font-size: 11px;
  color: var(--text-secondary);
  font-family: 'Consolas', monospace;
}

.ds-card__info {
  font-size: 11px;
  color: var(--text-secondary);
}

.ds-card__footer {
  display: flex;
  gap: 6px;
  border-top: 1px solid var(--border-color);
  padding-top: 8px;
  margin-top: 4px;
}
</style>
