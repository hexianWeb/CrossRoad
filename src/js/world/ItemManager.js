import Float from '../components/float.js'
import Experience from '../experience.js'

// 简单道具类型常量
export const ITEM_TYPES = {
  CLOCK: 'clock', // 时停表
  RANDOM: 'random', // 随机箱
  SHEID: 'sheid', // 无敌盾
  SHOE: 'shoe', // 加速鞋
}

export default class ItemManager {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    // 存储所有道具对象及其 tile 位置
    this.items = []
    // 新增：存储所有 Float 实例
    this.floats = []
  }

  // 新增：批量生成道具（支持模型资源）
  addItems(items, rowIndex) {
    if (!Array.isArray(items))
      return
    items.forEach(({ tileIndex, type }) => {
      let mesh
      // 判断是否有对应模型资源
      if ([ITEM_TYPES.CLOCK, ITEM_TYPES.RANDOM, ITEM_TYPES.SHEID, ITEM_TYPES.SHOE].includes(type) && this.resources.items[type]) {
        // 克隆模型
        const gltf = this.resources.items[type]
        mesh = gltf.scene ? gltf.scene.clone(true) : gltf.clone(true)
        mesh.scale.set(0.3, 0.3, 0.3)
        mesh.position.set(0, 0.5, 0) // 交由 Float 控制位置
        // 用 Float 包裹
        const float = new Float({ floatIntensity: 1, rotationIntensity: 1, rotationSpeed: 0.02 })
        float.group.position.set(tileIndex, 0, rowIndex)
        float.add(mesh)
        float.group.userData = { type, tile: { x: tileIndex, z: rowIndex } }
        this.floats.push(float)
        this.items.push(float.group)
      }
    })
  }

  // 检查主角是否到达道具 tile
  checkUserTile(userTile) {
    for (let i = 0; i < this.items.length; i++) {
      const mesh = this.items[i] // 现在 mesh 就是 float.group
      const { x, z } = mesh.userData.tile
      if (userTile.x === x && userTile.z === z) {
        let itemType = mesh.userData.type
        // 如果是随机箱，则随机分配一种道具（排除 random 本身）
        if (itemType === ITEM_TYPES.RANDOM) {
          // 获取所有可用道具类型，排除 random
          const availableTypes = Object.values(ITEM_TYPES).filter(type => type !== ITEM_TYPES.RANDOM)
          // 随机选一个
          itemType = availableTypes[Math.floor(Math.random() * availableTypes.length)]
        }
        // 触发道具事件，传递实际分配的类型
        this.experience.trigger('itemCollected', [itemType])
        // 移除道具
        this.scene.remove(mesh)
        this.items.splice(i, 1)
        return itemType
      }
    }
    return null
  }

  update() {
    this.floats.forEach((float) => {
      float.update()
    })
  }

  clear() {
    // 移除所有 Float group（道具 mesh）
    this.floats.forEach((float) => {
      this.scene.remove(float.group)
    })
    this.items = []
    this.floats = []
  }
}
