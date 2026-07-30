// ─── 通信协议 ───
export type ProtocolType =
  | 'mqtt' | 'modbus-tcp' | 'modbus-rtu'
  | 'opc-ua' | 'http' | 'websocket'
  | 'tcp-custom' | 'bacnet' | 'canbus'

export const PROTOCOL_LABELS: Record<ProtocolType, string> = {
  'mqtt': 'MQTT',
  'modbus-tcp': 'Modbus-TCP',
  'modbus-rtu': 'Modbus-RTU',
  'opc-ua': 'OPC-UA',
  'http': 'HTTP',
  'websocket': 'WebSocket',
  'tcp-custom': 'TCP自定义',
  'bacnet': 'BACnet',
  'canbus': 'CANbus',
}

// ─── 设备状态 ───
export type DeviceStatus = 'online' | 'offline' | 'unverified' | 'disabled'

export const DEVICE_STATUS_LABELS: Record<DeviceStatus, string> = {
  online: '在线',
  offline: '离线',
  unverified: '未验证',
  disabled: '已禁用',
}

export const DEVICE_STATUS_TAG_TYPE: Record<DeviceStatus, 'success' | 'danger' | 'warning' | 'info'> = {
  online: 'success',
  offline: 'danger',
  unverified: 'warning',
  disabled: 'info',
}

// ─── 数据类型 ───
export type PropertyDataType = 'int' | 'float' | 'double' | 'string' | 'boolean' | 'enum' | 'json'

export const DATA_TYPE_LABELS: Record<PropertyDataType, string> = {
  int: '整数',
  float: '单精度浮点',
  double: '双精度浮点',
  string: '字符串',
  boolean: '布尔',
  enum: '枚举',
  json: 'JSON',
}

// ─── 设备类型 ───
export type DeviceType = 'sensor' | 'gateway' | 'controller' | 'camera' | 'other'

export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  sensor: '传感器',
  gateway: '网关',
  controller: '控制器',
  camera: '摄像头',
  other: '其他',
}

// ─── 系统接入 ───
export type InterfaceType = 'rest-api' | 'websocket' | 'grpc' | 'graphql' | 'ftp' | 'sftp'

export const INTERFACE_TYPE_LABELS: Record<InterfaceType, string> = {
  'rest-api': 'REST API',
  'websocket': 'WebSocket',
  'grpc': 'gRPC',
  'graphql': 'GraphQL',
  'ftp': 'FTP',
  'sftp': 'SFTP',
}

export type SystemStatus = 'connected' | 'disconnected' | 'error' | 'syncing'

export const SYSTEM_STATUS_LABELS: Record<SystemStatus, string> = {
  connected: '已连接',
  disconnected: '未连接',
  error: '异常',
  syncing: '同步中',
}

export const SYSTEM_STATUS_TAG_TYPE: Record<SystemStatus, 'success' | 'danger' | 'warning' | 'info'> = {
  connected: 'success',
  disconnected: 'info',
  error: 'danger',
  syncing: 'warning',
}

// ─── 数据源 ───
export type DataSourceCategory =
  | 'foreign-db'
  | 'domestic-db'
  | 'opensource-db'
  | 'data-warehouse'
  | 'message-middleware'
  | 'api-source'

export const DATASOURCE_CATEGORY_LABELS: Record<DataSourceCategory, string> = {
  'foreign-db': '国外数据库',
  'domestic-db': '国产数据库',
  'opensource-db': '开源数据库',
  'data-warehouse': '数据仓库',
  'message-middleware': '消息中间件',
  'api-source': 'API数据源',
}

export type DataSourceStatus = 'connected' | 'disconnected' | 'testing' | 'error'

export const DATASOURCE_STATUS_LABELS: Record<DataSourceStatus, string> = {
  connected: '已连接',
  disconnected: '未连接',
  testing: '测试中',
  error: '连接异常',
}

export const DATASOURCE_STATUS_TAG_TYPE: Record<DataSourceStatus, 'success' | 'danger' | 'warning' | 'info'> = {
  connected: 'success',
  disconnected: 'info',
  testing: 'warning',
  error: 'danger',
}

// ─── 核心接口 ───

export interface PropertyDefinition {
  id: string
  identifier: string
  name: string
  data_type: PropertyDataType
  unit: string | null
  min_value: number | null
  max_value: number | null
  step: number | null
  description: string | null
}

export interface CommandDefinition {
  id: string
  identifier: string
  name: string
  description: string | null
  input_params: PropertyDefinition[]
  output_params: PropertyDefinition[]
}

export interface Product {
  id: number
  product_key: string
  name: string
  device_type: DeviceType
  protocol: ProtocolType
  protocol_config: Record<string, any>
  description: string | null
  uplink_properties: PropertyDefinition[]
  downlink_commands: CommandDefinition[]
  device_count: number
  online_count: number
  created_at: string
  updated_at: string
}

export interface Device {
  id: number
  device_key: string
  product_id: number
  product_name: string
  name: string
  device_code: string
  status: DeviceStatus
  firmware_version: string | null
  ip_address: string | null
  last_online_at: string | null
  location: string | null
  mine_area: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface SystemIntegration {
  id: number
  name: string
  system_code: string
  interface_type: InterfaceType
  endpoint_url: string
  auth_type: 'none' | 'basic' | 'bearer' | 'api-key' | 'oauth2'
  auth_config: Record<string, any>
  status: SystemStatus
  sync_interval: number | null
  data_direction: 'pull' | 'push' | 'bidirectional'
  description: string | null
  last_sync_at: string | null
  api_count: number
  created_at: string
  updated_at: string
}

export interface DataSource {
  id: number
  name: string
  source_code: string
  category: DataSourceCategory
  db_type: string
  host: string
  port: number
  database_name: string | null
  username: string | null
  status: DataSourceStatus
  connection_params: Record<string, any>
  description: string | null
  last_connected_at: string | null
  table_count: number | null
  topic_count: number | null
  created_at: string
  updated_at: string
}

// ─── 数据库类型注册表 ───
export interface DatabaseTypeOption {
  value: string
  label: string
  category: DataSourceCategory
  default_port: number
}

export const DATABASE_TYPES: DatabaseTypeOption[] = [
  { value: 'oracle', label: 'Oracle', category: 'foreign-db', default_port: 1521 },
  { value: 'sqlserver', label: 'SQL Server', category: 'foreign-db', default_port: 1433 },
  { value: 'db2', label: 'IBM DB2', category: 'foreign-db', default_port: 50000 },
  { value: 'dameng', label: '达梦 DM', category: 'domestic-db', default_port: 5236 },
  { value: 'kingbase', label: '人大金仓', category: 'domestic-db', default_port: 54321 },
  { value: 'gbase', label: '南大通用 GBase', category: 'domestic-db', default_port: 5258 },
  { value: 'mysql', label: 'MySQL', category: 'opensource-db', default_port: 3306 },
  { value: 'postgresql', label: 'PostgreSQL', category: 'opensource-db', default_port: 5432 },
  { value: 'sqlite', label: 'SQLite', category: 'opensource-db', default_port: 0 },
  { value: 'clickhouse', label: 'ClickHouse', category: 'data-warehouse', default_port: 8123 },
  { value: 'doris', label: 'Apache Doris', category: 'data-warehouse', default_port: 9030 },
  { value: 'kafka', label: 'Kafka', category: 'message-middleware', default_port: 9092 },
  { value: 'rabbitmq', label: 'RabbitMQ', category: 'message-middleware', default_port: 5672 },
  { value: 'rocketmq', label: 'RocketMQ', category: 'message-middleware', default_port: 9876 },
  { value: 'mqtt-broker', label: 'MQTT Broker', category: 'message-middleware', default_port: 1883 },
  { value: 'http-api', label: 'HTTP API', category: 'api-source', default_port: 443 },
]

// ─── API响应类型 ───
export interface ProductListResponse { total: number; items: Product[] }
export interface DeviceListResponse { total: number; items: Device[] }
export interface SystemListResponse { total: number; items: SystemIntegration[] }
export interface DataSourceListResponse { total: number; items: DataSource[] }

export interface DeviceAccessStatistics {
  product_count: number
  device_count: number
  device_online_count: number
  system_count: number
  system_connected_count: number
  datasource_count: number
  datasource_connected_count: number
}
