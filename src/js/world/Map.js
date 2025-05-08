// 引入 Experience 单例和常量
import Experience from '../experience.js'
import Car from './Car.js'
import Grass from './Grass.js'
import metaData from './metaData.js'
import Road from './Road.js'
import Tree from './Tree.js'

export default class Map {
  constructor() {
    // 获取 Experience 单例
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.debug = this.experience.debug
    this.rowIndex = -1

    // 地图元数据（可扩展）
    this.metadata = metaData
    // 存储所有地图tile的3D对象
    this.tiles = []
    // 存储草地对象
    this.grassRows = []
    // 存储树对象
    this.treeRows = []
    // 存储道路对象
    this.roadRows = []
    // 存储车辆对象
    this.carRows = []

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
    this.metadata.forEach((rowData) => {
      this.rowIndex++
      // 如果是森林行，添加树
      if (rowData && rowData.type === 'forest') {
        // 先生成草地
        this.addGrassRow(this.rowIndex)
        this.addTreeRow(rowData.trees, this.rowIndex)
      }
      if (rowData && rowData.type === 'road') {
        this.addRoadRow(this.rowIndex)
        // this.addRoadRow(++this.rowIndex)
        this.addCarRow(rowData.vehicles, this.rowIndex, rowData.direction, rowData.speed)
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

  // 添加一行道路
  addRoadRow(rowIndex = 0) {
    const road = new Road(this.scene, this.resources, rowIndex)
    this.roadRows.push(road)
  }

  // 添加一行车辆
  addCarRow(vehicles, rowIndex = 0, direction = false, speed = 1) {
    const carRow = new Car(this.scene, this.resources, vehicles, rowIndex, direction, speed)
    this.carRows.push(carRow)
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
    // 移除所有道路对象
    this.roadRows.forEach(road => road.remove())
    this.roadRows = []
    // 移除所有车辆对象
    this.carRows.forEach(carRow => carRow.remove())
    this.carRows = []
    // 重新初始化
    this.initializeMap()
  }

  update() {
    this.carRows.forEach((carRow) => {
      carRow.update()
    })
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
