import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'

import Experience from './experience.js'
import { isLandscape, isMobile } from './world/tool.js'

export default class Camera {
  constructor(orthographic = false) {
    this.experience = new Experience()
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.canvas = this.experience.canvas
    this.orthographic = orthographic
    this.debug = this.experience.debug
    this.debugActive = this.experience.debug.active

    this.position = this.getAdaptivePosition()
    this.target = new THREE.Vector3(0, 1.5, 0)

    this.setInstance()
    this.setControls()
    this.setDebug()
  }

  setInstance() {
    if (this.orthographic) {
      const aspect = this.sizes.aspect
      this.frustumSize = this.getAdaptiveFrustumSize()
      this.instance = new THREE.OrthographicCamera(
        -this.frustumSize * aspect,
        this.frustumSize * aspect,
        this.frustumSize,
        -this.frustumSize,
        -50,
        100,
      )
    }
    else {
      this.instance = new THREE.PerspectiveCamera(
        34,
        this.sizes.aspect,
        0.1,
        100,
      )
    }
    this.instance.position.copy(this.position)
    this.instance.lookAt(this.target)
    this.scene.add(this.instance)
  }

  setControls() {
    // OrbitControls 设置
    this.orbitControls = new OrbitControls(this.instance, this.canvas)
    this.orbitControls.enableRotate = false // 禁用旋转
    this.orbitControls.enablePan = false // 禁用平移
    this.orbitControls.enableDamping = true
    this.orbitControls.enableZoom = false // 禁用缩放
    this.orbitControls.target.copy(this.target)

    // TrackballControls 设置
    this.trackballControls = new TrackballControls(this.instance, this.canvas)
    this.trackballControls.noRotate = true // 禁用旋转
    this.trackballControls.noPan = true // 禁用平移
    this.trackballControls.noZoom = false // 启用缩放
    this.trackballControls.zoomSpeed = 1 // 设置缩放速度
    this.trackballControls.minZoom = 0.5
    this.trackballControls.maxZoom = 5

    // 同步两个控制器的目标点
    this.trackballControls.target.copy(this.target)
  }

  setDebug() {
    if (this.debugActive) {
      const cameraFolder = this.debug.ui.addFolder({
        title: 'Camera',
        expanded: false,
      })

      cameraFolder
        .addBinding(this, 'position', {
          label: 'camera Position',
        })
        .on('change', this.updateCamera.bind(this))

      cameraFolder
        .addBinding(this, 'target', {
          label: 'camera Target',
        })
        .on('change', this.updateCamera.bind(this))
    }
  }

  updateCamera() {
    this.instance.position.copy(this.position)
    this.instance.lookAt(this.target)
    this.orbitControls.target.copy(this.target)
    this.trackballControls.target.copy(this.target)
    this.orbitControls.update()
    this.trackballControls.update()
  }

  resize() {
    if (this.orthographic) {
      const aspect = this.sizes.width / this.sizes.height
      this.frustumSize = this.getAdaptiveFrustumSize()
      this.instance.left = (-this.frustumSize * aspect)
      this.instance.right = (this.frustumSize * aspect)
      this.instance.top = this.frustumSize
      this.instance.bottom = -this.frustumSize
      this.instance.updateProjectionMatrix()
    }
    else {
      this.instance.aspect = this.sizes.aspect
      this.instance.updateProjectionMatrix()
    }
    this.trackballControls.handleResize()

    this.handleResizeForMobile()
  }

  update() {
    this.orbitControls.update()
    this.trackballControls.update()
  }

  // 获取自适应相机位置
  getAdaptivePosition() {
    if (!isMobile())
      return new THREE.Vector3(2.5, 4.3, 7.03)
    return isLandscape()
      ? new THREE.Vector3(3, 4, 6)
      : new THREE.Vector3(6, 4, 4.6)
  }

  // 移动端自适应处理
  handleResizeForMobile() {
    this.position = this.getAdaptivePosition()
    this.updateCamera()
  }

  // 获取自适应正交相机视锥体大小
  getAdaptiveFrustumSize() {
    return isMobile() ? 4 : 3
  }
}
