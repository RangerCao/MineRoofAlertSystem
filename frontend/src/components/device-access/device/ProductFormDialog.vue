<template>
  <el-dialog
    :model-value="visible"
    :title="product ? '编辑产品' : '新建产品'"
    width="560px"
    @update:model-value="$emit('update:visible', $event)"
    @close="$emit('update:visible', false)"
  >
    <el-form :model="form" label-width="100px" class="product-form">
      <el-form-item label="产品名称" required>
        <el-input v-model="form.name" placeholder="请输入产品名称" />
      </el-form-item>
      <el-form-item label="设备类型" required>
        <el-select v-model="form.device_type" placeholder="选择设备类型" style="width: 100%">
          <el-option
            v-for="(label, key) in DEVICE_TYPE_LABELS"
            :key="key"
            :label="label"
            :value="key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="通信协议" required>
        <el-select v-model="form.protocol" placeholder="选择通信协议" style="width: 100%">
          <el-option
            v-for="(label, key) in PROTOCOL_LABELS"
            :key="key"
            :label="label"
            :value="key"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="产品描述信息" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { DEVICE_TYPE_LABELS, PROTOCOL_LABELS } from '@/types/deviceAccess'
import type { Product, DeviceType, ProtocolType } from '@/types/deviceAccess'

const props = defineProps<{
  visible: boolean
  product: Product | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'saved'): void
}>()

const form = ref({
  name: '',
  device_type: '' as DeviceType | '',
  protocol: '' as ProtocolType | '',
  description: '',
})

watch(() => props.visible, (val) => {
  if (val && props.product) {
    form.value = {
      name: props.product.name,
      device_type: props.product.device_type,
      protocol: props.product.protocol,
      description: props.product.description || '',
    }
  } else if (val) {
    form.value = { name: '', device_type: '', protocol: '', description: '' }
  }
})

function handleSave() {
  // TODO: 调用API保存
  console.log('save product', form.value)
  emit('saved')
}
</script>

<style scoped>
.product-form {
  padding: 8px 0;
}
</style>
