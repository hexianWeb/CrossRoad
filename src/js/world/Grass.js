import { minTileIndex, tilesPerRow } from '../constants.js'

export default class Grass {
  constructor(scene, resources, rowIndex = 0) {
    this.scene = scene
    this.resources = resources
    this.rowIndex = rowIndex
    this.tiles = []
    this.createGrassRow()
  }

  // 生成一行草地
  createGrassRow() {
    // 获取 tile 资源（假设资源名为 'grass'，如有不同请调整）
    const tileResource = this.resources.items.grassLong
    // tileResource.scene.scale.set(6.28, 6.28, 6.28)
    tileResource.scene.updateMatrixWorld()
    if (!tileResource) {
      console.warn('未找到 grass 资源')
      return
    }
    for (let i = 0; i < tilesPerRow; i++) {
      // 计算当前tile的地图下标
      const tileIndex = minTileIndex + i
      // 克隆tile模型
      const tileMesh = tileResource.scene.clone()
      // 设置tile在世界坐标中的位置
      tileMesh.position.set(tileIndex * 4, 0, this.rowIndex)
      // 添加到场景
      this.scene.add(tileMesh)
      // 存储tile对象
      this.tiles.push(tileMesh)
    }
  }

  // 移除草地
  remove() {
    this.tiles.forEach((tile) => {
      this.scene.remove(tile)
    })
    this.tiles = []
  }
}
