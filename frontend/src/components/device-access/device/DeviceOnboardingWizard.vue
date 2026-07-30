<template>
  <el-dialog
    :model-value="visible"
    title="设备接入向导"
    width="820px"
    :close-on-click-modal="false"
    @update:model-value="$emit('update:visible', $event)"
    @close="$emit('update:visible', false)"
  >
    <el-steps :active="currentStep" finish-status="success" class="wizard-steps">
      <el-step title="基本信息" />
      <el-step title="协议配置" />
      <el-step title="上行属性" />
      <el-step title="下行命令" />
      <el-step title="设备注册" />
    </el-steps>

    <div class="wizard-body">
      <Step1BasicInfo v-if="currentStep === 0" v-model="step1Data" />
      <Step2ProtocolConfig v-if="currentStep === 1" v-model="step2Data" :protocol="step1Data.protocol" />
      <Step3UplinkConfig v-if="currentStep === 2" v-model="step3Data" />
      <Step4DownlinkConfig v-if="currentStep === 3" v-model="step4Data" />
      <Step5DeviceReg v-if="currentStep === 4" :product-name="step1Data.name" />
    </div>

    <template #footer>
      <div class="wizard-footer">
        <el-button v-if="currentStep > 0" @click="currentStep--">上一步</el-button>
        <el-button v-if="currentStep < 4" type="primary" @click="currentStep++">下一步</el-button>
        <el-button v-if="currentStep === 4" type="success" @click="handleFinish">完成接入</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { ProtocolType, PropertyDefinition, CommandDefinition } from '@/types/deviceAccess'
import Step1BasicInfo from './steps/Step1BasicInfo.vue'
import Step2ProtocolConfig from './steps/Step2ProtocolConfig.vue'
import Step3UplinkConfig from './steps/Step3UplinkConfig.vue'
import Step4DownlinkConfig from './steps/Step4DownlinkConfig.vue'
import Step5DeviceReg from './steps/Step5DeviceReg.vue'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
}>()

const currentStep = ref(0)

const step1Data = reactive({
  name: '',
  device_type: '' as string,
  protocol: '' as ProtocolType | '',
  description: '',
})

const step2Data = reactive<Record<string, any>>({})
const step3Data = ref<PropertyDefinition[]>([])
const step4Data = ref<CommandDefinition[]>([])

function handleFinish() {
  // TODO: 调用API完成设备接入
  console.log('wizard finish', { step1Data, step2Data, step3Data, step4Data })
  currentStep.value = 0
  emit('update:visible', false)
}
</script>

<style scoped>
.wizard-steps {
  margin-bottom: 24px;
}

.wizard-body {
  min-height: 320px;
  padding: 0 8px;
}

.wizard-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style>
