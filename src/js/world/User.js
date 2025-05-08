import * as THREE from 'three'
// User.js
// 负责主角小鸡的加载与管理
import Experience from '../experience.js'

export default class User {
  constructor() {
    // 获取 Experience 单例
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.debug = this.experience.debug

    // 存储小鸡模型对象
    this.chicken = null
    // scale参数用于等比例缩放
    this.scale = 0.56

    // 维护移动队列
    this.movesQueue = []
    // 记录当前是否正在移动
    this.isMoving = false
    // 记录当前所在格子坐标（XOZ平面，整数）
    this.currentTile = { x: 0, z: 0 }
    // 记录目标格子坐标
    this.targetTile = { x: 0, z: 0 }
    // 移动时钟
    this.moveClock = new THREE.Clock(false)
    // 步长（每步移动1格）
    this.stepLength = 1

    // 初始化主角
    this.initChicken()

    // 初始化调试面板
    if (this.debug.active) {
      this.debuggerInit()
    }

    // 绑定键盘事件
    this.pressedKeys = new Set()
    this.listenKeyboard()
  }

  // 加载并放置小鸡模型
  initChicken() {
    // 获取 chicken 资源
    const chickenResource = this.resources.items.bigChicken
    if (!chickenResource) {
      console.warn('未找到 chicken 资源')
      return
    }
    // 克隆模型，避免资源污染
    this.chicken = chickenResource.scene.clone()
    // 设置主角位置为 (0,0,0)
    this.chicken.position.set(0, 0.22, 0)
    // 设置初始等比例缩放
    this.chicken.scale.set(this.scale, this.scale, this.scale)
    // 添加到场景
    this.scene.add(this.chicken)
  }

  // 调试面板：可调整主角的等比例缩放和位置
  debuggerInit() {
    this.debugFolder = this.debug.ui.addFolder({
      title: '小鸡调试',
      expanded: true,
    })
    // 等比例缩放调节
    this.debugFolder.addBinding(this, 'scale', {
      label: '等比例缩放',
      min: 0.1,
      max: 5,
      step: 0.01,
    }).on('change', (_unused) => {
      // 同步到chicken模型
      if (this.chicken) {
        this.chicken.scale.set(this.scale, this.scale, this.scale)
      }
    })
    // 位置调节
    this.debugFolder.addBinding(this.chicken.position, 'x', { label: '位置X', min: -10, max: 10, step: 0.01 })
    this.debugFolder.addBinding(this.chicken.position, 'y', { label: '位置Y', min: -10, max: 10, step: 0.01 })
    this.debugFolder.addBinding(this.chicken.position, 'z', { label: '位置Z', min: -10, max: 10, step: 0.01 })
  }

  // 监听键盘事件，使用 event.code 适配非QWERTY键盘
  listenKeyboard() {
    window.addEventListener('keydown', (event) => {
      let move = null
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          move = 'forward'
          break
        case 'ArrowDown':
        case 'KeyS':
          move = 'backward'
          break
        case 'ArrowLeft':
        case 'KeyA':
          move = 'left'
          break
        case 'ArrowRight':
        case 'KeyD':
          move = 'right'
          break
        default:
          break
      }
      // 只在首次按下时 push
      if (move && !this.pressedKeys.has(event.code)) {
        this.movesQueue.push(move)
        this.pressedKeys.add(event.code)
      }
    })
    window.addEventListener('keyup', (event) => {
      this.pressedKeys.delete(event.code)
    })
  }

  // update方法：每帧调用，处理移动逻辑
  update() {
    if (!this.chicken)
      return
    // 如果没有移动指令，直接返回
    if (!this.movesQueue.length)
      return

    // 如果当前不在移动，启动移动
    if (!this.isMoving) {
      this.isMoving = true
      this.moveClock.start()
      // 计算目标格子
      const dir = this.movesQueue[0]
      this.targetTile = { ...this.currentTile }
      if (dir === 'forward')
        this.targetTile.z -= 1
      if (dir === 'backward')
        this.targetTile.z += 1
      if (dir === 'left')
        this.targetTile.x -= 1
      if (dir === 'right')
        this.targetTile.x += 1
      // 记录起始位置
      this.startPos = {
        x: this.currentTile.x * this.stepLength,
        z: this.currentTile.z * this.stepLength,
      }
      this.endPos = {
        x: this.targetTile.x * this.stepLength,
        z: this.targetTile.z * this.stepLength,
      }
      // 记录起始旋转
      this.startRot = this.chicken.rotation.y
      this.endRot = this.getTargetRotation(dir)
    }

    // 步进动画
    const stepTime = 0.2 // 单步时长（秒）
    const progress = Math.min(1, this.moveClock.getElapsedTime() / stepTime)
    this.setPosition(progress)
    this.setRotation(progress)

    // 步进结束
    if (progress >= 1) {
      this.stepCompleted()
      this.moveClock.stop()
      this.isMoving = false
      // 移除已完成的指令
      this.movesQueue.shift()
    }
  }

  // 设置主角位置（XOZ平面+跳跃）
  setPosition(progress) {
    if (!this.chicken)
      return
    // 水平插值
    const x = THREE.MathUtils.lerp(this.startPos.x, this.endPos.x, progress)
    const z = THREE.MathUtils.lerp(this.startPos.z, this.endPos.z, progress)
    // 跳跃高度（正弦曲线）
    const jumpHeight = Math.sin(progress * Math.PI) * 0.28 // 跳跃最大高度
    this.chicken.position.set(x, 0.22 + jumpHeight, z)

    // squash and stretch 动画：scale.y 在起跳和落地时压缩，最高点恢复
    // 计算压缩系数，progress=0/1时最小，0.5时最大
    const squash = 0.85 + 0.15 * Math.sin(progress * Math.PI) // y轴缩放
    const stretch = 1.0 + 0.15 * (1 - Math.sin(progress * Math.PI)) // x/z轴略微拉伸
    this.chicken.scale.set(this.scale * stretch, this.scale * squash, this.scale * stretch)
  }

  // 设置主角旋转（始终最短路径）
  setRotation(progress) {
    if (!this.chicken)
      return
    // 计算最短旋转路径
    let delta = this.endRot - this.startRot
    if (delta > Math.PI)
      delta -= 2 * Math.PI
    if (delta < -Math.PI)
      delta += 2 * Math.PI
    const y = this.startRot + delta * progress
    this.chicken.rotation.y = y
  }

  // 步进完成，更新当前格子
  stepCompleted() {
    this.currentTile = { ...this.targetTile }
    // 保证最终位置精确
    this.chicken.position.set(
      this.currentTile.x * this.stepLength,
      0.22,
      this.currentTile.z * this.stepLength,
    )
    this.chicken.rotation.y = this.endRot
    // 恢复正常缩放
    this.chicken.scale.set(this.scale, this.scale, this.scale)
  }

  // 根据移动方向获取目标旋转
  getTargetRotation(dir) {
    if (dir === 'forward')
      return Math.PI
    if (dir === 'left')
      return -Math.PI / 2
    if (dir === 'right')
      return Math.PI / 2
    if (dir === 'backward')
      return 0
    return 0
  }

  // 可扩展：主角移动、动画等方法
}
