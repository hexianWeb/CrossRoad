import * as THREE from 'three'

import Experience from '../experience.js'
import Environment from './environment.js'
import ItemManager, { ITEM_TYPES } from './ItemManager.js'
import Map from './Map.js'
import User from './User.js'

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.camera = this.experience.camera
    this.resources = this.experience.resources

    // Environment
    this.resources.on('ready', () => {
      // Setup
      this.environment = new Environment()
      this.map = new Map()
      this.user = new User()
      this.itemManager = new ItemManager()
      // 相机只跟随 user 的 agentGroup 水平移动
      this.user.agentGroup.add(this.camera.instance)
      this.user.agentGroup.add(this.environment.sunLight)

      this.experience.on('restart', () => {
        this.onGameOver()
      })

      // 监听道具拾取事件
      this.experience.on('itemCollected', (type) => {
        // 简单分数加成和提示
        let addScore = 0
        if (type === ITEM_TYPES.RED)
          addScore = 5
        if (type === ITEM_TYPES.GREEN)
          addScore = 10
        if (type === ITEM_TYPES.BLUE)
          addScore = 20
        if (addScore > 0) {
          // 触发分数事件
          this.experience.trigger('scoreUpdate', [this.user.maxZ + addScore])
          console.warn(`[道具] 拾取${type}道具，分数+${addScore}`)
        }
        else {
          console.warn(`[道具] 拾取${type}道具`)
        }
      })
    })
  }

  update() {
    if (this.map) {
      this.map.update()
      if (this.user) {
        this.map.checkAndExtendMap(this.user.currentTile.z)
        // === 碰撞检测 ===
        // 获取玩家mesh和所在行
        const playerMesh = this.user.instance
        if (playerMesh) {
          const playerRow = this.user.currentTile.z
          const carMeshes = this.map.getCarMeshesByRow(playerRow)
          if (carMeshes.length > 0) {
            // 构建玩家包围盒
            const playerBox = new THREE.Box3().setFromObject(playerMesh)
            for (const carMesh of carMeshes) {
              const carBox = new THREE.Box3().setFromObject(carMesh)
              if (playerBox.intersectsBox(carBox)) {
                this.onGameOver()
              }
            }
          }
        }
        // === 检查道具拾取 ===
        if (this.itemManager) {
          this.itemManager.checkUserTile(this.user.currentTile)
        }
      }
    }
    if (this.user) {
      this.camera.instance.lookAt(this.user.agentGroup.position)
      this.environment.sunLight.target.position.copy(this.user.agentGroup.position)
      this.user.update()
    }
  }

  // 游戏结束处理方法
  onGameOver() {
    // 这里可以自定义游戏结束逻辑，比如弹窗、重置、跳转等
    // 目前简单用alert
    this.map.resetMap()
    // TODO: 可扩展为更优雅的UI提示或重置逻辑
    this.user.reset()
  }
}
