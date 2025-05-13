import gsap from 'gsap' // 引入 gsap 用于动画
import * as THREE from 'three'
import { NORMAL_STEP_TIME, SPEEDUP_STEP_TIME } from '../constants.js'
// User.js
// 负责主角小鸡的加载与管理
import Experience from '../experience.js'
import { endsUpInValidPosition, getSwipeDirection, getTargetRotation, isMobile } from './tool.js'

export default class User {
  constructor() {
    // 获取 Experience 单例
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.debug = this.experience.debug

    // 存储小鸡模型对象
    this.instance = null
    // scale参数用于等比例缩放
    this.scale = 0.30

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

    this.agentGroup = new THREE.Group() // 新增 agentGroup，负责水平移动
    this.scene.add(this.agentGroup) // 将 agentGroup 添加到场景

    // 初始化主角
    this.initChicken()

    // 初始化调试面板
    if (this.debug.active) {
      this.debuggerInit()
    }

    // 绑定键盘事件
    this.pressedKeys = new Set()
    this.listenKeyboard()

    // 移动端启用滑动操控
    if (isMobile()) {
      this.listenTouch()
    }

    this.isInvincible = false // 是否无敌
    this._invincibleTimeout = null // 无敌定时器
    this.isSpeedUp = false // 是否加速
    this._speedUpTimeout = null // 加速定时器
  }

  // 加载并放置小鸡模型
  initChicken() {
    // 获取 instance 资源
    const chickenResource = this.resources.items.bigChicken
    if (!chickenResource) {
      console.warn('未找到 instance 资源')
      return
    }
    // 克隆模型，避免资源污染
    this.instance = chickenResource.scene.clone()
    // 显示阴影
    this.instance.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
      }
    })
    // 只设置 y 方向初始高度
    this.instance.position.set(0, 0.22, 0)
    // 设置初始等比例缩放
    this.instance.scale.set(this.scale, this.scale, this.scale)
    // 添加到 agentGroup
    this.agentGroup.add(this.instance)
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
      if (this.instance) {
        this.instance.scale.set(this.scale, this.scale, this.scale)
      }
    })
  }

  // 监听键盘事件，使用 event.code 适配非QWERTY键盘
  listenKeyboard() {
    window.addEventListener('keydown', (event) => {
      if (this.experience.isPaused) {
        return
      }
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

  // 监听移动端滑动事件，实现滑动控制小鸡移动
  listenTouch() {
    let startX = 0
    let startY = 0
    window.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX
        startY = e.touches[0].clientY
      }
    })
    window.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        const endX = e.changedTouches[0].clientX
        const endY = e.changedTouches[0].clientY
        const dir = getSwipeDirection(startX, startY, endX, endY)
        if (dir) {
          this.movesQueue.push(dir)
        }
      }
    })
  }

  // update方法：每帧调用，处理移动逻辑
  update() {
    if (!this.instance)
      return
    if (!this.movesQueue.length)
      return

    // 计算下一步目标格子
    if (!this.isMoving) {
      const dir = this.movesQueue[0]
      const nextTarget = { ...this.currentTile }
      if (dir === 'forward')
        nextTarget.z -= 1
      if (dir === 'backward')
        nextTarget.z += 1
      if (dir === 'left')
        nextTarget.x -= 1
      if (dir === 'right')
        nextTarget.x += 1

      // 先设置旋转，让小鸡朝向尝试方向
      this.startRot = this.instance.rotation.y
      this.endRot = getTargetRotation(dir)
      this.setRotation(1) // 直接转到目标朝向

      // 检查是否合法
      const mapMetadata = this.experience.world.map.metadata
      if (!endsUpInValidPosition(nextTarget, mapMetadata)) {
        // 不合法，执行 yoyo 动画并丢弃本次指令
        this.playYoyoAnimation(nextTarget)
        this.movesQueue.shift()
        return
      }

      // 启动移动
      this.isMoving = true
      this.moveClock.start()
      this.targetTile = nextTarget
      // 记录起始位置
      this.startPos = {
        x: this.currentTile.x * this.stepLength,
        z: this.currentTile.z * this.stepLength,
      }
      this.endPos = {
        x: this.targetTile.x * this.stepLength,
        z: this.targetTile.z * this.stepLength,
      }
    }

    // 步进动画
    const stepTime = this.isSpeedUp ? SPEEDUP_STEP_TIME : NORMAL_STEP_TIME // 根据加速状态调整步进时长
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

  // 设置主角位置（agentGroup 只负责 x/z，instance 只负责 y）
  setPosition(progress) {
    if (!this.instance)
      return
    // 水平插值
    const x = THREE.MathUtils.lerp(this.startPos.x, this.endPos.x, progress)
    const z = THREE.MathUtils.lerp(this.startPos.z, this.endPos.z, progress)
    // agentGroup 只负责水平移动
    this.agentGroup.position.set(x, 0, z)
    // 跳跃高度（正弦曲线）
    const jumpHeight = Math.sin(progress * Math.PI) * 0.28 // 跳跃最大高度
    this.instance.position.y = 0.22 + jumpHeight // instance 只负责竖直跳跃
    // squash and stretch 动画：scale.y 在起跳和落地时压缩，最高点恢复
    const squash = 0.85 + 0.15 * Math.sin(progress * Math.PI) // y轴缩放
    const stretch = 1.0 + 0.15 * (1 - Math.sin(progress * Math.PI)) // x/z轴略微拉伸
    this.instance.scale.set(this.scale * stretch, this.scale * squash, this.scale * stretch)
  }

  // 设置主角旋转（始终最短路径）
  setRotation(progress) {
    if (!this.instance)
      return
    // 计算最短旋转路径
    let delta = this.endRot - this.startRot
    if (delta > Math.PI)
      delta -= 2 * Math.PI
    if (delta < -Math.PI)
      delta += 2 * Math.PI
    const y = this.startRot + delta * progress
    this.instance.rotation.y = y
  }

  // 步进完成，更新当前格子
  stepCompleted() {
    this.currentTile = { ...this.targetTile }
    // agentGroup 归位到目标格子 x/z
    this.agentGroup.position.set(
      this.currentTile.x * this.stepLength,
      0,
      this.currentTile.z * this.stepLength,
    )
    // instance 归位到初始高度
    this.instance.position.y = 0.22
    this.instance.rotation.y = this.endRot
    // 恢复正常缩放
    this.instance.scale.set(this.scale, this.scale, this.scale)

    // ===== 分数统计与事件触发 =====
    // 记录最大前进距离
    if (this.maxZ === undefined) {
      this.maxZ = 0
    }
    if (this.currentTile.z > this.maxZ) {
      this.maxZ = this.currentTile.z

      // 触发分数事件
      this.experience.trigger('scoreUpdate', [this.maxZ])
    }
  }

  // yoyo 动画：尝试移动但弹回原位（agentGroup 只做 x/z，instance 只做 y）
  playYoyoAnimation(targetTile) {
    if (!this.instance)
      return
    // 计算目标位置
    const from = {
      x: this.currentTile.x * this.stepLength,
      z: this.currentTile.z * this.stepLength,
    }
    const to = {
      x: targetTile.x * this.stepLength,
      z: targetTile.z * this.stepLength,
    }
    const delta = {
      x: (to.x - from.x) * 0.8,
      z: (to.z - from.z) * 0.8,
    }
    // agentGroup 只做 x/z 的 yoyo
    gsap.to(this.agentGroup.position, {
      x: to.x - delta.x,
      z: to.z - delta.z,
      duration: 0.12,
      yoyo: true,
      repeat: 1,
      ease: 'power1.inOut',
      onComplete: () => {
        this.agentGroup.position.set(from.x, 0, from.z)
      },
    })
    // instance 只做 y 的弹跳
    gsap.to(this.instance.position, {
      y: 0.50,
      duration: 0.12,
      yoyo: true,
      repeat: 1,
      ease: 'power1.inOut',
      onComplete: () => {
        this.instance.position.y = 0.22
      },
    })
    // scale 弹跳动画（squash & stretch）
    gsap.to(this.instance.scale, {
      x: this.scale * 0.7, // x/z 轴拉伸
      y: this.scale * 1.18, // y 轴压缩
      z: this.scale * 0.7,
      duration: 0.12,
      yoyo: true,
      repeat: 1,
      ease: 'power1.inOut',
      onComplete: () => {
        this.instance.scale.set(this.scale, this.scale, this.scale)
      },
    })
  }

  // 可扩展：主角移动、动画等方法
  // 重置角色位置到起点
  reset() {
    // 重置位置状态
    this.currentTile = {
      x: 0,
      z: 0,
    }

    this.targetTile = {
      x: 0,
      z: 0,
    }

    // 重置最大前进距离
    this.maxZ = 0

    // 重置 agentGroup 位置
    this.agentGroup.position.set(0, 0, 0)

    // 重置角色位置和缩放
    this.instance.position.set(0, 1, 0) // 设置初始高度为1
    gsap.to(this.instance.position, {
      y: 0.22,
      duration: 0.5,
      ease: 'bounce.out',
    })
    this.instance.scale.set(this.scale, this.scale, this.scale)

    // 重置角色朝向
    this.instance.rotation.y = 0

    this.experience.trigger('scoreUpdate', [0])
  }

  /**
   * 设置无敌状态
   * @param {boolean} flag 是否无敌
   * @param {number} duration 持续时间（毫秒）
   */
  setInvincible(flag, duration = 3000) {
    if (flag) {
      this.isInvincible = true
      if (this._invincibleTimeout)
        clearTimeout(this._invincibleTimeout)
      this._invincibleTimeout = setTimeout(() => {
        this.isInvincible = false
        this._invincibleTimeout = null
      }, duration)
    }
    else {
      this.isInvincible = false
      if (this._invincibleTimeout) {
        clearTimeout(this._invincibleTimeout)
        this._invincibleTimeout = null
      }
    }
  }

  /**
   * 设置加速状态
   * @param {boolean} flag 是否加速
   * @param {number} duration 持续时间（毫秒）
   */
  setSpeedUp(flag, duration = 5000) {
    if (flag) {
      this.isSpeedUp = true
      if (this._speedUpTimeout)
        clearTimeout(this._speedUpTimeout)
      this._speedUpTimeout = setTimeout(() => {
        this.isSpeedUp = false
        this._speedUpTimeout = null
      }, duration)
    }
    else {
      this.isSpeedUp = false
      if (this._speedUpTimeout) {
        clearTimeout(this._speedUpTimeout)
        this._speedUpTimeout = null
      }
    }
  }
}
