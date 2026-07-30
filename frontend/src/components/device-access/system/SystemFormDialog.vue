<template>
  <el-dialog
    :model-value="visible"
    title="接入新系统"
    width="560px"
    @update:model-value="$emit('update:visible', $event)"
    @close="$emit('update:visible', false)"
  >
    <el-form :model="form" label-width="100px" class="system-form">
      <el-form-item label="系统名称" required>
        <el-input v-model="form.name" placeholder="如：安全生产监控系统" />
      </el-form-item>
      <el-form-item label="系统编码" required>
        <el-input v-model="form.system_code" placeholder="唯一标识，如 safety-monitor" />
      </el-form-item>
      <el-form-item label="接口类型" required>
        <el-select v-model="form.interface_type" placeholder="选择接口类型" style="width: 100%">
          <el-option v-for="(label, key) in INTERFACE_TYPE_LABELS" :key="key" :label="label" :value="key" />
        </el-select>
      </el-form-item>
      <el-form-item label="接入地址" required>
        <el-input v-model="form.endpoint_url" placeholder="如：http://10.0.1.50:8080/api/v2" />
      </el-form-item>
      <el-form-item label="认证方式">
        <el-select v-model="form.auth_type" style="width: 100%">
          <el-option value="none" label="无" />
          <el-option value="basic" label="Basic Auth" />
          <el-option value="bearer" label="Bearer Token" />
          <el-option value="api-key" label="API Key" />
          <el-option value="oauth2" label="OAuth 2.0" />
        </el-select>
      </el-form-item>
      <el-form-item label="数据方向">
        <el-radio-group v-model="form.data_direction">
          <el-radio value="pull">拉取</el-radio>
          <el-radio value="push">推送</el-radio>
          <el-radio value="bidirectional">双向</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="同步间隔">
        <el-input-number v-model="form.sync_interval" :min="0" :step="10" placeholder="秒，0=实时" />
        <span class="form-hint">秒，0或留空表示实时</span>
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="2" placeholder="系统描述" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { INTERFACE_TYPE_LABELS } from '@/types/deviceAccess'
import type { InterfaceType } from '@/types/deviceAccess'

defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
}>()

const form = ref({
  name: '',
  system_code: '',
  interface_type: '' as InterfaceType | '',
  endpoint_url: '',
  auth_type: 'none' as string,
  data_direction: 'pull' as string,
  sync_interval: 30,
  description: '',
})

function handleSave() {
  console.log('save system', form.value)
  emit('update:visible', false)
}
</script>

<style scoped>
.system-form {
  padding: 8px 0;
}

.form-hint {
  color: var(--text-secondary);
  font-size: 12px;
  margin-left: 8px;
}
</style>
