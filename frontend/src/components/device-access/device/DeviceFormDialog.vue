<template>
  <el-dialog
    :model-value="visible"
    :title="device ? '编辑设备' : '添加设备'"
    width="560px"
    @update:model-value="$emit('update:visible', $event)"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px" size="default">
      <el-form-item label="所属产品" prop="product_id">
        <el-select v-model="form.product_id" placeholder="选择产品" style="width: 100%">
          <el-option v-for="p in store.products" :key="p.id" :label="p.name" :value="p.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="设备名称" prop="name">
        <el-input v-model="form.name" placeholder="输入设备名称" />
      </el-form-item>
      <el-form-item label="设备编码" prop="device_code">
        <el-input v-model="form.device_code" placeholder="输入唯一编码，如 DEV-001" />
      </el-form-item>
      <el-form-item label="安装位置" prop="location">
        <el-input v-model="form.location" placeholder="如：1201工作面-巷口" />
      </el-form-item>
      <el-form-item label="IP地址" prop="ip_address">
        <el-input v-model="form.ip_address" placeholder="如：192.168.1.100" />
      </el-form-item>
      <el-form-item label="固件版本">
        <el-input v-model="form.firmware_version" placeholder="如：v1.2.3" />
      </el-form-item>
      <el-form-item label="矿区">
        <el-input v-model="form.mine_area" placeholder="如：一矿-东区" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useDeviceAccessStore } from '@/stores/deviceAccess'
import type { Device } from '@/types/deviceAccess'
import type { FormInstance, FormRules } from 'element-plus'

const props = defineProps<{
  visible: boolean
  device?: Device | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  saved: []
}>()

const store = useDeviceAccessStore()
const formRef = ref<FormInstance>()

const defaultForm = {
  product_id: null as number | null,
  name: '',
  device_code: '',
  location: '',
  ip_address: '',
  firmware_version: '',
  mine_area: '',
}

const form = reactive({ ...defaultForm })

const rules: FormRules = {
  product_id: [{ required: true, message: '请选择产品', trigger: 'change' }],
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  device_code: [{ required: true, message: '请输入设备编码', trigger: 'blur' }],
}

watch(() => props.visible, (val) => {
  if (val && props.device) {
    Object.assign(form, {
      product_id: props.device.product_id,
      name: props.device.name,
      device_code: props.device.device_code,
      location: props.device.location || '',
      ip_address: props.device.ip_address || '',
      firmware_version: props.device.firmware_version || '',
      mine_area: props.device.mine_area || '',
    })
  } else if (val) {
    Object.assign(form, { ...defaultForm })
  }
})

function handleSave() {
  formRef.value?.validate().then((valid) => {
    if (!valid) return
    const productName = store.products.find(p => p.id === form.product_id)?.name || ''
    const now = new Date().toISOString()

    if (props.device) {
      // 编辑模式
      Object.assign(props.device, {
        product_id: form.product_id,
        product_name: productName,
        name: form.name,
        device_code: form.device_code,
        location: form.location || null,
        ip_address: form.ip_address || null,
        firmware_version: form.firmware_version || null,
        mine_area: form.mine_area || null,
        updated_at: now,
      })
    } else {
      // 新建模式
      const newDevice: Device = {
        id: Date.now(),
        device_key: `DK${String(Date.now()).slice(-6)}`,
        product_id: form.product_id!,
        product_name: productName,
        name: form.name,
        device_code: form.device_code,
        status: 'unverified',
        firmware_version: form.firmware_version || null,
        ip_address: form.ip_address || null,
        last_online_at: null,
        location: form.location || null,
        mine_area: form.mine_area || null,
        metadata: {},
        created_at: now,
        updated_at: now,
      }
      store.devices.push(newDevice)
    }
    emit('saved')
    emit('update:visible', false)
  })
}

function handleClose() {
  formRef.value?.resetFields()
}
</script>
