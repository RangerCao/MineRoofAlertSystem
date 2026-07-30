<template>
  <div class="device-access-view">
    <!-- 统计面板 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :span="6">
        <div class="data-panel">
          <div class="data-panel__title">接入产品</div>
          <div class="data-panel__value">{{ store.products.length }}</div>
          <div class="data-panel__sub">覆盖 {{ protocolCount }} 种协议</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="data-panel">
          <div class="data-panel__title">接入设备</div>
          <div class="data-panel__value">{{ store.devices.length }}</div>
          <div class="data-panel__sub">
            <span class="online-text">在线 {{ store.deviceOnlineCount }}</span>
            <span class="offline-text"> / 离线 {{ store.deviceOfflineCount }}</span>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="data-panel">
          <div class="data-panel__title">系统接入</div>
          <div class="data-panel__value">{{ store.systems.length }}</div>
          <div class="data-panel__sub">
            <span class="online-text">已连接 {{ store.systemConnectedCount }}</span>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="data-panel">
          <div class="data-panel__title">数据源接入</div>
          <div class="data-panel__value">{{ store.dataSources.length }}</div>
          <div class="data-panel__sub">
            <span class="online-text">已连接 {{ store.datasourceConnectedCount }}</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" class="access-tabs">
      <el-tab-pane label="设备接入" name="device">
        <div class="tab-content">
          <ProductList />
          <DeviceList />
        </div>
      </el-tab-pane>
      <el-tab-pane label="系统接入" name="system">
        <div class="tab-content">
          <SystemList />
        </div>
      </el-tab-pane>
      <el-tab-pane label="数据源接入" name="datasource">
        <div class="tab-content">
          <DataSourceList />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDeviceAccessStore } from '@/stores/deviceAccess'
import ProductList from '@/components/device-access/device/ProductList.vue'
import DeviceList from '@/components/device-access/device/DeviceList.vue'
import SystemList from '@/components/device-access/system/SystemList.vue'
import DataSourceList from '@/components/device-access/datasource/DataSourceList.vue'

const store = useDeviceAccessStore()
const activeTab = ref('device')

const protocolCount = computed(() => {
  const set = new Set(store.products.map(p => p.protocol))
  return set.size
})

onMounted(() => {
  store.loadMockData()
})
</script>

<style scoped>
.device-access-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-row {
  margin-bottom: 0;
}

.data-panel__sub {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.online-text {
  color: var(--accent-green);
}

.offline-text {
  color: var(--accent-red);
}

.access-tabs {
  background: var(--bg-card);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  padding: 0 16px 16px;
}

.access-tabs :deep(.el-tabs__header) {
  margin-bottom: 16px;
}

.access-tabs :deep(.el-tabs__item) {
  color: var(--text-secondary);
  font-size: 15px;
  font-weight: 500;
}

.access-tabs :deep(.el-tabs__item.is-active) {
  color: var(--accent-blue);
}

.access-tabs :deep(.el-tabs__active-bar) {
  background-color: var(--accent-blue);
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
