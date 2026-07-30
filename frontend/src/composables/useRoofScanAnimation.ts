import { ref, onUnmounted } from 'vue'

interface SensorPoint {
  x: number
  y: number
  id: string
  value: string
  color: string
  phase: number
  radius: number
}

interface ScanLine {
  y: number
  speed: number
  opacity: number
  width: number
}

interface DataFlow {
  fromIdx: number
  toIdx: number
  progress: number
  speed: number
}

export function useRoofScanAnimation(canvasRef: HTMLCanvasElement) {
  const ctx = canvasRef.getContext('2d')!
  let animId: number | null = null
  let width = 0
  let height = 0

  // 传感器数据点
  const sensorPoints: SensorPoint[] = []
  // 扫描线
  const scanLines: ScanLine[] = []
  // 数据流连线
  const dataFlows: DataFlow[] = []

  function init() {
    resize()
    generateSensorPoints()
    generateScanLines()
    generateDataFlows()
  }

  function resize() {
    const dpr = window.devicePixelRatio || 1
    width = window.innerWidth
    height = window.innerHeight
    canvasRef.width = width * dpr
    canvasRef.height = height * dpr
    canvasRef.style.width = width + 'px'
    canvasRef.style.height = height + 'px'
    ctx.scale(dpr, dpr)
  }

  function generateSensorPoints() {
    sensorPoints.length = 0
    // 在隧道顶部区域（上方60%）分布传感器点
    const count = 18
    for (let i = 0; i < count; i++) {
      const x = width * 0.1 + Math.random() * width * 0.8
      const y = height * 0.08 + Math.random() * height * 0.45
      const isWarn = Math.random() > 0.8
      sensorPoints.push({
        x,
        y,
        id: `S${String(i + 1).padStart(2, '0')}`,
        value: isWarn
          ? `${(Math.random() * 5 + 3).toFixed(1)}mm`
          : `${(Math.random() * 3).toFixed(1)}mm`,
        color: isWarn ? '#f59e0b' : '#06b6d4',
        phase: Math.random() * Math.PI * 2,
        radius: 3 + Math.random() * 2,
      })
    }
  }

  function generateScanLines() {
    scanLines.length = 0
    for (let i = 0; i < 3; i++) {
      scanLines.push({
        y: -height * 0.2 * (i + 1),
        speed: 0.3 + i * 0.15,
        opacity: 0.4 - i * 0.1,
        width: width,
      })
    }
  }

  function generateDataFlows() {
    dataFlows.length = 0
    // 在相邻传感器之间创建数据流连线
    for (let i = 0; i < sensorPoints.length - 1; i++) {
      const p1 = sensorPoints[i]
      const p2 = sensorPoints[i + 1]
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y)
      if (dist < width * 0.35) {
        dataFlows.push({
          fromIdx: i,
          toIdx: i + 1,
          progress: Math.random(),
          speed: 0.003 + Math.random() * 0.004,
        })
      }
    }
    // 额外添加一些跨接连线
    for (let i = 0; i < 5; i++) {
      const a = Math.floor(Math.random() * sensorPoints.length)
      let b = Math.floor(Math.random() * sensorPoints.length)
      if (a === b) b = (a + 1) % sensorPoints.length
      const dist = Math.hypot(
        sensorPoints[b].x - sensorPoints[a].x,
        sensorPoints[b].y - sensorPoints[a].y
      )
      if (dist < width * 0.4) {
        dataFlows.push({
          fromIdx: a,
          toIdx: b,
          progress: Math.random(),
          speed: 0.002 + Math.random() * 0.003,
        })
      }
    }
  }

  // 绘制透视网格
  function drawGrid(time: number) {
    ctx.save()
    ctx.globalAlpha = 0.06
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 0.5

    // 水平线（带透视收缩）
    const horizonY = height * 0.15
    const lineCount = 12
    for (let i = 0; i <= lineCount; i++) {
      const t = i / lineCount
      const y = horizonY + (height * 0.55 - horizonY) * Math.pow(t, 1.5)
      ctx.beginPath()
      ctx.moveTo(width * 0.05, y)
      ctx.lineTo(width * 0.95, y)
      ctx.stroke()
    }

    // 垂直线（向消失点汇聚）
    const vanishX = width * 0.5
    const vanishY = height * 0.1
    const vLines = 10
    for (let i = 0; i <= vLines; i++) {
      const bottomX = width * 0.05 + (width * 0.9) * (i / vLines)
      ctx.beginPath()
      ctx.moveTo(vanishX + (bottomX - vanishX) * 0.1, vanishY)
      ctx.lineTo(bottomX, height * 0.55)
      ctx.stroke()
    }

    ctx.restore()
  }

  // 绘制扫描线
  function drawScanLines(time: number) {
    for (const line of scanLines) {
      line.y += line.speed
      if (line.y > height * 0.7) {
        line.y = -20
      }

      ctx.save()
      // 扫描线主体
      const gradient = ctx.createLinearGradient(0, line.y - 30, 0, line.y + 4)
      gradient.addColorStop(0, 'rgba(6, 182, 212, 0)')
      gradient.addColorStop(0.8, `rgba(6, 182, 212, ${line.opacity * 0.3})`)
      gradient.addColorStop(1, `rgba(6, 182, 212, ${line.opacity})`)

      ctx.fillStyle = gradient
      ctx.fillRect(width * 0.05, line.y - 30, width * 0.9, 34)

      // 亮线
      ctx.strokeStyle = `rgba(6, 182, 212, ${line.opacity})`
      ctx.lineWidth = 1.5
      ctx.shadowColor = '#06b6d4'
      ctx.shadowBlur = 8
      ctx.beginPath()
      ctx.moveTo(width * 0.05, line.y)
      ctx.lineTo(width * 0.95, line.y)
      ctx.stroke()

      ctx.restore()
    }
  }

  // 绘制传感器数据点
  function drawSensorPoints(time: number) {
    for (const point of sensorPoints) {
      const pulse = Math.sin(time * 0.002 + point.phase) * 0.5 + 0.5

      ctx.save()

      // 外圈脉冲
      ctx.beginPath()
      ctx.arc(point.x, point.y, point.radius + 6 + pulse * 6, 0, Math.PI * 2)
      ctx.fillStyle = point.color.replace(')', `, ${0.08 + pulse * 0.06})`).replace('rgb', 'rgba')
      // Handle hex colors
      if (point.color.startsWith('#')) {
        const r = parseInt(point.color.slice(1, 3), 16)
        const g = parseInt(point.color.slice(3, 5), 16)
        const b = parseInt(point.color.slice(5, 7), 16)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.08 + pulse * 0.06})`
      }
      ctx.fill()

      // 中圈
      ctx.beginPath()
      ctx.arc(point.x, point.y, point.radius + 2, 0, Math.PI * 2)
      if (point.color.startsWith('#')) {
        const r = parseInt(point.color.slice(1, 3), 16)
        const g = parseInt(point.color.slice(3, 5), 16)
        const b = parseInt(point.color.slice(5, 7), 16)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.2 + pulse * 0.15})`
      }
      ctx.fill()

      // 核心点
      ctx.beginPath()
      ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2)
      ctx.fillStyle = point.color
      ctx.shadowColor = point.color
      ctx.shadowBlur = 6
      ctx.fill()

      // 标签
      ctx.shadowBlur = 0
      ctx.font = '10px "Courier New", monospace'
      ctx.fillStyle = `rgba(232, 237, 245, ${0.5 + pulse * 0.3})`
      ctx.fillText(`${point.id}: ${point.value}`, point.x + point.radius + 6, point.y + 3)

      ctx.restore()
    }
  }

  // 绘制数据流连线
  function drawDataFlows(time: number) {
    for (const flow of dataFlows) {
      flow.progress += flow.speed
      if (flow.progress > 1) flow.progress = 0

      const from = sensorPoints[flow.fromIdx]
      const to = sensorPoints[flow.toIdx]
      if (!from || !to) continue

      ctx.save()

      // 连线
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)'
      ctx.lineWidth = 0.8
      ctx.stroke()

      // 移动的数据包亮点
      const px = from.x + (to.x - from.x) * flow.progress
      const py = from.y + (to.y - from.y) * flow.progress

      ctx.beginPath()
      ctx.arc(px, py, 2, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(59, 130, 246, 0.7)'
      ctx.shadowColor = '#3b82f6'
      ctx.shadowBlur = 6
      ctx.fill()

      ctx.restore()
    }
  }

  // 主循环
  function animate(time: number) {
    ctx.clearRect(0, 0, width, height)
    drawGrid(time)
    drawScanLines(time)
    drawSensorPoints(time)
    drawDataFlows(time)
    animId = requestAnimationFrame(animate)
  }

  function start() {
    init()
    animId = requestAnimationFrame(animate)
    window.addEventListener('resize', handleResize)
  }

  function handleResize() {
    resize()
    generateSensorPoints()
    generateDataFlows()
  }

  function stop() {
    if (animId) {
      cancelAnimationFrame(animId)
      animId = null
    }
    window.removeEventListener('resize', handleResize)
  }

  return { start, stop }
}
