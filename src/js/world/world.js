import * as THREE from 'three'

import { CLOCK_EFFECT_DURATION_MS, SHEID_EFFECT_DURATION_MS, SHOE_EFFECT_DURATION_MS, SUPABASE_TABLE } from '../constants.js'
import Experience from '../experience.js'
import { showItemEffectMask } from '../utils/itemEffectMask.js'
import { supabase } from '../utils/supabase.js'
import Environment from './environment.js'
import { ITEM_TYPES } from './ItemManager.js'
import Map from './Map.js'
import { debounce } from './tool.js'
import User from './User.js'

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.camera = this.experience.camera
    this.resources = this.experience.resources

    // 游戏结束防抖标志
    this.isGameOver = false

    // 上传分数方法防抖
    this.uploadScore = debounce(this.uploadScore.bind(this), 1000)

    // 资源加载完成后初始化世界
    this.resources.on('ready', () => this.initializeWorld())
  }

  // 初始化方法，拆分各部分初始化逻辑
  initializeWorld() {
    this.setupSceneComponents()
    this.setupEventListeners()
  }

  // 场景组件初始化
  setupSceneComponents() {
    // 初始化环境、地图、用户
    this.environment = new Environment()
    this.map = new Map()
    this.user = new User()
    this.itemManager = this.map.itemManager
    // 相机和光照跟随用户
    this.user.agentGroup.add(this.camera.instance)
    this.user.agentGroup.add(this.environment.sunLight)
  }

  // 事件监听初始化
  setupEventListeners() {
    // 监听游戏重启事件
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
          this.user.setSpeedUp(true, SHOE_EFFECT_DURATION_MS)
          console.warn('[道具] 获得加速鞋，小鸡加速5秒')
          break
        case ITEM_TYPES.CLOCK:
          duration = CLOCK_EFFECT_DURATION_MS
          break
        case ITEM_TYPES.SHEID:
          duration = SHEID_EFFECT_DURATION_MS
          // 3秒无敌
          this.user.setInvincible(true, SHEID_EFFECT_DURATION_MS)
          // 可选：提示无敌状态
          console.warn('[道具] 获得无敌盾，小鸡无敌3秒')
          break
        default:
          duration = SHEID_EFFECT_DURATION_MS // 默认3秒
      }
      showItemEffectMask(type, duration)
    })
  }

  update() {
    // 如果游戏已结束，直接返回，防止继续执行 update 逻辑
    if (this.map) {
      this.map.update()
      if (this.user && !this.isGameOver) {
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
        this.user.update()
      }
    }
    if (this.user) {
      // === 相机和光照跟随 ===
      this.camera.instance.lookAt(this.user.agentGroup.position)
      this.environment.sunLight.target.position.copy(this.user.agentGroup.position)
    }
  }

  // 新增上传分数方法
  async uploadScore(score) {
    const username = localStorage.getItem('username') || 'unknown'
    try {
      await supabase.from(SUPABASE_TABLE).insert([{ username, score }])
    }
    catch (e) {
      console.warn('分数上传失败', e)
    }
  }

  // 游戏结束处理方法，增加防抖
  async onGameOver() {
    if (this.isGameOver)
      return
    // 让小鸡呈现压扁状态
    this.user.instance.scale.set(0.3, 0.1, 0.3)
    this.isGameOver = true
    // 暂停游戏
    const score = this.user.maxZ || 0
    this.experience.trigger('restart')
    this.uploadScore(score) // 这里自动防抖
  }

  // 游戏重启处理方法
  async onRestart() {
    // 重置防抖标志
    this.isGameOver = false
    this.map.resetMap()
    this.user.reset()
  }
}
