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
    this.metadata = metaData
    // 存储所有地图tile的3D对象
    this.tiles = []
    // 存储草地对象
    this.grassRows = []
    // 存储树对象
    this.treeRows = []

    // 初始化地图
    this.initializeMap()

    // Debug 面板
    if (this.debug.active) {
      this.debugInit()
    }
  }

  // 初始化地图内容
  initializeMap() {
    this.addGrassRow(-5)
    this.addGrassRow(-4)
    this.addGrassRow(-3)
    this.addGrassRow(-2)
    this.addGrassRow(-1)

    // 使用 forEach 遍历所有行
    this.metadata.forEach((rowData, rowIndex) => {
      // 先生成草地
      this.addGrassRow(rowIndex)
      // 如果是森林行，添加树
      if (rowData && rowData.type === 'forest') {
        this.addTreeRow(rowData.trees, rowIndex)
      }
    })
  }

  // 添加一行草地
  addGrassRow(rowIndex = 0) {
    const grass = new Grass(this.scene, this.resources, rowIndex)
    this.grassRows.push(grass)
    this.tiles.push(...grass.tiles)
  }

  // 添加一行树
  addTreeRow(trees, rowIndex) {
    const treeRow = new Tree(this.scene, this.resources, trees, rowIndex)
    this.treeRows.push(treeRow)
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
    // 移除所有树对象
    this.treeRows.forEach(treeRow => treeRow.remove())
    this.treeRows = []
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
