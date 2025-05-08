// 引入 Experience 单例
// import Experience from '../experience.js'

import { minTileIndex, tilesPerRow } from '../constants.js'

export default class Road {
  /**
   * 创建一行道路
   * @param {THREE.Scene} scene - three.js 场景对象
   * @param {Resources} resources - 资源加载器实例
   * @param {number} rowIndex - 行索引，用于定位道路位置
   */
  constructor(scene, resources, rowIndex = 0) {
    this.scene = scene
    this.resources = resources
    this.rowIndex = rowIndex
    this.tiles = []
    this.createRoadRow()
  }

  // 生成一行道路
  createRoadRow() {
    // 获取 road 资源
    const roadResource = this.resources.items.road
    if (!roadResource) {
      console.warn('未找到 road 资源')
      return
    }
    for (let i = 0; i < tilesPerRow; i++) {
      const tileIndex = minTileIndex + i
      // 克隆道路模型
      const roadMesh = roadResource.scene.clone()
      // 递归设置所有 mesh 可接收阴影
      roadMesh.traverse((child) => {
        if (child.isMesh) {
          child.receiveShadow = true // 道路接收阴影
        }
      })
      // 设置道路在世界坐标中的位置
      roadMesh.position.set(tileIndex * 4, 0, this.rowIndex)
      // 可根据需要调整缩放、旋转等
      roadMesh.scale.set(1, 1, 1)
      this.scene.add(roadMesh)
      this.tiles.push(roadMesh)
    }
  }

  // 移除道路
  remove() {
    this.tiles.forEach((tile) => {
      this.scene.remove(tile)
    })
    this.tiles = []
  }
}
