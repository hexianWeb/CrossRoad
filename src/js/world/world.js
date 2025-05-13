import * as THREE from 'three'

import { CLOCK_EFFECT_DURATION_MS, SHEID_EFFECT_DURATION_MS, SHOE_EFFECT_DURATION_MS, SUPABASE_TABLE } from '../constants.js'
import Experience from '../experience.js'
import { showItemEffectMask } from '../utils/itemEffectMask.js'
import { supabase } from '../utils/supabase.js'
import Environment from './environment.js'
import { ITEM_TYPES } from './ItemManager.js'
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
      this.itemManager = this.map.itemManager
      // 相机只跟随 user 的 agentGroup 水平移动
      this.user.agentGroup.add(this.camera.instance)
      this.user.agentGroup.add(this.environment.sunLight)

      this.experience.on('restart', () => {
        this.onRestart()
      })

      // 监听道具拾取事件
      this.experience.on('itemCollected', (type) => {
        // 简单分数加成和提示
        let addScore = 0
        switch (type) {
          case ITEM_TYPES.RANDOM:
            addScore = 1
            break
          case ITEM_TYPES.SHOE:
            addScore = 2
            break
          case ITEM_TYPES.CLOCK:
            addScore = 3
            break
          case ITEM_TYPES.SHEID:
            addScore = 4
            break
        }

        if (addScore > 0) {
          // 只触发 itemScore 事件
          this.experience.trigger('itemScore', [addScore])
          console.warn(`[道具] 拾取${type}道具，分数+${addScore}`)
        }
        else {
          console.warn(`[道具] 拾取${type}道具`)
        }

        // === 新增：道具遮罩效果 ===
        let duration = 0
        switch (type) {
          case ITEM_TYPES.SHOE:
            duration = SHOE_EFFECT_DURATION_MS
            break
          case ITEM_TYPES.CLOCK:
            duration = CLOCK_EFFECT_DURATION_MS
            break
          case ITEM_TYPES.SHEID:
            duration = SHEID_EFFECT_DURATION_MS
            break
          default:
            duration = 3000 // 默认3秒
        }
        showItemEffectMask(type, duration)

        if (type === ITEM_TYPES.SHEID && this.user) {
          // 3秒无敌
          this.user.setInvincible(true, SHEID_EFFECT_DURATION_MS)
          // 可选：提示无敌状态
          console.warn('[道具] 获得无敌盾，小鸡无敌3秒')
        }

        if (type === ITEM_TYPES.SHOE && this.user) {
          this.user.setSpeedUp(true, SHOE_EFFECT_DURATION_MS)
          console.warn('[道具] 获得加速鞋，小鸡加速5秒')
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
                if (!this.user.isInvincible) {
                  this.onGameOver()
                }
                else {
                  // 可选：无敌时碰撞提示
                  // console.log('无敌中，碰撞无效')
                }
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
  async onGameOver() {
    this.experience.trigger('restart')
    const username = localStorage.getItem('username') || '匿名'
    const score = this.user.maxZ || 0
    try {
      await supabase.from(SUPABASE_TABLE).insert([{ username, score }])
    }
    catch (e) {
      console.warn('分数上传失败', e)
    }
  }

  async onRestart() {
    this.map.resetMap()
    this.user.reset()
  }
}
