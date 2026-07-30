<template>
  <div class="step-form">
    <div class="step-header">
      <span class="step-desc">定义设备上报的数据属性（如温度、压力、位移等）</span>
      <el-button type="primary" size="small" @click="addProperty">
        <el-icon style="margin-right: 4px"><Plus /></el-icon>
        添加属性
      </el-button>
    </div>

    <el-table :data="model" stripe style="width: 100%" v-if="model.length > 0">
      <el-table-column label="标识符" width="130">
        <template #default="{ row }">
          <el-input v-model="row.identifier" size="small" placeholder="如 temperature" />
        </template>
      </el-table-column>
      <el-table-column label="名称" width="120">
        <template #default="{ row }">
          <el-input v-model="row.name" size="small" placeholder="如 温度" />
        </template>
      </el-table-column>
      <el-table-column label="数据类型" width="130">
        <template #default="{ row }">
          <el-select v-model="row.data_type" size="small" style="width: 100%">
            <el-option v-for="(label, key) in DATA_TYPE_LABELS" :key="key" :label="label" :value="key" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="单位" width="90">
        <template #default="{ row }">
          <el-input v-model="row.unit" size="small" placeholder="MPa" />
        </template>
      </el-table-column>
      <el-table-column label="最小值" width="100">
        <template #default="{ row }">
          <el-input-number v-model="row.min_value" size="small" :controls="false" style="width: 100%" />
        </template>
      </el-table-column>
      <el-table-column label="最大值" width="100">
        <template #default="{ row }">
          <el-input-number v-model="row.max_value" size="small" :controls="false" style="width: 100%" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="60" align="center">
        <template #default="{ $index }">
          <el-button link type="danger" size="small" @click="removeProperty($index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-else description="暂无上行属性，点击上方按钮添加" :image-size="80" />
  </div>
</template>

<script setup lang="ts">
import { DATA_TYPE_LABELS } from '@/types/deviceAccess'
import type { PropertyDefinition } from '@/types/deviceAccess'

const model = defineModel<PropertyDefinition[]>()

function addProperty() {
  model.value.push({
    id: `prop_${Date.now()}`,
    identifier: '',
    name: '',
    data_type: 'float',
    unit: null,
    min_value: null,
    max_value: null,
    step: null,
    description: null,
  })
}

function removeProperty(index: number) {
  model.value.splice(index, 1)
}
</script>

<style scoped>
.step-form {
  width: 100%;
}

.step-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.step-desc {
  color: var(--text-secondary);
  font-size: 13px;
}
</style>
