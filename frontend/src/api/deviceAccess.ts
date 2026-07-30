import request from './index'
import type {
  Product, Device, SystemIntegration, DataSource,
  ProductListResponse, DeviceListResponse,
  SystemListResponse, DataSourceListResponse,
  DeviceAccessStatistics
} from '@/types/deviceAccess'

export const deviceAccessApi = {
  // ── 产品 ──
  listProducts(params?: Record<string, any>) {
    return request.get<ProductListResponse>('/device-access/products', { params })
  },
  getProduct(id: number) {
    return request.get<Product>(`/device-access/products/${id}`)
  },
  createProduct(data: Partial<Product>) {
    return request.post<Product>('/device-access/products', data)
  },
  updateProduct(id: number, data: Partial<Product>) {
    return request.put<Product>(`/device-access/products/${id}`, data)
  },
  deleteProduct(id: number) {
    return request.delete(`/device-access/products/${id}`)
  },

  // ── 设备 ──
  listDevices(params?: Record<string, any>) {
    return request.get<DeviceListResponse>('/device-access/devices', { params })
  },
  getDevice(id: number) {
    return request.get<Device>(`/device-access/devices/${id}`)
  },
  createDevice(data: Partial<Device>) {
    return request.post<Device>('/device-access/devices', data)
  },
  updateDevice(id: number, data: Partial<Device>) {
    return request.put<Device>(`/device-access/devices/${id}`, data)
  },
  deleteDevice(id: number) {
    return request.delete(`/device-access/devices/${id}`)
  },
  testConnection(deviceId: number) {
    return request.post<{ success: boolean; latency_ms: number }>(
      `/device-access/devices/${deviceId}/test`
    )
  },

  // ── 系统接入 ──
  listSystems(params?: Record<string, any>) {
    return request.get<SystemListResponse>('/device-access/systems', { params })
  },
  createSystem(data: Partial<SystemIntegration>) {
    return request.post<SystemIntegration>('/device-access/systems', data)
  },
  updateSystem(id: number, data: Partial<SystemIntegration>) {
    return request.put<SystemIntegration>(`/device-access/systems/${id}`, data)
  },
  deleteSystem(id: number) {
    return request.delete(`/device-access/systems/${id}`)
  },
  testSystemConnection(id: number) {
    return request.post<{ success: boolean }>(`/device-access/systems/${id}/test`)
  },

  // ── 数据源 ──
  listDataSources(params?: Record<string, any>) {
    return request.get<DataSourceListResponse>('/device-access/datasources', { params })
  },
  createDataSource(data: Partial<DataSource>) {
    return request.post<DataSource>('/device-access/datasources', data)
  },
  updateDataSource(id: number, data: Partial<DataSource>) {
    return request.put<DataSource>(`/device-access/datasources/${id}`, data)
  },
  deleteDataSource(id: number) {
    return request.delete(`/device-access/datasources/${id}`)
  },
  testDataSourceConnection(id: number) {
    return request.post<{ success: boolean; latency_ms: number }>(
      `/device-access/datasources/${id}/test`
    )
  },

  // ── 统计 ──
  statistics() {
    return request.get<DeviceAccessStatistics>('/device-access/statistics')
  },
}
