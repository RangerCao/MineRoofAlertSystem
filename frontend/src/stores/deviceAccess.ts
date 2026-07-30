import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Product, Device, SystemIntegration, DataSource,
  DeviceAccessStatistics, DeviceStatus, SystemStatus, DataSourceStatus
} from '@/types/deviceAccess'

// ─── Mock 数据 ───
function createMockProducts(): Product[] {
  return [
    {
      id: 1, product_key: 'PK0001', name: '顶板压力传感器', device_type: 'sensor',
      protocol: 'mqtt', protocol_config: { topic_prefix: 'mine/roof/pressure', qos: 1 },
      description: '矿用本安型顶板压力传感器，量程0-60MPa', uplink_properties: [
        { id: 'p1', identifier: 'pressure', name: '压力值', data_type: 'float', unit: 'MPa', min_value: 0, max_value: 60, step: 0.1, description: null },
        { id: 'p2', identifier: 'temperature', name: '温度', data_type: 'float', unit: '°C', min_value: -20, max_value: 80, step: 0.5, description: null },
      ], downlink_commands: [
        { id: 'c1', identifier: 'set_sample_rate', name: '设置采样频率', description: '调整传感器采样间隔', input_params: [
          { id: 'cp1', identifier: 'interval', name: '采样间隔', data_type: 'int', unit: '秒', min_value: 1, max_value: 3600, step: 1, description: null }
        ], output_params: [] }
      ], device_count: 48, online_count: 45, created_at: '2026-06-01T08:00:00Z', updated_at: '2026-07-20T10:30:00Z',
    },
    {
      id: 2, product_key: 'PK0002', name: '矿用网关MGW-200', device_type: 'gateway',
      protocol: 'mqtt', protocol_config: { topic_prefix: 'gateway', qos: 2 },
      description: '井下数据采集网关，支持多协议转换', uplink_properties: [
        { id: 'p3', identifier: 'cpu_usage', name: 'CPU使用率', data_type: 'float', unit: '%', min_value: 0, max_value: 100, step: 0.1, description: null },
        { id: 'p4', identifier: 'memory_usage', name: '内存使用率', data_type: 'float', unit: '%', min_value: 0, max_value: 100, step: 0.1, description: null },
      ], downlink_commands: [], device_count: 12, online_count: 12, created_at: '2026-06-05T08:00:00Z', updated_at: '2026-07-18T14:00:00Z',
    },
    {
      id: 3, product_key: 'PK0003', name: '顶板离层仪', device_type: 'sensor',
      protocol: 'modbus-tcp', protocol_config: { unit_id: 1, poll_interval_ms: 5000 },
      description: '监测顶板各层间位移量', uplink_properties: [
        { id: 'p5', identifier: 'displacement_1', name: '离层量1', data_type: 'float', unit: 'mm', min_value: 0, max_value: 500, step: 0.01, description: '浅基点离层' },
        { id: 'p6', identifier: 'displacement_2', name: '离层量2', data_type: 'float', unit: 'mm', min_value: 0, max_value: 500, step: 0.01, description: '深基点离层' },
      ], downlink_commands: [], device_count: 36, online_count: 33, created_at: '2026-06-10T08:00:00Z', updated_at: '2026-07-19T09:00:00Z',
    },
    {
      id: 4, product_key: 'PK0004', name: '液压支架控制器', device_type: 'controller',
      protocol: 'opc-ua', protocol_config: { endpoint_url: 'opc.tcp://192.168.1.100:4840' },
      description: '综采工作面液压支架电液控制系统', uplink_properties: [
        { id: 'p7', identifier: 'support_pressure', name: '立柱压力', data_type: 'float', unit: 'MPa', min_value: 0, max_value: 80, step: 0.1, description: null },
        { id: 'p8', identifier: 'push_distance', name: '推溜行程', data_type: 'float', unit: 'mm', min_value: 0, max_value: 1000, step: 1, description: null },
      ], downlink_commands: [
        { id: 'c2', identifier: 'set_support_mode', name: '设置支护模式', description: null, input_params: [
          { id: 'cp2', identifier: 'mode', name: '模式', data_type: 'enum', unit: null, min_value: null, max_value: null, step: null, description: '1=单柱 2=双柱 3=四柱' }
        ], output_params: [] }
      ], device_count: 120, online_count: 118, created_at: '2026-06-15T08:00:00Z', updated_at: '2026-07-22T16:00:00Z',
    },
    {
      id: 5, product_key: 'PK0005', name: '矿用摄像头', device_type: 'camera',
      protocol: 'http', protocol_config: { base_url: 'http://192.168.10.x/api' },
      description: '井下防爆高清网络摄像头', uplink_properties: [
        { id: 'p9', identifier: 'stream_status', name: '视频流状态', data_type: 'string', unit: null, min_value: null, max_value: null, step: null, description: null },
      ], downlink_commands: [
        { id: 'c3', identifier: 'capture', name: '抓拍', description: '获取当前帧截图', input_params: [], output_params: [
          { id: 'cp3', identifier: 'image_url', name: '图片地址', data_type: 'string', unit: null, min_value: null, max_value: null, step: null, description: null }
        ] }
      ], device_count: 24, online_count: 22, created_at: '2026-06-20T08:00:00Z', updated_at: '2026-07-21T11:00:00Z',
    },
    {
      id: 6, product_key: 'PK0006', name: '瓦斯传感器', device_type: 'sensor',
      protocol: 'modbus-rtu', protocol_config: { baud_rate: 9600, slave_address: 1 },
      description: '催化燃烧式甲烷传感器', uplink_properties: [
        { id: 'p10', identifier: 'ch4_concentration', name: '甲烷浓度', data_type: 'float', unit: '%CH4', min_value: 0, max_value: 100, step: 0.01, description: null },
      ], downlink_commands: [], device_count: 16, online_count: 0, created_at: '2026-07-01T08:00:00Z', updated_at: '2026-07-15T08:00:00Z',
    },
  ]
}

function createMockDevices(): Device[] {
  const areas = ['一采区', '二采区', '三采区', '四采区']
  const statuses: DeviceStatus[] = ['online', 'online', 'online', 'online', 'offline', 'unverified']
  const devices: Device[] = []
  let id = 1
  const products = [
    { pid: 1, name: '顶板压力传感器', prefix: 'YLS', count: 8 },
    { pid: 2, name: '矿用网关MGW-200', prefix: 'GW', count: 4 },
    { pid: 3, name: '顶板离层仪', prefix: 'LCY', count: 6 },
    { pid: 4, name: '液压支架控制器', prefix: 'ZJ', count: 10 },
    { pid: 5, name: '矿用摄像头', prefix: 'CAM', count: 4 },
    { pid: 6, name: '瓦斯传感器', prefix: 'WS', count: 3 },
  ]
  for (const p of products) {
    for (let i = 1; i <= p.count; i++) {
      const status = p.pid === 6 ? 'offline' : statuses[Math.floor(Math.random() * statuses.length)]
      devices.push({
        id: id++,
        device_key: `DK${String(id).padStart(5, '0')}`,
        product_id: p.pid,
        product_name: p.name,
        name: `${p.name}-${String(i).padStart(3, '0')}`,
        device_code: `${p.prefix}-${String(i).padStart(3, '0')}`,
        status,
        firmware_version: `v${1 + Math.floor(Math.random() * 3)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 20)}`,
        ip_address: `192.168.${Math.floor(Math.random() * 10)}.${100 + i}`,
        last_online_at: status === 'online' ? '2026-07-24T10:30:00Z' : '2026-07-23T08:00:00Z',
        location: `${areas[Math.floor(Math.random() * areas.length)]} ${Math.floor(Math.random() * 5) + 1}号工作面`,
        mine_area: areas[Math.floor(Math.random() * areas.length)],
        metadata: {},
        created_at: '2026-06-15T08:00:00Z',
        updated_at: '2026-07-24T10:30:00Z',
      })
    }
  }
  return devices
}

function createMockSystems(): SystemIntegration[] {
  return [
    {
      id: 1, name: '安全生产监控系统', system_code: 'safety-monitor',
      interface_type: 'rest-api', endpoint_url: 'http://10.0.1.50:8080/api/v2',
      auth_type: 'bearer', auth_config: {}, status: 'connected',
      sync_interval: 30, data_direction: 'pull', description: '矿井安全综合监控平台，采集瓦斯/风速/温度等环境参数',
      last_sync_at: '2026-07-24T10:29:30Z', api_count: 12, created_at: '2026-06-01T08:00:00Z', updated_at: '2026-07-24T10:29:30Z',
    },
    {
      id: 2, name: '人员定位系统', system_code: 'personnel-location',
      interface_type: 'websocket', endpoint_url: 'ws://10.0.1.60:9090/ws',
      auth_type: 'api-key', auth_config: {}, status: 'connected',
      sync_interval: null, data_direction: 'push', description: 'UWB精确定位系统，实时获取井下人员位置坐标',
      last_sync_at: '2026-07-24T10:30:00Z', api_count: 4, created_at: '2026-06-05T08:00:00Z', updated_at: '2026-07-24T10:30:00Z',
    },
    {
      id: 3, name: '视频AI分析平台', system_code: 'video-ai',
      interface_type: 'grpc', endpoint_url: '10.0.1.80:50051',
      auth_type: 'none', auth_config: {}, status: 'syncing',
      sync_interval: 5, data_direction: 'bidirectional', description: '基于深度学习的视频智能分析，识别违规行为和设备异常',
      last_sync_at: '2026-07-24T10:28:00Z', api_count: 6, created_at: '2026-06-10T08:00:00Z', updated_at: '2026-07-24T10:28:00Z',
    },
    {
      id: 4, name: '地质测量数据平台', system_code: 'geo-survey',
      interface_type: 'rest-api', endpoint_url: 'http://10.0.2.10:3000/api',
      auth_type: 'basic', auth_config: {}, status: 'disconnected',
      sync_interval: 3600, data_direction: 'pull', description: '地质勘探与测量数据管理系统，提供煤层厚度/断层等地质信息',
      last_sync_at: '2026-07-23T12:00:00Z', api_count: 8, created_at: '2026-06-15T08:00:00Z', updated_at: '2026-07-23T12:00:00Z',
    },
    {
      id: 5, name: '供电管理系统', system_code: 'power-management',
      interface_type: 'modbus-tcp', endpoint_url: '10.0.1.90:502',
      auth_type: 'none', auth_config: {}, status: 'connected',
      sync_interval: 10, data_direction: 'pull', description: '井下供电网络监控，实时采集电压/电流/功率因数',
      last_sync_at: '2026-07-24T10:29:50Z', api_count: 3, created_at: '2026-06-20T08:00:00Z', updated_at: '2026-07-24T10:29:50Z',
    },
    {
      id: 6, name: '排水控制系统', system_code: 'drainage-control',
      interface_type: 'rest-api', endpoint_url: 'http://10.0.1.100:8888/api',
      auth_type: 'bearer', auth_config: {}, status: 'error',
      sync_interval: 60, data_direction: 'bidirectional', description: '中央泵房自动化排水控制，监测水仓水位和排水量',
      last_sync_at: '2026-07-24T09:15:00Z', api_count: 5, created_at: '2026-07-01T08:00:00Z', updated_at: '2026-07-24T09:15:00Z',
    },
  ]
}

function createMockDataSources(): DataSource[] {
  return [
    {
      id: 1, name: '生产数据主库', source_code: 'prod-mysql',
      category: 'opensource-db', db_type: 'mysql',
      host: '10.0.1.10', port: 3306, database_name: 'mine_production',
      username: 'reader', status: 'connected',
      connection_params: { charset: 'utf8mb4' }, description: '生产业务主数据库，存储设备台账/传感器配置/预警记录',
      last_connected_at: '2026-07-24T10:30:00Z', table_count: 86, topic_count: null,
      created_at: '2026-06-01T08:00:00Z', updated_at: '2026-07-24T10:30:00Z',
    },
    {
      id: 2, name: '历史数据仓库', source_code: 'history-clickhouse',
      category: 'data-warehouse', db_type: 'clickhouse',
      host: '10.0.1.20', port: 8123, database_name: 'mine_history',
      username: 'analyst', status: 'connected',
      connection_params: {}, description: 'ClickHouse时序数据仓库，存储3年以上传感器历史数据',
      last_connected_at: '2026-07-24T10:30:00Z', table_count: 24, topic_count: null,
      created_at: '2026-06-05T08:00:00Z', updated_at: '2026-07-24T10:30:00Z',
    },
    {
      id: 3, name: '安全监控Oracle库', source_code: 'safety-oracle',
      category: 'foreign-db', db_type: 'oracle',
      host: '10.0.1.30', port: 1521, database_name: 'SAFETYDB',
      username: 'sync_user', status: 'connected',
      connection_params: { service_name: 'SAFETYDB' }, description: '安全监控系统Oracle数据库，同步预警事件和处置记录',
      last_connected_at: '2026-07-24T10:29:00Z', table_count: 142, topic_count: null,
      created_at: '2026-06-10T08:00:00Z', updated_at: '2026-07-24T10:29:00Z',
    },
    {
      id: 4, name: '达梦办公数据库', source_code: 'office-dameng',
      category: 'domestic-db', db_type: 'dameng',
      host: '10.0.2.10', port: 5236, database_name: 'OFFICE_DB',
      username: 'dm_reader', status: 'connected',
      connection_params: {}, description: '达梦国产数据库，存储办公自动化和巡检工单数据',
      last_connected_at: '2026-07-24T10:28:00Z', table_count: 38, topic_count: null,
      created_at: '2026-06-15T08:00:00Z', updated_at: '2026-07-24T10:28:00Z',
    },
    {
      id: 5, name: '实时数据Kafka', source_code: 'realtime-kafka',
      category: 'message-middleware', db_type: 'kafka',
      host: '10.0.1.40', port: 9092, database_name: null,
      username: null, status: 'connected',
      connection_params: { group_id: 'mine-alert-consumer', topic_pattern: 'sensor.realtime.*' },
      description: 'Kafka消息集群，承载所有传感器实时数据流',
      last_connected_at: '2026-07-24T10:30:00Z', table_count: null, topic_count: 32,
      created_at: '2026-06-01T08:00:00Z', updated_at: '2026-07-24T10:30:00Z',
    },
    {
      id: 6, name: '预警通知RabbitMQ', source_code: 'alert-rabbitmq',
      category: 'message-middleware', db_type: 'rabbitmq',
      host: '10.0.1.41', port: 5672, database_name: null,
      username: 'alert_pub', status: 'connected',
      connection_params: { vhost: '/mine_alerts' }, description: '预警消息队列，分发声光报警/短信/推送通知',
      last_connected_at: '2026-07-24T10:30:00Z', table_count: null, topic_count: 8,
      created_at: '2026-06-05T08:00:00Z', updated_at: '2026-07-24T10:30:00Z',
    },
    {
      id: 7, name: '第三方气象API', source_code: 'weather-api',
      category: 'api-source', db_type: 'http-api',
      host: 'api.weather.com', port: 443, database_name: null,
      username: null, status: 'connected',
      connection_params: { auth_type: 'api-key', poll_interval: 600 },
      description: '地面气象数据接口，获取气压/温度/湿度辅助分析',
      last_connected_at: '2026-07-24T10:20:00Z', table_count: null, topic_count: null,
      created_at: '2026-06-20T08:00:00Z', updated_at: '2026-07-24T10:20:00Z',
    },
    {
      id: 8, name: '人大金仓报表库', source_code: 'report-kingbase',
      category: 'domestic-db', db_type: 'kingbase',
      host: '10.0.2.20', port: 54321, database_name: 'REPORT_KB',
      username: 'report_reader', status: 'disconnected',
      connection_params: {}, description: '人大金仓数据库，存储综合统计报表和决策分析报告',
      last_connected_at: '2026-07-22T18:00:00Z', table_count: 52, topic_count: null,
      created_at: '2026-07-01T08:00:00Z', updated_at: '2026-07-22T18:00:00Z',
    },
  ]
}

export const useDeviceAccessStore = defineStore('deviceAccess', () => {
  // ── State ──
  const products = ref<Product[]>([])
  const devices = ref<Device[]>([])
  const systems = ref<SystemIntegration[]>([])
  const dataSources = ref<DataSource[]>([])
  const statistics = ref<DeviceAccessStatistics | null>(null)
  const loading = ref(false)

  // ── Computed ──
  const deviceOnlineCount = computed(() =>
    devices.value.filter(d => d.status === 'online').length
  )
  const deviceOfflineCount = computed(() =>
    devices.value.filter(d => d.status === 'offline').length
  )
  const systemConnectedCount = computed(() =>
    systems.value.filter(s => s.status === 'connected').length
  )
  const datasourceConnectedCount = computed(() =>
    dataSources.value.filter(ds => ds.status === 'connected').length
  )

  // ── Actions ──
  function loadMockData() {
    products.value = createMockProducts()
    devices.value = createMockDevices()
    systems.value = createMockSystems()
    dataSources.value = createMockDataSources()
    statistics.value = {
      product_count: products.value.length,
      device_count: devices.value.length,
      device_online_count: deviceOnlineCount.value,
      system_count: systems.value.length,
      system_connected_count: systemConnectedCount.value,
      datasource_count: dataSources.value.length,
      datasource_connected_count: datasourceConnectedCount.value,
    }
  }

  async function fetchProducts() {
    loading.value = true
    try {
      // TODO: 对接后端时取消注释
      // const res = await deviceAccessApi.listProducts()
      // products.value = res.data.items
    } finally {
      loading.value = false
    }
  }

  async function fetchDevices() {
    loading.value = true
    try {
      // const res = await deviceAccessApi.listDevices()
      // devices.value = res.data.items
    } finally {
      loading.value = false
    }
  }

  async function fetchSystems() {
    loading.value = true
    try {
      // const res = await deviceAccessApi.listSystems()
      // systems.value = res.data.items
    } finally {
      loading.value = false
    }
  }

  async function fetchDataSources() {
    loading.value = true
    try {
      // const res = await deviceAccessApi.listDataSources()
      // dataSources.value = res.data.items
    } finally {
      loading.value = false
    }
  }

  async function fetchStatistics() {
    // const res = await deviceAccessApi.statistics()
    // statistics.value = res.data
  }

  return {
    products, devices, systems, dataSources, statistics, loading,
    deviceOnlineCount, deviceOfflineCount,
    systemConnectedCount, datasourceConnectedCount,
    loadMockData,
    fetchProducts, fetchDevices, fetchSystems, fetchDataSources, fetchStatistics,
  }
})
