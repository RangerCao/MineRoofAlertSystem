<template>
  <div class="step-form">
    <div v-if="!protocol" class="empty-tip">请先在第一步选择通信协议</div>

    <!-- MQTT -->
    <el-form v-if="protocol === 'mqtt'" :model="model" label-width="120px">
      <el-form-item label="Broker地址">
        <el-input v-model="model.broker_host" placeholder="如：192.168.1.100" />
      </el-form-item>
      <el-form-item label="Broker端口">
        <el-input-number v-model="model.broker_port" :min="1" :max="65535" />
      </el-form-item>
      <el-form-item label="Client ID">
        <el-input v-model="model.client_id" placeholder="留空自动生成" />
      </el-form-item>
      <el-form-item label="Topic前缀">
        <el-input v-model="model.topic_prefix" placeholder="如：mine/roof" />
      </el-form-item>
      <el-form-item label="QoS等级">
        <el-select v-model="model.qos" style="width: 100%">
          <el-option :value="0" label="QoS 0 - 最多一次" />
          <el-option :value="1" label="QoS 1 - 至少一次" />
          <el-option :value="2" label="QoS 2 - 恰好一次" />
        </el-select>
      </el-form-item>
      <el-form-item label="用户名">
        <el-input v-model="model.username" placeholder="可选" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="model.password" type="password" show-password placeholder="可选" />
      </el-form-item>
    </el-form>

    <!-- Modbus-TCP -->
    <el-form v-else-if="protocol === 'modbus-tcp'" :model="model" label-width="120px">
      <el-form-item label="从机地址">
        <el-input v-model="model.host" placeholder="如：192.168.1.10" />
      </el-form-item>
      <el-form-item label="端口">
        <el-input-number v-model="model.port" :min="1" :max="65535" />
      </el-form-item>
      <el-form-item label="单元ID">
        <el-input-number v-model="model.unit_id" :min="1" :max="247" />
      </el-form-item>
      <el-form-item label="超时(ms)">
        <el-input-number v-model="model.timeout_ms" :min="100" :max="30000" :step="100" />
      </el-form-item>
      <el-form-item label="轮询间隔(ms)">
        <el-input-number v-model="model.poll_interval_ms" :min="100" :max="60000" :step="100" />
      </el-form-item>
    </el-form>

    <!-- Modbus-RTU -->
    <el-form v-else-if="protocol === 'modbus-rtu'" :model="model" label-width="120px">
      <el-form-item label="串口">
        <el-input v-model="model.serial_port" placeholder="如：/dev/ttyS0" />
      </el-form-item>
      <el-form-item label="波特率">
        <el-select v-model="model.baud_rate" style="width: 100%">
          <el-option :value="9600" label="9600" />
          <el-option :value="19200" label="19200" />
          <el-option :value="38400" label="38400" />
          <el-option :value="57600" label="57600" />
          <el-option :value="115200" label="115200" />
        </el-select>
      </el-form-item>
      <el-form-item label="数据位">
        <el-select v-model="model.data_bits" style="width: 100%">
          <el-option :value="7" label="7" />
          <el-option :value="8" label="8" />
        </el-select>
      </el-form-item>
      <el-form-item label="停止位">
        <el-select v-model="model.stop_bits" style="width: 100%">
          <el-option :value="1" label="1" />
          <el-option :value="2" label="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="校验位">
        <el-select v-model="model.parity" style="width: 100%">
          <el-option value="none" label="无" />
          <el-option value="even" label="偶校验" />
          <el-option value="odd" label="奇校验" />
        </el-select>
      </el-form-item>
      <el-form-item label="从机地址">
        <el-input-number v-model="model.slave_address" :min="1" :max="247" />
      </el-form-item>
    </el-form>

    <!-- OPC-UA -->
    <el-form v-else-if="protocol === 'opc-ua'" :model="model" label-width="120px">
      <el-form-item label="端点URL">
        <el-input v-model="model.endpoint_url" placeholder="opc.tcp://host:4840/path" />
      </el-form-item>
      <el-form-item label="安全策略">
        <el-select v-model="model.security_policy" style="width: 100%">
          <el-option value="None" label="无" />
          <el-option value="Basic256" label="Basic256" />
          <el-option value="Basic256Sha256" label="Basic256Sha256" />
        </el-select>
      </el-form-item>
      <el-form-item label="认证模式">
        <el-select v-model="model.auth_mode" style="width: 100%">
          <el-option value="Anonymous" label="匿名" />
          <el-option value="UserName" label="用户名密码" />
          <el-option value="Certificate" label="证书" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="model.auth_mode === 'UserName'" label="用户名">
        <el-input v-model="model.username" />
      </el-form-item>
      <el-form-item v-if="model.auth_mode === 'UserName'" label="密码">
        <el-input v-model="model.password" type="password" show-password />
      </el-form-item>
    </el-form>

    <!-- HTTP / WebSocket -->
    <el-form v-else-if="protocol === 'http' || protocol === 'websocket'" :model="model" label-width="120px">
      <el-form-item label="基础URL">
        <el-input v-model="model.base_url" :placeholder="protocol === 'http' ? 'http://host:port/api' : 'ws://host:port/ws'" />
      </el-form-item>
      <el-form-item label="认证方式">
        <el-select v-model="model.auth_type" style="width: 100%">
          <el-option value="none" label="无" />
          <el-option value="basic" label="Basic Auth" />
          <el-option value="bearer" label="Bearer Token" />
          <el-option value="api-key" label="API Key" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="model.auth_type === 'basic'" label="用户名">
        <el-input v-model="model.username" />
      </el-form-item>
      <el-form-item v-if="model.auth_type === 'basic'" label="密码">
        <el-input v-model="model.password" type="password" show-password />
      </el-form-item>
      <el-form-item v-if="model.auth_type === 'bearer' || model.auth_type === 'api-key'" label="Token/Key">
        <el-input v-model="model.token" />
      </el-form-item>
      <el-form-item label="超时(ms)">
        <el-input-number v-model="model.timeout" :min="1000" :max="60000" :step="1000" />
      </el-form-item>
    </el-form>

    <!-- 其他协议通用 -->
    <el-form v-else :model="model" label-width="120px">
      <el-form-item label="主机地址">
        <el-input v-model="model.host" placeholder="IP地址或域名" />
      </el-form-item>
      <el-form-item label="端口">
        <el-input-number v-model="model.port" :min="1" :max="65535" />
      </el-form-item>
      <el-form-item label="编码格式">
        <el-select v-model="model.encoding" style="width: 100%">
          <el-option value="ascii" label="ASCII" />
          <el-option value="hex" label="HEX" />
          <el-option value="base64" label="Base64" />
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import type { ProtocolType } from '@/types/deviceAccess'

defineProps<{
  protocol: ProtocolType | string
}>()

const model = defineModel<Record<string, any>>()
</script>

<style scoped>
.step-form {
  max-width: 500px;
  margin: 0 auto;
}

.empty-tip {
  text-align: center;
  color: var(--text-secondary);
  padding: 60px 0;
  font-size: 14px;
}
</style>
