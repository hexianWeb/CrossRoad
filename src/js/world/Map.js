// 引入 Experience 单例和常量
import Experience from '../experience.js'
import Grass from './Grass.js'
import metaData from './metaData.js'
import Tree from './Tree.js'

export default class Map {
  constructor() {
    // 获取 Experience 单例
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.debug = this.experience.debug

    // 地图元数据（可扩展）
    this.metadata = []
    // 存储所有地图tile的3D对象
    this.tiles = []
    // 存储草地对象
    this.grassRows = []

    // 初始化地图
    this.initializeMap()

    // Debug 面板
    if (this.debug.active) {
      this.debugInit()
    }
  }

  // 初始化地图内容
  initializeMap() {
    // 这里只生成一行草地，后续可扩展
    this.addGrassRow(0)
    const rowData = metaData[0]
    if (rowData.type === 'forest') {
      this.trees = new Tree(this.scene, this.resources, rowData.trees, 0)
    }
  }

  // 添加一行草地
  addGrassRow(rowIndex = 0) {
    const grass = new Grass(this.scene, this.resources, rowIndex)
    this.grassRows.push(grass)
    this.tiles.push(...grass.tiles)
  }

  // 扩展地图（可根据需要实现）
  extendMap(_newMetadata) {
    // TODO: 扩展地图逻辑
  }

  // 重置地图
  resetMap() {
    // 移除所有tile
    this.tiles.forEach((tile) => {
      this.scene.remove(tile)
    })
    this.tiles = []
    // 移除所有草地对象
    this.grassRows.forEach(grass => grass.remove())
    this.grassRows = []
    // 重新初始化
    this.initializeMap()
  }

  // Debug 面板
  debugInit() {
    this.debugFolder = this.debug.ui.addFolder({
      title: '地图控制',
      expanded: true,
    })
    this.debugFolder.addButton({
      title: '重置地图',
      label: '重置地图',
      onClick: () => this.resetMap(),
    })
  }
}
