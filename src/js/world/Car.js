import { CAR_BOUNDARY_MAX, CAR_BOUNDARY_MIN, CLOCK_EFFECT_DURATION_MS, TIME_MULTIPLIER } from '../constants.js'
import Experience from '../experience'

export default class Car {
  /**
   * @param {THREE.Scene} scene - threejs场景
   * @param {object} resources - 资源加载器实例
   * @param {Array} vehicles - 当前行的车辆数组，每项包含 initialTileIndex 和 type
   * @param {number} rowIndex - 当前行的z坐标
   * @param {boolean} direction - 车辆方向，true 向右，false 向左
   * @param {number} speed - 车辆速度
   */
  constructor(scene, resources, vehicles, rowIndex = 0, direction = false, speed = 1) {
    this.experience = new Experience()
    this.scene = scene
    this.resources = resources
    this.time = this.experience.time
    this.vehicles = vehicles
    this.rowIndex = rowIndex
    this.direction = direction
    this.speed = speed
    this.timeMultiplier = 1
    this.carMeshes = []
    // 记录每辆车的初始y坐标和抖动相位
    this.carShakeParams = []
    this.addCars()

    // 标记当前页面是否处于激活状态（可见）
    this.isActive = true
    // 绑定事件监听，检测页面可见性变化
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this))

    this.experience.on('itemCollected', this.applyClockEffect.bind(this))
  }

  // 处理页面可见性变化
  handleVisibilityChange() {
    // document.visibilityState === 'visible' 时页面可见，否则不可见
    this.isActive = document.visibilityState === 'visible'
  }

  // 添加所有车辆到当前行
  addCars() {
    this.vehicles.forEach((carData, _idx) => {
      const { initialTileIndex, type } = carData
      // 获取对应类型的车辆模型
      const carResource = this.resources.items[type]
      if (!carResource) {
        console.warn(`未找到资源: ${type}`)
        return
      }
      // 克隆车辆模型
      const carMesh = carResource.scene.clone()
      carMesh.scale.set(0.5, 0.5, 0.5)
      // 递归设置所有 mesh 可投射阴影
      carMesh.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true // 车辆产生阴影
        }
      })
      // 设置车辆位置（x轴为tileIndex*4，z轴为rowIndex）
      carMesh.position.set(initialTileIndex, 0.35, this.rowIndex)
      // 设置车辆朝向
      if (this.direction) {
        carMesh.rotation.y = 0 // 向右
      }
      else {
        carMesh.rotation.y = Math.PI // 向左
      }
      // 添加到场景
      this.scene.add(carMesh)
      // 存储车辆对象，便于后续移除和动画
      this.carMeshes.push(carMesh)

      // 记录每辆车的初始y坐标和抖动相位（相位随机，避免同步）
      this.carShakeParams.push({
        baseY: carMesh.position.y,
        phase: Math.random() * Math.PI * 2,
      })
    })
  }

  // 新增：获取当前行所有车辆mesh
  getCarMeshes() {
    return this.carMeshes
  }

  // 移除所有车辆
  remove() {
    this.carMeshes.forEach((car) => {
      this.scene.remove(car)
    })
    this.carMeshes = []
  }

  // 更新车辆位置（可用于动画）
  update() {
    // 只有页面可见时才进行车辆位置更新，节省资源
    if (!this.isActive)
      return
    // 获取全局已用时间，单位ms，转为秒
    const t = this.time.elapsed * 0.03 * this.timeMultiplier
    this.carMeshes.forEach((car, idx) => {
      // 车辆移动方向
      const dir = this.direction ? 1 : -1
      car.position.x += dir * this.speed * this.time.delta * 1 / 60 * 0.23 * this.timeMultiplier

      // 边界判断与循环
      if (dir === 1 && car.position.x > CAR_BOUNDARY_MAX) {
        car.position.x = CAR_BOUNDARY_MIN
      }
      else if (dir === -1 && car.position.x < CAR_BOUNDARY_MIN) {
        car.position.x = CAR_BOUNDARY_MAX
      }
      // === 车身抖动：模拟不平路面 ===
      // 抖动参数
      const shake = this.carShakeParams[idx]
      // 叠加两组不同频率的正弦波，幅度小
      const freq1 = 2.5
      const amp1 = 0.02
      const freq2 = 4.3
      const amp2 = 0.01
      // 计算抖动偏移
      const offsetY = Math.sin(t * freq1 + shake.phase) * amp1 + Math.cos(t * freq2 + shake.phase * 1.3) * amp2
      car.position.y = shake.baseY + offsetY
    })
  }

  applyClockEffect(itemType) {
    if (itemType !== 'clock')
      return
    // 先清除已有定时器，避免叠加
    if (this.clockTimeout) {
      clearTimeout(this.clockTimeout)
    }
    this.timeMultiplier = TIME_MULTIPLIER
    // CLOCK_EFFECT_DURATION_MS毫秒后恢复
    this.clockTimeout = setTimeout(() => {
      this.timeMultiplier = 1
      this.clockTimeout = null
    }, CLOCK_EFFECT_DURATION_MS)
  }
}
