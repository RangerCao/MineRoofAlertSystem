<template>
  <div class="step-form">
    <el-form :model="model" label-width="100px">
      <el-form-item label="产品名称" required>
        <el-input v-model="model.name" placeholder="如：顶板压力传感器" />
      </el-form-item>
      <el-form-item label="设备类型" required>
        <el-select v-model="model.device_type" placeholder="选择设备类型" style="width: 100%">
          <el-option v-for="(label, key) in DEVICE_TYPE_LABELS" :key="key" :label="label" :value="key" />
        </el-select>
      </el-form-item>
      <el-form-item label="通信协议" required>
        <el-select v-model="model.protocol" placeholder="选择通信协议" style="width: 100%">
          <el-option v-for="(label, key) in PROTOCOL_LABELS" :key="key" :label="label" :value="key" />
        </el-select>
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="model.description" type="textarea" :rows="3" placeholder="产品功能描述" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { DEVICE_TYPE_LABELS, PROTOCOL_LABELS } from '@/types/deviceAccess'

const model = defineModel<{
  name: string
  device_type: string
  protocol: string
  description: string
}>()
</script>

<style scoped>
.step-form {
  max-width: 500px;
  margin: 0 auto;
}
</style>
