<template>
  <div class="step-form">
    <el-form label-width="100px">
      <el-form-item label="所属产品">
        <el-input :model-value="productName" disabled />
      </el-form-item>
      <el-form-item label="设备编码" required>
        <el-input v-model="deviceCode" placeholder="输入设备物理编码/序列号" />
      </el-form-item>
      <el-form-item label="设备名称">
        <el-input v-model="deviceName" placeholder="可选，留空自动生成" />
      </el-form-item>
      <el-form-item label="安装位置">
        <el-input v-model="location" placeholder="如：一采区3号工作面" />
      </el-form-item>
      <el-form-item label="Device Key">
        <el-input :model-value="generatedKey" disabled>
          <template #append>
            <el-button @click="regenerateKey">刷新</el-button>
          </template>
        </el-input>
      </el-form-item>
    </el-form>

    <div class="test-section">
      <el-divider />
      <div class="test-row">
        <el-button type="primary" :loading="testing" @click="testConnection">
          测试连接
        </el-button>
        <span v-if="testResult !== null" :class="['test-result', testResult ? 'success' : 'fail']">
          {{ testResult ? '连接成功！延迟 12ms' : '连接失败，请检查配置' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{ productName: string }>()

const deviceCode = ref('')
const deviceName = ref('')
const location = ref('')
const testing = ref(false)
const testResult = ref<boolean | null>(null)

const generatedKey = computed(() => {
  const prefix = 'DK'
  const rand = Math.random().toString(36).substring(2, 10).toUpperCase()
  return `${prefix}${rand}`
})

function regenerateKey() {
  // Force re-compute by triggering a reactive change
  deviceCode.value = deviceCode.value
}

async function testConnection() {
  testing.value = true
  testResult.value = null
  // 模拟测试
  await new Promise(r => setTimeout(r, 1500))
  testResult.value = Math.random() > 0.3
  testing.value = false
}
</script>

<style scoped>
.step-form {
  max-width: 500px;
  margin: 0 auto;
}

.test-section {
  margin-top: 16px;
}

.test-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.test-result {
  font-size: 13px;
  font-weight: 500;
}

.test-result.success {
  color: var(--accent-green);
}

.test-result.fail {
  color: var(--accent-red);
}
</style>
