import { CAR_BOUNDARY_MAX, CAR_BOUNDARY_MIN } from '../constants.js'
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
    this.carMeshes = []
    this.addCars()
  }

  // 添加所有车辆到当前行
  addCars() {
    this.vehicles.forEach((carData) => {
      const { initialTileIndex, type } = carData
      // 获取对应类型的车辆模型
      const carResource = this.resources.items[type]
      if (!carResource) {
        console.warn(`未找到资源: ${type}`)
        return
      }
      // 克隆车辆模型
      const carMesh = carResource.scene.clone()
      // 递归设置所有 mesh 可投射阴影
      carMesh.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true // 车辆产生阴影
        }
      })
      // 设置车辆位置（x轴为tileIndex*4，z轴为rowIndex）
      carMesh.position.set(initialTileIndex * 4, 0.5, this.rowIndex)
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
    })
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
    this.carMeshes.forEach((car) => {
      // 车辆移动方向
      const dir = this.direction ? 1 : -1
      car.position.x += dir * this.speed * this.time.delta * 1 / 60
      // 边界判断与循环
      if (dir === 1 && car.position.x > CAR_BOUNDARY_MAX) {
        car.position.x = CAR_BOUNDARY_MIN
      }
      else if (dir === -1 && car.position.x < CAR_BOUNDARY_MIN) {
        car.position.x = CAR_BOUNDARY_MAX
      }
    })
  }
}
