<template>
  <el-dialog
    :model-value="visible"
    title="接入新数据源"
    width="600px"
    @update:model-value="$emit('update:visible', $event)"
    @close="$emit('update:visible', false)"
  >
    <el-form :model="form" label-width="110px" class="ds-form">
      <el-form-item label="数据源名称" required>
        <el-input v-model="form.name" placeholder="如：生产数据主库" />
      </el-form-item>
      <el-form-item label="数据源编码" required>
        <el-input v-model="form.source_code" placeholder="唯一标识，如 prod-mysql" />
      </el-form-item>
      <el-form-item label="数据源类型" required>
        <el-select v-model="form.db_type" placeholder="选择数据库/中间件类型" style="width: 100%" @change="onDbTypeChange">
          <el-option-group
            v-for="(items, catKey) in groupedDbTypes"
            :key="catKey"
            :label="DATASOURCE_CATEGORY_LABELS[catKey as DataSourceCategory]"
          >
            <el-option
              v-for="item in items"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-option-group>
        </el-select>
      </el-form-item>

      <!-- 数据库/中间件通用连接字段 -->
      <template v-if="form.db_type">
        <el-form-item label="主机地址" required>
          <el-input v-model="form.host" placeholder="IP地址或域名" />
        </el-form-item>
        <el-form-item label="端口" required>
          <el-input-number v-model="form.port" :min="0" :max="65535" />
        </el-form-item>
        <el-form-item label="数据库名" v-if="needsDatabaseName">
          <el-input v-model="form.database_name" placeholder="数据库名称" />
        </el-form-item>
        <el-form-item label="用户名" v-if="needsAuth">
          <el-input v-model="form.username" placeholder="可选" />
        </el-form-item>
        <el-form-item label="密码" v-if="needsAuth">
          <el-input v-model="form.password" type="password" show-password placeholder="可选" />
        </el-form-item>
      </template>

      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="2" placeholder="数据源描述" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button :loading="testing" @click="testConnection">测试连接</el-button>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { DATABASE_TYPES, DATASOURCE_CATEGORY_LABELS } from '@/types/deviceAccess'
import type { DataSourceCategory } from '@/types/deviceAccess'

defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
}>()

const form = ref({
  name: '',
  source_code: '',
  db_type: '',
  host: '',
  port: 3306,
  database_name: '',
  username: '',
  password: '',
  description: '',
})

const testing = ref(false)

const groupedDbTypes = computed(() => {
  const groups: Record<string, typeof DATABASE_TYPES> = {}
  for (const item of DATABASE_TYPES) {
    if (!groups[item.category]) groups[item.category] = []
    groups[item.category].push(item)
  }
  return groups
})

const needsDatabaseName = computed(() => {
  const t = form.value.db_type
  return t && !['kafka', 'rabbitmq', 'rocketmq', 'mqtt-broker', 'http-api', 'sqlite'].includes(t)
})

const needsAuth = computed(() => {
  const t = form.value.db_type
  return t && !['sqlite', 'http-api'].includes(t)
})

function onDbTypeChange(dbType: string) {
  const found = DATABASE_TYPES.find(d => d.value === dbType)
  if (found) {
    form.value.port = found.default_port
  }
}

async function testConnection() {
  testing.value = true
  await new Promise(r => setTimeout(r, 1500))
  testing.value = false
  // TODO: 调用API测试连接
}

function handleSave() {
  console.log('save datasource', form.value)
  emit('update:visible', false)
}
</script>

<style scoped>
.ds-form {
  padding: 8px 0;
}
</style>
