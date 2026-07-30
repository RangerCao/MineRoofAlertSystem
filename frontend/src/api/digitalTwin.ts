import request from './index'

export const digitalTwinApi = {
  listModels(params?: Record<string, any>) {
    return request.get('/digital-twin/models', { params })
  },
  getModel(modelId: number) {
    return request.get(`/digital-twin/models/${modelId}`)
  },
  getLatestSimulation(modelId: number) {
    return request.get(`/digital-twin/models/${modelId}/simulation/latest`)
  },
  getSimulationHistory(modelId: number, limit = 20) {
    return request.get(`/digital-twin/models/${modelId}/simulation/history`, { params: { limit } })
  },
}
