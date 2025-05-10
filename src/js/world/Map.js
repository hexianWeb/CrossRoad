// 引入 Experience 单例和常量
import { GENERATION_COUNT } from '../constants.js'
import Experience from '../experience.js'
import Car from './Car.js'
import Grass from './Grass.js'
import ItemManager from './ItemManager.js'
import metaData from './metaData.js'
import Road from './Road.js'
import generateMetaRows from './tool.js'
import Tree from './Tree.js'

export default class Map {
  constructor() {
    // 获取 Experience 单例
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.debug = this.experience.debug
    this.rowIndex = 0

    // 地图元数据（可扩展 深拷贝）
    this.metadata = JSON.parse(JSON.stringify(metaData))
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
    // 新增：行号到车辆mesh数组的映射
    this.carMeshDict = {}
    // 新增：道具管理器
    this.itemManager = new ItemManager()

    // 初始化地图
    this.initializeMap()

    // Debug 面板
    if (this.debug.active) {
      this.debugInit()
    }
  }

  // 初始化地图内容
  initializeMap() {
    // 重置 rowIndex
    this.rowIndex = 0
    this.addGrassRow(-5)
    this.addGrassRow(-4)
    this.addGrassRow(-3)
    this.addGrassRow(-2)
    this.addGrassRow(-1)
    this.addGrassRow(0)
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
        this.addCarRow(rowData.vehicles, this.rowIndex, rowData.direction, rowData.speed)
      }
      // 新增：生成道具
      if (rowData.items && rowData.items.length > 0) {
        this.itemManager.addItems(rowData.items, this.rowIndex)
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
    // 新增：记录每行车辆mesh
    this.carMeshDict[rowIndex] = carRow.getCarMeshes()
  }

  // 扩展地图，生成并渲染新行
  extendMap(N = 10) {
    const startRowIndex = this.metadata.length
    const newRows = generateMetaRows(startRowIndex, N)
    this.metadata.push(...newRows)

    // 渲染新行
    newRows.forEach((rowData) => {
      this.rowIndex++
      if (rowData.type === 'forest') {
        this.addGrassRow(this.rowIndex)
        this.addTreeRow(rowData.trees, this.rowIndex)
      }
      if (rowData.type === 'road') {
        this.addRoadRow(this.rowIndex)
        this.addCarRow(rowData.vehicles, this.rowIndex, rowData.direction, rowData.speed)
      }
      // 新增：生成道具
      if (rowData.items && rowData.items.length > 0) {
        this.itemManager.addItems(rowData.items, this.rowIndex)
      }
    })
  }

  // 检查玩家距离地图末尾距离，自动扩展
  checkAndExtendMap(userZ) {
    // userZ 为玩家当前 z 坐标（负数，越小越远）
    const remainRows = this.metadata.length - Math.abs(userZ)
    if (remainRows < GENERATION_COUNT) {
      this.extendMap(GENERATION_COUNT)
    }
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
    if (this.itemManager) {
      this.itemManager.update()
    }
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
    this.debugFolder.addButton({
      title: '扩展地图',
      label: '扩展地图',
      onClick: () => this.extendMap(GENERATION_COUNT),
    })
  }

  // 新增：获取指定行的车辆mesh数组
  getCarMeshesByRow(rowIndex) {
    return this.carMeshDict[rowIndex] || []
  }
}
