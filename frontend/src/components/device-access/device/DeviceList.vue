<template>
  <el-card class="section-card" shadow="never">
    <template #header>
      <div class="card-header">
        <span class="card-title">设备列表</span>
        <div class="card-actions">
          <el-select v-model="filterProduct" placeholder="按产品筛选" clearable style="width: 180px">
            <el-option
              v-for="p in store.products"
              :key="p.id"
              :label="p.name"
              :value="p.id"
            />
          </el-select>
          <el-select v-model="filterStatus" placeholder="按状态筛选" clearable style="width: 130px">
            <el-option label="在线" value="online" />
            <el-option label="离线" value="offline" />
            <el-option label="未验证" value="unverified" />
            <el-option label="已禁用" value="disabled" />
          </el-select>
          <el-input
            v-model="searchText"
            placeholder="搜索设备..."
            prefix-icon="Search"
            clearable
            style="width: 200px"
          />
          <el-button type="primary" @click="showAddDevice = true">
            <el-icon style="margin-right: 4px"><Plus /></el-icon>
            添加设备
          </el-button>
        </div>
      </div>
    </template>

    <el-table :data="filteredDevices" stripe style="width: 100%" max-height="400">
      <el-table-column prop="device_code" label="设备编码" width="120" />
      <el-table-column prop="name" label="设备名称" min-width="160" />
      <el-table-column prop="product_name" label="所属产品" min-width="140" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="DEVICE_STATUS_TAG_TYPE[row.status]" size="small" effect="light">
            {{ DEVICE_STATUS_LABELS[row.status] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="ip_address" label="IP地址" width="140" />
      <el-table-column prop="location" label="安装位置" min-width="160" show-overflow-tooltip />
      <el-table-column prop="last_online_at" label="最后在线" width="170">
        <template #default="{ row }">
          {{ row.last_online_at ? formatTime(row.last_online_at) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="primary" size="small" @click="handleTest(row)">测试</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="filteredDevices.length"
        layout="total, prev, pager, next"
        small
      />
    </div>
  </el-card>

  <DeviceFormDialog v-model:visible="showAddDevice" :device="editingDevice" @saved="onSaved" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDeviceAccessStore } from '@/stores/deviceAccess'
import { DEVICE_STATUS_LABELS, DEVICE_STATUS_TAG_TYPE } from '@/types/deviceAccess'
import type { Device } from '@/types/deviceAccess'
import DeviceFormDialog from './DeviceFormDialog.vue'

const store = useDeviceAccessStore()
const searchText = ref('')
const filterProduct = ref<number | null>(null)
const filterStatus = ref('')
const showAddDevice = ref(false)
const editingDevice = ref<Device | null>(null)
const currentPage = ref(1)
const pageSize = 10

const filteredDevices = computed(() => {
  let list = store.devices
  if (filterProduct.value) {
    list = list.filter(d => d.product_id === filterProduct.value)
  }
  if (filterStatus.value) {
    list = list.filter(d => d.status === filterStatus.value)
  }
  if (searchText.value) {
    const kw = searchText.value.toLowerCase()
    list = list.filter(d =>
      d.name.toLowerCase().includes(kw) ||
      d.device_code.toLowerCase().includes(kw) ||
      d.location?.toLowerCase().includes(kw)
    )
  }
  return list
})

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function handleEdit(device: Device) {
  editingDevice.value = device
  showAddDevice.value = true
}

function handleTest(device: Device) {
  ElMessage.info(`正在测试设备 ${device.name} 的连接...`)
  setTimeout(() => {
    const success = Math.random() > 0.3
    if (success) {
      device.status = 'online'
      device.last_online_at = new Date().toISOString()
      ElMessage.success(`${device.name} 连接成功`)
    } else {
      ElMessage.error(`${device.name} 连接失败，请检查网络配置`)
    }
  }, 1500)
}

function handleDelete(device: Device) {
  ElMessageBox.confirm(`确定要删除设备「${device.name}」吗？`, '确认删除', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    const idx = store.devices.findIndex(d => d.id === device.id)
    if (idx !== -1) store.devices.splice(idx, 1)
    ElMessage.success('设备已删除')
  }).catch(() => {})
}

function onSaved() {
  showAddDevice.value = false
  editingDevice.value = null
}
</script>

<style scoped>
.section-card {
  background: var(--bg-card);
  border-color: var(--border-color);
}

.section-card :deep(.el-card__header) {
  border-bottom-color: var(--border-color);
  padding: 12px 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>
