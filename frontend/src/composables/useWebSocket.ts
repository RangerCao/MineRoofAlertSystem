/**
 * WebSocket 实时数据组合式函数
 */
import { ref, onMounted, onUnmounted } from 'vue'

export function useWebSocket(channel: string = 'realtime') {
  const ws = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const lastMessage = ref<any>(null)
  const messages = ref<any[]>([])

  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'

  function connect() {
    const url = `${wsUrl}/ws/${channel}`
    ws.value = new WebSocket(url)

    ws.value.onopen = () => {
      isConnected.value = true
      // 发送订阅请求
      ws.value?.send(JSON.stringify({ type: 'subscribe', channel }))
    }

    ws.value.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        lastMessage.value = data
        messages.value.push(data)
        // 保持最近100条消息
        if (messages.value.length > 100) {
          messages.value = messages.value.slice(-100)
        }
      } catch {
        // 非JSON消息忽略
      }
    }

    ws.value.onclose = () => {
      isConnected.value = false
      // 3秒后自动重连
      setTimeout(connect, 3000)
    }

    ws.value.onerror = () => {
      isConnected.value = false
    }
  }

  function disconnect() {
    if (ws.value) {
      ws.value.close()
      ws.value = null
    }
  }

  function send(data: any) {
    if (ws.value && isConnected.value) {
      ws.value.send(JSON.stringify(data))
    }
  }

  onMounted(connect)
  onUnmounted(disconnect)

  return { isConnected, lastMessage, messages, send, disconnect }
}
