import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { createNoise2D } from 'simplex-noise'

// ─── 类型定义 ───
export interface SensorData {
  id: string
  name: string
  type: 'pressure' | 'displacement' | 'stress' | 'temperature'
  position: [number, number, number]
  value: number
  unit: string
  status: 'normal' | 'warning' | 'alarm'
}

export interface FacilityLabel {
  id: string
  name: string
  position: [number, number, number]
  type: 'building' | 'equipment' | 'zone' | 'sensor'
}

export interface SceneAPI {
  resetView: () => void
  toggleWireframe: () => void
  toggleLabels: () => void
  setView: (view: 'overview' | 'tunnel' | 'sensor') => void
  isWireframe: Ref<boolean>
  showLabels: Ref<boolean>
  currentView: Ref<string>
  selectedSensor: Ref<SensorData | null>
  selectedFacility: Ref<FacilityLabel | null>
}

// ─── 贵州荔波喀斯特矿区传感器数据 ───
const SENSORS: SensorData[] = [
  { id: 'K01', name: '顶板压力-01', type: 'pressure', position: [-12, 14, -8], value: 24.5, unit: 'MPa', status: 'normal' },
  { id: 'K02', name: '顶板压力-02', type: 'pressure', position: [-4, 16, -6], value: 31.2, unit: 'MPa', status: 'warning' },
  { id: 'K03', name: '顶板压力-03', type: 'pressure', position: [6, 13, -10], value: 45.8, unit: 'MPa', status: 'alarm' },
  { id: 'K04', name: '顶板压力-04', type: 'pressure', position: [14, 15, -4], value: 28.3, unit: 'MPa', status: 'normal' },
  { id: 'K05', name: '离层监测-01', type: 'displacement', position: [-8, 18, 2], value: 1.2, unit: 'mm', status: 'normal' },
  { id: 'K06', name: '离层监测-02', type: 'displacement', position: [2, 17, 0], value: 3.8, unit: 'mm', status: 'warning' },
  { id: 'K07', name: '离层监测-03', type: 'displacement', position: [10, 16, 4], value: 8.5, unit: 'mm', status: 'alarm' },
  { id: 'K08', name: '应力监测-01', type: 'stress', position: [-10, 12, 6], value: 15.6, unit: 'MPa', status: 'normal' },
  { id: 'K09', name: '应力监测-02', type: 'stress', position: [0, 11, 8], value: 22.4, unit: 'MPa', status: 'warning' },
  { id: 'K10', name: '应力监测-03', type: 'stress', position: [8, 13, 5], value: 18.9, unit: 'MPa', status: 'normal' },
  { id: 'K11', name: '温度监测-01', type: 'temperature', position: [-6, 20, -2], value: 28.3, unit: '°C', status: 'normal' },
  { id: 'K12', name: '温度监测-02', type: 'temperature', position: [4, 19, -4], value: 35.7, unit: '°C', status: 'warning' },
]

// ─── 设施标注 ───
const FACILITIES: FacilityLabel[] = [
  { id: 'f1', name: '智慧公寓', position: [-22, 0, -22], type: 'building' },
  { id: 'f2', name: '生产区', position: [-10, 0, -14], type: 'zone' },
  { id: 'f3', name: '智慧照明', position: [0, 0, -8], type: 'equipment' },
  { id: 'f4', name: '井口综合安检', position: [10, 0, -6], type: 'building' },
  { id: 'f5', name: '健康小屋', position: [20, 0, -12], type: 'building' },
  { id: 'f6', name: '巡检机器人', position: [14, 0, 2], type: 'equipment' },
  { id: 'f7', name: '110KV变电所', position: [8, 0, 10], type: 'building' },
  { id: 'f8', name: '水处理站', position: [-4, 0, 8], type: 'building' },
  { id: 'f9', name: '粗破车间', position: [-12, 0, 12], type: 'building' },
  { id: 'f10', name: '调度指挥中心', position: [22, 0, 8], type: 'building' },
  { id: 'f11', name: '智慧物流', position: [2, 0, -20], type: 'zone' },
  { id: 'f12', name: '无人超市', position: [24, 0, -16], type: 'building' },
]

// ─── 颜色配置 ───
const COLORS = {
  bg: 0x152535,
  terrain: 0x2a4a2a,
  terrainEdge: 0x3a6a4a,
  water: 0x1a5878,
  building: 0x2a3a50,
  buildingEdge: 0x3a8aba,
  road: 0x2a3040,
  roadEdge: 0x3a6a8a,
  sensorNormal: 0x10b981,
  sensorWarning: 0xf59e0b,
  sensorAlarm: 0xef4444,
  accentCyan: 0x06b6d4,
  accentBlue: 0x3b82f6,
  treeDark: 0x1a4a1a,
  treeMid: 0x2a6a2a,
  treeLight: 0x3a7a3a,
}

const SENSOR_TYPE_COLORS: Record<string, number> = {
  pressure: 0x3b82f6,
  displacement: 0x06b6d4,
  stress: 0xf59e0b,
  temperature: 0xef4444,
}

export function useMineScene(container: Ref<HTMLElement | null>): SceneAPI {
  const isWireframe = ref(false)
  const showLabels = ref(true)
  const currentView = ref('overview')
  const selectedSensor = ref<SensorData | null>(null)
  const selectedFacility = ref<FacilityLabel | null>(null)

  let scene: THREE.Scene
  let camera: THREE.PerspectiveCamera
  let renderer: THREE.WebGLRenderer
  let controls: OrbitControls
  let animationId: number
  let sensorMeshes: THREE.Mesh[] = []
  let sensorGlows: THREE.Mesh[] = []
  let labelSprites: THREE.Sprite[] = []
  let facilitySprites: THREE.Sprite[] = []
  let terrainMesh: THREE.Mesh | null = null
  let waterMesh: THREE.Mesh | null = null
  let buildingGroup: THREE.Group
  let roadGroup: THREE.Group
  let treeGroup: THREE.Group
  let particleSystem: THREE.Points | null = null
  let scanLine: THREE.Mesh | null = null
  let raycaster: THREE.Raycaster
  let mouse: THREE.Vector2
  let clock: THREE.Clock
  let terrainNoise: (x: number, y: number) => number

  const defaultCameraPos = new THREE.Vector3(80, 35, 80)
  const defaultTarget = new THREE.Vector3(0, 2, 0)

  // ─── 地形高度采样 ───
  function sampleTerrainHeight(x: number, z: number): number {
    const n = terrainNoise
    let h = n(x * 0.01, z * 0.01) * 10
    const peak = n(x * 0.025 + 100, z * 0.025 + 100)
    h += Math.pow(Math.max(0, Math.abs(peak)), 0.7) * 12
    h += n(x * 0.06 + 200, z * 0.06 + 200) * 2
    const dist = Math.sqrt(x * x + z * z)
    const flat = Math.max(0, 1 - dist / 15)
    h = h * (1 - flat * 0.5) + 1 * flat
    const valley = Math.exp(-Math.pow(z * 0.025, 2)) * 3
    h -= valley
    return h
  }

  // ─── 初始化场景 ───
  function initScene() {
    if (!container.value) return

    const w = container.value.clientWidth
    const h = container.value.clientHeight

    clock = new THREE.Clock()

    scene = new THREE.Scene()
    scene.background = new THREE.Color(COLORS.bg)
    scene.fog = new THREE.FogExp2(0x1a2a3a, 0.002)

    camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 800)
    camera.position.copy(defaultCameraPos)
    camera.lookAt(defaultTarget)

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    container.value.appendChild(renderer.domElement)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.target.copy(defaultTarget)
    controls.enableDamping = true
    controls.dampingFactor = 0.06
    controls.minDistance = 10
    controls.maxDistance = 120
    controls.maxPolarAngle = Math.PI * 0.48
    controls.update()

    raycaster = new THREE.Raycaster()
    mouse = new THREE.Vector2()

    setupLights()
    createSkyDome()
    createKarstTerrain()
    createWater()
    createVegetation()
    createRoads()
    createSensors(SENSORS)
    createParticles()
    createScanLine()

    window.addEventListener('resize', onResize)
    container.value.addEventListener('click', onCanvasClick)
    container.value.addEventListener('mousemove', onCanvasMouseMove)

    animate()
  }

  // ─── 灯光系统 ──
  function setupLights() {
    // 环境光 - 强环境光提亮全局
    const ambient = new THREE.AmbientLight(0x8899aa, 1.5)
    scene.add(ambient)

    // 半球光 - 模拟天空/地面反射（强）
    const hemiLight = new THREE.HemisphereLight(0x88bbdd, 0x556655, 1.4)
    hemiLight.position.set(0, 50, 0)
    scene.add(hemiLight)

    // 主方向光 - 模拟阳光（强）
    const dirLight = new THREE.DirectionalLight(0xddeeff, 3.0)
    dirLight.position.set(30, 40, 20)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.set(2048, 2048)
    dirLight.shadow.camera.near = 1
    dirLight.shadow.camera.far = 120
    dirLight.shadow.camera.left = -50
    dirLight.shadow.camera.right = 50
    dirLight.shadow.camera.top = 50
    dirLight.shadow.camera.bottom = -50
    dirLight.shadow.bias = -0.001
    scene.add(dirLight)

    // 补光 - 从左侧（增强）
    const fillLight = new THREE.DirectionalLight(0x88aacc, 0.8)
    fillLight.position.set(-20, 15, -10)
    scene.add(fillLight)

    // 科技感点光源（增强）
    const pointCyan = new THREE.PointLight(0x06b6d4, 0.8, 60)
    pointCyan.position.set(-10, 20, -10)
    scene.add(pointCyan)

    const pointBlue = new THREE.PointLight(0x3b82f6, 0.6, 50)
    pointBlue.position.set(10, 15, 10)
    scene.add(pointBlue)
  }

  // ─── 天空穹顶 ───
  function createSkyDome() {
    const skyGeo = new THREE.SphereGeometry(300, 32, 16)
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x3a6090) },
        midColor: { value: new THREE.Color(0x5a8aaa) },
        bottomColor: { value: new THREE.Color(0x3a5a6a) },
        offset: { value: 20 },
        exponent: { value: 0.5 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 midColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          float t = max(pow(max(h, 0.0), exponent), 0.0);
          vec3 sky = mix(midColor, topColor, t);
          float b = max(-h * 2.0, 0.0);
          sky = mix(sky, bottomColor, clamp(b, 0.0, 1.0));
          gl_FragColor = vec4(sky, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
    })
    const sky = new THREE.Mesh(skyGeo, skyMat)
    scene.add(sky)
  }

  // ─── 程序化喀斯特地形 ───
  function createKarstTerrain() {
    const size = 200
    const segments = 200
    const geo = new THREE.PlaneGeometry(size, size, segments, segments)
    geo.rotateX(-Math.PI / 2)

    const positions = geo.attributes.position
    const colors = new Float32Array(positions.count * 3)
    const noise2D = createNoise2D()
    terrainNoise = noise2D

    const baseColor = new THREE.Color(0x4a8a30)   // 绿色植被（提亮）
    const rockColor = new THREE.Color(0x9a9a7a)   // 岩石色（提亮）
    const darkColor = new THREE.Color(0x3a5a3a)   // 山顶（提亮）
    const valleyColor = new THREE.Color(0x2a6a20) // 谷底（提亮）
    const tmpColor = new THREE.Color()

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const z = positions.getZ(i)

      // 基础地形 - 缓和起伏
      let height = noise2D(x * 0.01, z * 0.01) * 10

      // 喀斯特峰林 - 缓和山峰
      const peakNoise = noise2D(x * 0.025 + 100, z * 0.025 + 100)
      height += Math.pow(Math.max(0, Math.abs(peakNoise)), 0.7) * 12

      // 细节噪声
      height += noise2D(x * 0.06 + 200, z * 0.06 + 200) * 2

      // 中心矿区平坦
      const distFromCenter = Math.sqrt(x * x + z * z)
      const flattenFactor = Math.max(0, 1 - distFromCenter / 15)
      height = height * (1 - flattenFactor * 0.5) + 1 * flattenFactor

      // 河谷
      const valleyFactor = Math.exp(-Math.pow(z * 0.025, 2)) * 3
      height -= valleyFactor

      positions.setY(i, height)

      // 顶点着色 - 根据高度着色（调整归一化范围）
      const normalizedH = (height + 3) / 20
      const slope = Math.abs(peakNoise)

      if (normalizedH < 0.15) {
        tmpColor.copy(valleyColor)
      } else if (normalizedH < 0.4) {
        tmpColor.lerpColors(valleyColor, baseColor, (normalizedH - 0.15) / 0.25)
      } else if (normalizedH < 0.7) {
        tmpColor.lerpColors(baseColor, rockColor, (normalizedH - 0.4) / 0.3)
      } else {
        tmpColor.lerpColors(rockColor, darkColor, Math.min((normalizedH - 0.7) / 0.3, 1))
      }

      // 坡度影响
      if (slope > 0.6) {
        tmpColor.lerp(rockColor, Math.min((slope - 0.6) * 2, 0.7))
      }

      // 微噪声变化
      const colorNoise = noise2D(x * 0.3 + 500, z * 0.3 + 500) * 0.08
      tmpColor.r = Math.max(0, Math.min(1, tmpColor.r + colorNoise))
      tmpColor.g = Math.max(0, Math.min(1, tmpColor.g + colorNoise * 0.5))
      tmpColor.b = Math.max(0, Math.min(1, tmpColor.b + colorNoise * 0.3))

      colors[i * 3] = tmpColor.r
      colors[i * 3 + 1] = tmpColor.g
      colors[i * 3 + 2] = tmpColor.b
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.computeVertexNormals()

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.92,
      metalness: 0.05,
      side: THREE.DoubleSide,
      flatShading: false,
    })

    terrainMesh = new THREE.Mesh(geo, mat)
    terrainMesh.receiveShadow = true
    terrainMesh.castShadow = true
    scene.add(terrainMesh)

    // 地形线框叠加（科技风）
    const wireGeo = new THREE.WireframeGeometry(geo)
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x1a4a3a,
      transparent: true,
      opacity: 0.04,
    })
    const wireframe = new THREE.LineSegments(wireGeo, wireMat)
    wireframe.visible = false
    terrainMesh.add(wireframe)
  }

  // ─── 水体 ───
  function createWater() {
    const waterGeo = new THREE.PlaneGeometry(120, 12, 64, 8)
    waterGeo.rotateX(-Math.PI / 2)

    const waterMat = new THREE.MeshStandardMaterial({
      color: COLORS.water,
      transparent: true,
      opacity: 0.7,
      roughness: 0.05,
      metalness: 0.85,
      side: THREE.DoubleSide,
    })

    waterMesh = new THREE.Mesh(waterGeo, waterMat)
    waterMesh.position.set(0, -0.5, 0)
    waterMesh.receiveShadow = true
    scene.add(waterMesh)
  }

  // ─── 植被（树木） ───
  function createVegetation() {
    treeGroup = new THREE.Group()
    const noise2D = terrainNoise
    const treeCount = 300

    const trunkGeo = new THREE.CylinderGeometry(0.08, 0.12, 1.2, 5)
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.9 })

    const leafGeos = [
      new THREE.ConeGeometry(0.6, 1.8, 6),
      new THREE.ConeGeometry(0.5, 2.2, 6),
      new THREE.ConeGeometry(0.7, 1.5, 6),
    ]
    const leafMats = [
      new THREE.MeshStandardMaterial({ color: 0x0a3a0a, roughness: 0.85 }),
      new THREE.MeshStandardMaterial({ color: 0x1a4a1a, roughness: 0.85 }),
      new THREE.MeshStandardMaterial({ color: 0x0a2a0a, roughness: 0.85 }),
    ]

    for (let i = 0; i < treeCount; i++) {
      const x = (Math.random() - 0.5) * 100
      const z = (Math.random() - 0.5) * 100
      const dist = Math.sqrt(x * x + z * z)

      // 跳过中心矿区和水域
      if (dist < 16) continue
      if (Math.abs(z) < 5 && dist > 16) continue

      const y = sampleTerrainHeight(x, z)
      if (y < 0.5 || y > 22) continue

      const scale = 0.6 + Math.random() * 1.2
      const treeGroupItem = new THREE.Group()

      // 树干
      const trunk = new THREE.Mesh(trunkGeo, trunkMat)
      trunk.scale.set(scale, scale, scale)
      trunk.position.y = scale * 0.6
      treeGroupItem.add(trunk)

      // 树冠
      const leafIdx = Math.floor(Math.random() * 3)
      const leaf = new THREE.Mesh(leafGeos[leafIdx], leafMats[Math.floor(Math.random() * 3)])
      leaf.scale.set(scale, scale, scale)
      leaf.position.y = scale * 1.6
      leaf.castShadow = true
      treeGroupItem.add(leaf)

      treeGroupItem.position.set(x, y, z)
      treeGroupItem.rotation.y = Math.random() * Math.PI * 2
      treeGroup.add(treeGroupItem)
    }

    scene.add(treeGroup)
  }

  // ─── 建筑群（贴地放置） ───
  function createBuildings() {
    buildingGroup = new THREE.Group()

    const buildings = [
      { pos: [-22, -22] as [number, number], w: 6, h: 4, d: 4, name: '智慧公寓' },
      { pos: [-10, -14] as [number, number], w: 10, h: 2, d: 8, name: '生产区' },
      { pos: [10, -6] as [number, number], w: 5, h: 3, d: 5, name: '井口安检' },
      { pos: [20, -12] as [number, number], w: 4, h: 2.5, d: 4, name: '健康小屋' },
      { pos: [8, 10] as [number, number], w: 5, h: 3.5, d: 4, name: '变电所' },
      { pos: [-4, 8] as [number, number], w: 4, h: 2, d: 4, name: '水处理站' },
      { pos: [-12, 12] as [number, number], w: 6, h: 2.5, d: 5, name: '粗破车间' },
      { pos: [22, 8] as [number, number], w: 7, h: 4, d: 5, name: '调度中心' },
      { pos: [24, -16] as [number, number], w: 3, h: 2, d: 3, name: '无人超市' },
      { pos: [2, -20] as [number, number], w: 8, h: 1.5, d: 4, name: '智慧物流' },
    ]

    buildings.forEach((b) => {
      const terrainY = sampleTerrainHeight(b.pos[0], b.pos[1])
      const baseY = Math.max(terrainY, 0.5)

      // 建筑主体
      const geo = new THREE.BoxGeometry(b.w, b.h, b.d)
      const mat = new THREE.MeshStandardMaterial({
        color: COLORS.building,
        transparent: true,
        opacity: 0.8,
        roughness: 0.3,
        metalness: 0.5,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(b.pos[0], baseY + b.h / 2, b.pos[1])
      mesh.castShadow = true
      mesh.receiveShadow = true
      mesh.userData = { type: 'building', name: b.name }
      buildingGroup.add(mesh)

      // 建筑边框
      const edges = new THREE.EdgesGeometry(geo)
      const edgeMat = new THREE.LineBasicMaterial({
        color: COLORS.buildingEdge,
        transparent: true,
        opacity: 0.5,
      })
      const edgeLines = new THREE.LineSegments(edges, edgeMat)
      edgeLines.position.copy(mesh.position)
      buildingGroup.add(edgeLines)

      // 顶部发光面
      const topGeo = new THREE.PlaneGeometry(b.w - 0.2, b.d - 0.2)
      topGeo.rotateX(-Math.PI / 2)
      const topMat = new THREE.MeshBasicMaterial({
        color: COLORS.accentCyan,
        transparent: true,
        opacity: 0.06,
      })
      const top = new THREE.Mesh(topGeo, topMat)
      top.position.set(b.pos[0], baseY + b.h + 0.01, b.pos[1])
      buildingGroup.add(top)
    })

    scene.add(buildingGroup)
  }

  // ─── 地下巷道网络 ───
  function createRoads() {
    roadGroup = new THREE.Group()

    // 巷道布局：地下 y = TUNNEL_DEPTH
    const TUNNEL_DEPTH = -3
    const TUNNEL_H = 1.2   // 巷道高度
    const TUNNEL_W = 1.6   // 巷道宽度

    const tunnels = [
      { from: [-30, -20] as [number, number], to: [28, -20] as [number, number], w: TUNNEL_W },
      { from: [-30, -6] as [number, number], to: [28, -6] as [number, number], w: TUNNEL_W + 0.4 },
      { from: [-30, 10] as [number, number], to: [28, 10] as [number, number], w: TUNNEL_W },
      { from: [-22, -28] as [number, number], to: [-22, 18] as [number, number], w: TUNNEL_W },
      { from: [0, -28] as [number, number], to: [0, 18] as [number, number], w: TUNNEL_W + 0.4 },
      { from: [20, -28] as [number, number], to: [20, 18] as [number, number], w: TUNNEL_W },
      { from: [-28, -26] as [number, number], to: [26, 16] as [number, number], w: TUNNEL_W + 0.6 },
    ]

    // 巷道材质（暗色混凝土质感）
    const tunnelMat = new THREE.MeshStandardMaterial({
      color: 0x1a2030,
      transparent: true,
      opacity: 0.85,
      roughness: 0.95,
      metalness: 0.05,
    })
    // 巷道内壁发光边
    const tunnelEdgeMat = new THREE.LineBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.15,
    })
    // 竖井材质
    const shaftMat = new THREE.MeshStandardMaterial({
      color: 0x151c28,
      transparent: true,
      opacity: 0.6,
      roughness: 0.9,
    })

    tunnels.forEach((tunnel) => {
      const dx = tunnel.to[0] - tunnel.from[0]
      const dz = tunnel.to[1] - tunnel.from[1]
      const length = Math.sqrt(dx * dx + dz * dz)
      const angle = Math.atan2(dx, dz)

      // ── 巷道主体（3D箱体）──
      const geo = new THREE.BoxGeometry(tunnel.w, TUNNEL_H, length)
      const mesh = new THREE.Mesh(geo, tunnelMat)
      const midX = (tunnel.from[0] + tunnel.to[0]) / 2
      const midZ = (tunnel.from[1] + tunnel.to[1]) / 2
      mesh.position.set(midX, TUNNEL_DEPTH, midZ)
      mesh.rotation.y = angle
      roadGroup.add(mesh)

      // ─ 巷道边缘线（科技感轮廓）──
      const edges = new THREE.EdgesGeometry(geo)
      const edgeLines = new THREE.LineSegments(edges, tunnelEdgeMat)
      edgeLines.position.copy(mesh.position)
      edgeLines.rotation.copy(mesh.rotation)
      roadGroup.add(edgeLines)

      // ── 巷道底部中心线（青色引导线）──
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(tunnel.from[0], TUNNEL_DEPTH - TUNNEL_H / 2 + 0.02, tunnel.from[1]),
        new THREE.Vector3(tunnel.to[0], TUNNEL_DEPTH - TUNNEL_H / 2 + 0.02, tunnel.to[1]),
      ])
      const lineMat = new THREE.LineBasicMaterial({
        color: COLORS.accentCyan,
        transparent: true,
        opacity: 0.25,
      })
      const line = new THREE.Line(lineGeo, lineMat)
      roadGroup.add(line)
    })

    // ── 竖井（连接地面与巷道）──
    const shaftPositions: [number, number][] = [
      [0, -6], [-22, -6], [20, -6],
      [0, 10], [-22, 10], [20, 10],
      [0, -20], [-22, -20],
    ]
    const shaftGeo = new THREE.CylinderGeometry(0.3, 0.3, Math.abs(TUNNEL_DEPTH) + 2, 8)
    shaftPositions.forEach(([sx, sz]) => {
      const surfaceY = sampleTerrainHeight(sx, sz)
      const shaftH = surfaceY - TUNNEL_DEPTH + 1
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, shaftH, 8),
        shaftMat
      )
      shaft.position.set(sx, (surfaceY + TUNNEL_DEPTH) / 2, sz)
      roadGroup.add(shaft)

      // 井口标记（地面小圆环）
      const ringGeo = new THREE.RingGeometry(0.2, 0.5, 16)
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = -Math.PI / 2
      ring.position.set(sx, surfaceY + 0.1, sz)
      roadGroup.add(ring)
    })

    scene.add(roadGroup)
  }

  // ─── 传感器标记 ───
  function createSensors(sensors: SensorData[]) {
    sensorMeshes.forEach((m) => { scene.remove(m); m.geometry.dispose(); (m.material as THREE.Material).dispose() })
    sensorGlows.forEach((m) => { scene.remove(m); m.geometry.dispose(); (m.material as THREE.Material).dispose() })
    labelSprites.forEach((s) => { scene.remove(s); (s.material as THREE.SpriteMaterial).map?.dispose(); s.material.dispose() })
    sensorMeshes = []
    sensorGlows = []
    labelSprites = []

    sensors.forEach((sensor) => {
      const statusColor = sensor.status === 'alarm' ? COLORS.sensorAlarm
        : sensor.status === 'warning' ? COLORS.sensorWarning
        : COLORS.sensorNormal

      // 传感器柱体（从地下巷道连到传感器位置）
      const TUNNEL_Y = -3
      const pillarTop = sensor.position[1]
      const pillarBottom = TUNNEL_Y
      const pillarHeight = pillarTop - pillarBottom
      const pillarGeo = new THREE.CylinderGeometry(0.04, 0.04, pillarHeight, 6)
      const pillarMat = new THREE.MeshBasicMaterial({
        color: SENSOR_TYPE_COLORS[sensor.type] || 0x3b82f6,
        transparent: true,
        opacity: 0.2,
      })
      const pillar = new THREE.Mesh(pillarGeo, pillarMat)
      pillar.position.set(sensor.position[0], pillarBottom + pillarHeight / 2, sensor.position[2])
      scene.add(pillar)

      // 传感器球体
      const geo = new THREE.SphereGeometry(0.35, 16, 16)
      const mat = new THREE.MeshPhysicalMaterial({
        color: statusColor,
        emissive: statusColor,
        emissiveIntensity: 0.6,
        roughness: 0.1,
        metalness: 0.9,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(...sensor.position)
      mesh.castShadow = true
      mesh.userData = { type: 'sensor', data: sensor }
      scene.add(mesh)
      sensorMeshes.push(mesh)

      // 外圈光晕
      const glowGeo = new THREE.SphereGeometry(0.7, 16, 16)
      const glowMat = new THREE.MeshBasicMaterial({
        color: statusColor,
        transparent: true,
        opacity: 0.1,
      })
      const glow = new THREE.Mesh(glowGeo, glowMat)
      glow.position.set(...sensor.position)
      scene.add(glow)
      sensorGlows.push(glow)

      // 文字标签
      if (showLabels.value) {
        const sprite = createTextSprite(`${sensor.name}\n${sensor.value}${sensor.unit}`, statusColor)
        sprite.position.set(sensor.position[0], sensor.position[1] + 1.5, sensor.position[2])
        scene.add(sprite)
        labelSprites.push(sprite)
      }
    })
  }

  // ─── 设施标注 ───
  function createFacilityLabels(facilities: FacilityLabel[]) {
    facilitySprites.forEach((s) => { scene.remove(s); (s.material as THREE.SpriteMaterial).map?.dispose(); s.material.dispose() })
    facilitySprites = []

    facilities.forEach((f) => {
      const color = f.type === 'building' ? COLORS.accentCyan
        : f.type === 'equipment' ? 0xf59e0b
        : f.type === 'zone' ? COLORS.accentBlue
        : COLORS.sensorNormal

      const sprite = createFacilitySprite(f.name, color)
      const terrainY = sampleTerrainHeight(f.position[0], f.position[2])
      sprite.position.set(f.position[0], Math.max(terrainY, 1) + 5, f.position[2])
      scene.add(sprite)
      facilitySprites.push(sprite)

      // 标注连线
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(f.position[0], Math.max(terrainY, 1) + 4, f.position[2]),
        new THREE.Vector3(f.position[0], Math.max(terrainY, 1) + 1, f.position[2]),
      ])
      const lineMat = new THREE.LineDashedMaterial({
        color: color,
        transparent: true,
        opacity: 0.35,
        dashSize: 0.5,
        gapSize: 0.3,
      })
      const line = new THREE.Line(lineGeo, lineMat)
      line.computeLineDistances()
      scene.add(line)
    })
  }

  // ─── 文字精灵（传感器标签） ───
  function createTextSprite(text: string, color: number): THREE.Sprite {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    canvas.width = 256
    canvas.height = 128

    ctx.fillStyle = 'rgba(4, 10, 24, 0.85)'
    ctx.beginPath()
    ctx.roundRect(4, 4, 248, 120, 8)
    ctx.fill()

    ctx.strokeStyle = `#${color.toString(16).padStart(6, '0')}`
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(4, 4, 248, 120, 8)
    ctx.stroke()

    const lines = text.split('\n')
    lines.forEach((line, i) => {
      ctx.fillStyle = i === 0 ? '#c0d0e8' : `#${color.toString(16).padStart(6, '0')}`
      ctx.font = i === 0 ? 'bold 20px sans-serif' : 'bold 24px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(line, 128, 52 + i * 38)
    })

    const texture = new THREE.CanvasTexture(canvas)
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.9 })
    const sprite = new THREE.Sprite(mat)
    sprite.scale.set(2.5, 1.25, 1)
    return sprite
  }

  // ─── 设施标注精灵 ───
  function createFacilitySprite(text: string, color: number): THREE.Sprite {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    canvas.width = 256
    canvas.height = 64

    ctx.fillStyle = 'rgba(4, 10, 24, 0.75)'
    ctx.beginPath()
    ctx.roundRect(8, 8, 240, 48, 6)
    ctx.fill()

    ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`
    ctx.fillRect(8, 8, 4, 48)

    ctx.fillStyle = '#d0e0f0'
    ctx.font = 'bold 22px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(text, 22, 40)

    const texture = new THREE.CanvasTexture(canvas)
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.9 })
    const sprite = new THREE.Sprite(mat)
    sprite.scale.set(4, 1, 1)
    return sprite
  }

  // ─── 粒子效果 ───
  function createParticles() {
    const count = 600
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80
      positions[i * 3 + 1] = 3 + Math.random() * 25
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const mat = new THREE.PointsMaterial({
      color: 0x6a9abf,
      size: 0.06,
      transparent: true,
      opacity: 0.25,
      sizeAttenuation: true,
    })

    particleSystem = new THREE.Points(geo, mat)
    scene.add(particleSystem)
  }

  // ─── 扫描线 ───
  function createScanLine() {
    const geo = new THREE.PlaneGeometry(80, 0.4)
    geo.rotateX(-Math.PI / 2)
    const mat = new THREE.MeshBasicMaterial({
      color: COLORS.accentCyan,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
    })
    scanLine = new THREE.Mesh(geo, mat)
    scanLine.position.set(0, 2, -40)
    scene.add(scanLine)
  }

  // ─── 动画循环 ───
  function animate() {
    animationId = requestAnimationFrame(animate)
    const elapsed = clock.getElapsedTime()
    controls.update()

    // 传感器光晕脉冲
    sensorGlows.forEach((glow, i) => {
      const scale = 1 + Math.sin(elapsed * 2 + i * 0.7) * 0.35
      glow.scale.set(scale, scale, scale)
      ;(glow.material as THREE.MeshBasicMaterial).opacity = 0.06 + Math.sin(elapsed * 2 + i * 0.7) * 0.05
    })

    // 报警传感器闪烁
    sensorMeshes.forEach((mesh) => {
      const data = mesh.userData.data as SensorData
      if (data?.status === 'alarm') {
        const flash = Math.sin(elapsed * 4 + mesh.id) * 0.5 + 0.5
        ;(mesh.material as THREE.MeshPhysicalMaterial).emissiveIntensity = 0.3 + flash * 0.7
      }
    })

    // 扫描线移动
    if (scanLine) {
      scanLine.position.z = -40 + (elapsed * 3) % 80
      ;(scanLine.material as THREE.MeshBasicMaterial).opacity = 0.08 + Math.sin(elapsed * 3) * 0.04
    }

    // 粒子漂浮
    if (particleSystem) {
      const pos = particleSystem.geometry.attributes.position
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i)
        y += Math.sin(elapsed * 0.3 + i * 0.1) * 0.004
        if (y > 28) y = 3
        pos.setY(i, y)
      }
      pos.needsUpdate = true
    }

    // 水面波动
    if (waterMesh) {
      const wPos = waterMesh.geometry.attributes.position
      for (let i = 0; i < wPos.count; i++) {
        const x = wPos.getX(i)
        const z = wPos.getZ(i)
        wPos.setY(i, Math.sin(x * 0.2 + elapsed * 0.6) * 0.12 + Math.cos(z * 0.15 + elapsed * 0.4) * 0.08)
      }
      wPos.needsUpdate = true
    }

    renderer.render(scene, camera)
  }

  // ─── 事件处理 ───
  function onResize() {
    if (!container.value) return
    const w = container.value.clientWidth
    const h = container.value.clientHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }

  function onCanvasClick(event: MouseEvent) {
    if (!container.value) return
    const rect = container.value.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(mouse, camera)

    const sensorHits = raycaster.intersectObjects(sensorMeshes)
    if (sensorHits.length > 0) {
      selectedSensor.value = sensorHits[0].object.userData.data as SensorData
      selectedFacility.value = null
      return
    }

    if (buildingGroup) {
      const buildingHits = raycaster.intersectObjects(buildingGroup.children.filter(c => c instanceof THREE.Mesh))
      if (buildingHits.length > 0) {
        const name = buildingHits[0].object.userData.name
        const facility = FACILITIES.find(f => f.name === name)
        if (facility) {
          selectedFacility.value = facility
          selectedSensor.value = null
          return
        }
      }
    }

    selectedSensor.value = null
    selectedFacility.value = null
  }

  function onCanvasMouseMove(event: MouseEvent) {
    if (!container.value) return
    const rect = container.value.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(mouse, camera)

    const sensorHits = raycaster.intersectObjects(sensorMeshes)
    const buildingHits = buildingGroup
      ? raycaster.intersectObjects(buildingGroup.children.filter(c => c instanceof THREE.Mesh))
      : []

    container.value.style.cursor = (sensorHits.length > 0 || buildingHits.length > 0) ? 'pointer' : 'default'
  }

  // ─── 公共 API ───
  function resetView() {
    restoreAllOpacity()
    currentView.value = 'overview'
    camera.position.copy(defaultCameraPos)
    controls.target.copy(defaultTarget)
    controls.minDistance = 10
    controls.maxDistance = 200
    controls.update()
  }

  function toggleWireframe() {
    isWireframe.value = !isWireframe.value
    if (terrainMesh) {
      terrainMesh.traverse((child) => {
        if (child instanceof THREE.LineSegments) {
          child.visible = isWireframe.value
        }
      })
    }
    if (buildingGroup) {
      buildingGroup.traverse((child) => {
        if (child instanceof THREE.LineSegments) {
          child.visible = isWireframe.value
        }
      })
    }
  }

  function toggleLabels() {
    showLabels.value = !showLabels.value
    labelSprites.forEach((s) => { s.visible = showLabels.value })
    facilitySprites.forEach((s) => { s.visible = showLabels.value })
  }

  // ─── 视图切换辅助：恢复所有元素到默认不透明度 ───
  function restoreAllOpacity() {
    if (terrainMesh) {
      terrainMesh.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.opacity = 1.0
          child.material.transparent = false
          child.material.needsUpdate = true
        }
      })
    }
    if (waterMesh) {
      (waterMesh.material as THREE.MeshStandardMaterial).opacity = 0.6
      ;(waterMesh.material as THREE.MeshStandardMaterial).transparent = true
    }
    if (buildingGroup) {
      buildingGroup.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.opacity = 1.0
          child.material.transparent = false
          child.material.needsUpdate = true
        }
        if (child instanceof THREE.LineSegments && child.material instanceof THREE.LineBasicMaterial) {
          child.material.opacity = 0.35
        }
      })
    }
    if (roadGroup) {
      roadGroup.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          // 区分巷道箱体(0.85)和竖井(0.6)
          child.material.opacity = child.geometry instanceof THREE.BoxGeometry ? 0.85 : 0.6
          child.material.transparent = true
          child.material.needsUpdate = true
        }
        if (child instanceof THREE.LineSegments && child.material instanceof THREE.LineBasicMaterial) {
          child.material.opacity = 0.15
        }
        if (child instanceof THREE.Line && child.material instanceof THREE.LineBasicMaterial) {
          child.material.opacity = 0.25
        }
      })
    }
    if (treeGroup) {
      treeGroup.visible = true
    }
    // 传感器恢复默认大小
    sensorMeshes.forEach((m) => { m.scale.set(1, 1, 1) })
    sensorGlows.forEach((g) => { g.scale.set(1, 1, 1); (g.material as THREE.MeshBasicMaterial).opacity = 0.1 })
    // 标签恢复
    labelSprites.forEach((s) => { s.visible = showLabels.value; s.scale.set(4, 2, 1) })
    facilitySprites.forEach((s) => { s.visible = showLabels.value })
    // 雾恢复
    scene.fog = new THREE.FogExp2(0x1a2a3a, 0.002)
  }

  function setView(view: 'overview' | 'tunnel' | 'sensor') {
    currentView.value = view
    restoreAllOpacity()

    if (view === 'overview') {
      // ─── 全景：高空俯瞰整个矿区 ───
      camera.position.set(80, 45, 80)
      controls.target.set(0, 2, 0)
      controls.minDistance = 30
      controls.maxDistance = 200
      // 所有元素正常显示，标签显示
      labelSprites.forEach((s) => { s.visible = true })
      facilitySprites.forEach((s) => { s.visible = true })

    } else if (view === 'tunnel') {
      // ─── 巷道：透视地表观察地下巷道网络 ───
      camera.position.set(20, 12, 25)
      controls.target.set(0, -2, -5)
      controls.minDistance = 5
      controls.maxDistance = 80
      // 地形半透明（可透视到地下巷道）
      if (terrainMesh) {
        terrainMesh.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.transparent = true
            child.material.opacity = 0.18
            child.material.needsUpdate = true
          }
        })
      }
      // 建筑半透明
      if (buildingGroup) {
        buildingGroup.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.transparent = true
            child.material.opacity = 0.15
            child.material.needsUpdate = true
          }
          if (child instanceof THREE.LineSegments && child.material instanceof THREE.LineBasicMaterial) {
            child.material.opacity = 0.1
          }
        })
      }
      // 树木隐藏
      if (treeGroup) { treeGroup.visible = false }
      // 巷道高亮（提高不透明度 + 边缘发光增强）
      if (roadGroup) {
        roadGroup.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.opacity = child.geometry instanceof THREE.BoxGeometry ? 0.95 : 0.8
            child.material.needsUpdate = true
          }
          if (child instanceof THREE.LineSegments && child.material instanceof THREE.LineBasicMaterial) {
            child.material.opacity = 0.4
          }
          if (child instanceof THREE.Line && child.material instanceof THREE.LineBasicMaterial) {
            child.material.opacity = 0.5
          }
        })
      }
      // 传感器淡化
      sensorMeshes.forEach((m) => { m.scale.set(0.6, 0.6, 0.6) })
      sensorGlows.forEach((g) => { (g.material as THREE.MeshBasicMaterial).opacity = 0.03 })
      labelSprites.forEach((s) => { s.visible = false })
      facilitySprites.forEach((s) => { s.visible = false })
      // 减少雾
      scene.fog = new THREE.FogExp2(0x1a2a3a, 0.001)

    } else if (view === 'sensor') {
      // ─── 传感器：聚焦传感器集群，突出显示 ───
      camera.position.set(25, 22, 20)
      controls.target.set(0, 14, 0)
      controls.minDistance = 8
      controls.maxDistance = 60
      // 传感器放大 + 光晕增强
      sensorMeshes.forEach((m) => { m.scale.set(1.8, 1.8, 1.8) })
      sensorGlows.forEach((g) => { g.scale.set(2.0, 2.0, 2.0); (g.material as THREE.MeshBasicMaterial).opacity = 0.25 })
      // 强制显示所有传感器标签（放大）
      labelSprites.forEach((s) => { s.visible = true; s.scale.set(5, 2.5, 1) })
      facilitySprites.forEach((s) => { s.visible = false })
      // 地形和建筑淡化
      if (terrainMesh) {
        terrainMesh.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.transparent = true
            child.material.opacity = 0.4
            child.material.needsUpdate = true
          }
        })
      }
      if (buildingGroup) {
        buildingGroup.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.transparent = true
            child.material.opacity = 0.2
            child.material.needsUpdate = true
          }
          if (child instanceof THREE.LineSegments && child.material instanceof THREE.LineBasicMaterial) {
            child.material.opacity = 0.08
          }
        })
      }
      if (treeGroup) { treeGroup.visible = false }
      // 巷道淡化
      if (roadGroup) {
        roadGroup.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.opacity = 0.1
            child.material.needsUpdate = true
          }
          if (child instanceof THREE.LineSegments && child.material instanceof THREE.LineBasicMaterial) {
            child.material.opacity = 0.03
          }
          if (child instanceof THREE.Line && child.material instanceof THREE.LineBasicMaterial) {
            child.material.opacity = 0.05
          }
        })
      }
      scene.fog = new THREE.FogExp2(0x1a2a3a, 0.002)
    }

    controls.update()
  }

  // ─── 生命周期 ───
  onMounted(() => {
    initScene()
  })

  onBeforeUnmount(() => {
    cancelAnimationFrame(animationId)
    window.removeEventListener('resize', onResize)
    container.value?.removeEventListener('click', onCanvasClick)
    container.value?.removeEventListener('mousemove', onCanvasMouseMove)
    renderer?.dispose()
    controls?.dispose()
    if (renderer?.domElement && container.value) {
      container.value.removeChild(renderer.domElement)
    }
  })

  return {
    resetView,
    toggleWireframe,
    toggleLabels,
    setView,
    isWireframe,
    showLabels,
    currentView,
    selectedSensor,
    selectedFacility,
  }
}
