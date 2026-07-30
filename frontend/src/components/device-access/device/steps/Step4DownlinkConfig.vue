<template>
  <div class="step-form">
    <div class="step-header">
      <span class="step-desc">定义下发给设备的控制命令</span>
      <el-button type="primary" size="small" @click="addCommand">
        <el-icon style="margin-right: 4px"><Plus /></el-icon>
        添加命令
      </el-button>
    </div>

    <el-table :data="model" stripe style="width: 100%" v-if="model.length > 0">
      <el-table-column label="标识符" width="150">
        <template #default="{ row }">
          <el-input v-model="row.identifier" size="small" placeholder="如 set_sample_rate" />
        </template>
      </el-table-column>
      <el-table-column label="命令名称" width="150">
        <template #default="{ row }">
          <el-input v-model="row.name" size="small" placeholder="如 设置采样频率" />
        </template>
      </el-table-column>
      <el-table-column label="描述" min-width="200">
        <template #default="{ row }">
          <el-input v-model="row.description" size="small" placeholder="命令说明" />
        </template>
      </el-table-column>
      <el-table-column label="输入参数" width="100" align="center">
        <template #default="{ row }">
          <el-tag size="small" effect="plain">{{ row.input_params.length }} 个</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="center">
        <template #default="{ row, $index }">
          <el-button link type="primary" size="small" @click="editParams(row)">参数</el-button>
          <el-button link type="danger" size="small" @click="model.splice($index, 1)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-else description="暂无下行命令，点击上方按钮添加" :image-size="80" />

    <!-- 参数编辑弹窗 -->
    <el-dialog v-model="showParamDialog" title="编辑命令参数" width="600px" append-to-body>
      <div class="param-header">
        <span>输入参数列表</span>
        <el-button type="primary" size="small" @click="addParam">添加参数</el-button>
      </div>
      <el-table :data="editingCommand?.input_params || []" stripe size="small" style="width: 100%">
        <el-table-column label="标识符" width="120">
          <template #default="{ row }">
            <el-input v-model="row.identifier" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="名称" width="100">
          <template #default="{ row }">
            <el-input v-model="row.name" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="类型" width="110">
          <template #default="{ row }">
            <el-select v-model="row.data_type" size="small">
              <el-option v-for="(l, k) in DATA_TYPE_LABELS" :key="k" :label="l" :value="k" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="单位" width="80">
          <template #default="{ row }">
            <el-input v-model="row.unit" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="60">
          <template #default="{ $index }">
            <el-button link type="danger" size="small" @click="editingCommand?.input_params.splice($index, 1)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DATA_TYPE_LABELS } from '@/types/deviceAccess'
import type { CommandDefinition, PropertyDefinition } from '@/types/deviceAccess'

const model = defineModel<CommandDefinition[]>()
const showParamDialog = ref(false)
const editingCommand = ref<CommandDefinition | null>(null)

function addCommand() {
  model.value.push({
    id: `cmd_${Date.now()}`,
    identifier: '',
    name: '',
    description: null,
    input_params: [],
    output_params: [],
  })
}

function editParams(cmd: CommandDefinition) {
  editingCommand.value = cmd
  showParamDialog.value = true
}

function addParam() {
  editingCommand.value?.input_params.push({
    id: `param_${Date.now()}`,
    identifier: '',
    name: '',
    data_type: 'int',
    unit: null,
    min_value: null,
    max_value: null,
    step: null,
    description: null,
  })
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

.param-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  color: var(--text-primary);
}
</style>
