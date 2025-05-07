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
    this.scale = 1.0

    // 初始化主角
    this.initChicken()

    // 初始化调试面板
    if (this.debug.active) {
      this.debuggerInit()
    }
  }

  // 加载并放置小鸡模型
  initChicken() {
    // 获取 chicken 资源
    const chickenResource = this.resources.items.chicken
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

  // 可扩展：主角移动、动画等方法
}
