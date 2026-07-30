<template>
  <el-card class="section-card" shadow="never">
    <template #header>
      <div class="card-header">
        <span class="card-title">产品列表</span>
        <div class="card-actions">
          <el-input
            v-model="searchText"
            placeholder="搜索产品名称..."
            prefix-icon="Search"
            clearable
            style="width: 220px"
          />
          <el-button type="primary" @click="showWizard = true">
            <el-icon style="margin-right: 4px"><Plus /></el-icon>
            新建产品
          </el-button>
        </div>
      </div>
    </template>

    <el-table :data="filteredProducts" stripe style="width: 100%">
      <el-table-column prop="product_key" label="产品Key" width="100" />
      <el-table-column prop="name" label="产品名称" min-width="160" />
      <el-table-column prop="device_type" label="设备类型" width="100">
        <template #default="{ row }">
          {{ DEVICE_TYPE_LABELS[row.device_type] || row.device_type }}
        </template>
      </el-table-column>
      <el-table-column prop="protocol" label="通信协议" width="120">
        <template #default="{ row }">
          <el-tag size="small" effect="plain">{{ PROTOCOL_LABELS[row.protocol] || row.protocol }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="device_count" label="设备数" width="80" align="center" />
      <el-table-column prop="online_count" label="在线数" width="80" align="center">
        <template #default="{ row }">
          <span :style="{ color: row.online_count > 0 ? 'var(--accent-green)' : 'var(--text-secondary)' }">
            {{ row.online_count }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <!-- 新建产品弹窗 -->
  <ProductFormDialog v-model:visible="showForm" :product="editingProduct" @saved="onSaved" />

  <!-- 设备接入向导 -->
  <DeviceOnboardingWizard v-model:visible="showWizard" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDeviceAccessStore } from '@/stores/deviceAccess'
import { PROTOCOL_LABELS, DEVICE_TYPE_LABELS } from '@/types/deviceAccess'
import type { Product } from '@/types/deviceAccess'
import ProductFormDialog from './ProductFormDialog.vue'
import DeviceOnboardingWizard from './DeviceOnboardingWizard.vue'

const store = useDeviceAccessStore()
const searchText = ref('')
const showForm = ref(false)
const showWizard = ref(false)
const editingProduct = ref<Product | null>(null)

const filteredProducts = computed(() => {
  if (!searchText.value) return store.products
  const kw = searchText.value.toLowerCase()
  return store.products.filter(p =>
    p.name.toLowerCase().includes(kw) || p.product_key.toLowerCase().includes(kw)
  )
})

function handleEdit(product: Product) {
  editingProduct.value = product
  showForm.value = true
}

function handleDelete(product: Product) {
  // TODO: 对接后端删除接口
  console.log('delete product', product.id)
}

function onSaved() {
  showForm.value = false
  editingProduct.value = null
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
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
