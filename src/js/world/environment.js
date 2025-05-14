import * as THREE from 'three'

import Experience from '../experience.js'

export default class Environment {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.debug = this.experience.debug.ui
    this.debugActive = this.experience.debug.active

    this.axesHelper = new THREE.AxesHelper(5)
    this.axesHelper.visible = false
    this.scene.add(this.axesHelper)

    // Setup
    this.setSunLight()
    this.setAmbientLight()
    this.setEnvironmentMap()
    this.debuggerInit()
  }

  setSunLight() {
    this.sunLightColor = '#ffffff'
    this.sunLightIntensity = 2.5
    this.sunLight = new THREE.DirectionalLight(
      this.sunLightColor,
      this.sunLightIntensity,
    )
    this.sunLight.castShadow = true
    this.sunLight.shadow.camera.far = 60
    this.sunLight.shadow.camera.left = -10
    this.sunLight.shadow.camera.right = 10
    this.sunLight.shadow.camera.top = 10
    this.sunLight.shadow.camera.bottom = -10
    this.sunLight.shadow.mapSize.set(2048, 2048)
    this.sunLight.shadow.normalBias = 0.05
    this.sunLightPosition = new THREE.Vector3(17, 12, 6.5)
    this.sunLight.position.copy(this.sunLightPosition)

    // 设置 sunLight Target
    this.sunLight.target = new THREE.Object3D()
    this.sunLightTarget = new THREE.Vector3(0, 0, 0)
    this.sunLight.target.position.copy(this.sunLightTarget)
    this.scene.add(this.sunLight.target)

    this.helper = new THREE.CameraHelper(this.sunLight.shadow.camera)
    this.helper.visible = false
    this.scene.add(this.helper)
  }

  setAmbientLight() {
    this.ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5)
    this.scene.add(this.ambientLight)
  }

  setEnvironmentMap() {
    this.environmentMap = {}
    this.environmentMap.intensity = 0.3
    this.environmentMap.texture = this.resources.items.environmentMapTexture
    this.environmentMap.texture.colorSpace = THREE.SRGBColorSpace

    this.scene.environment = this.environmentMap.texture
  }

  updateSunLightPosition() {
    this.sunLight.position.copy(this.sunLightPosition)
    this.sunLight.target.position.copy(this.sunLightTarget)
    this.helper.update()
  }

  updateSunLightColor() {
    this.sunLight.color.set(this.sunLightColor)
  }

  updateSunLightIntensity() {
    this.sunLight.intensity = this.sunLightIntensity
  }

  debuggerInit() {
    if (this.debugActive) {
      const environmentFolder = this.debug.addFolder({
        title: 'Environment',
        expanded: false,
      })

      environmentFolder.addBinding(this.scene, 'environmentIntensity', {
        min: 0,
        max: 2,
        step: 0.01,
        label: 'Intensity',
      })

      const sunLightFolder = this.debug.addFolder({
        title: 'Sun Light',
        expanded: false,
      })

      sunLightFolder
        .addBinding(this, 'sunLightPosition', {
          label: 'Light Position',
        })
        .on('change', this.updateSunLightPosition.bind(this))

      sunLightFolder
        .addBinding(this, 'sunLightTarget', {
          label: 'Light Target',
        })
        .on('change', this.updateSunLightPosition.bind(this))

      sunLightFolder
        .addBinding(this, 'sunLightColor', {
          label: 'Light Color',
          view: 'color',
        })
        .on('change', this.updateSunLightColor.bind(this))

      sunLightFolder
        .addBinding(this, 'sunLightIntensity', {
          label: 'Light Intensity',
          min: 0,
          max: 20,
          step: 0.1,
        })
        .on('change', this.updateSunLightIntensity.bind(this))

      // 添加 shadowCamera 参数调控
      const shadowCamera = this.sunLight.shadow.camera
      const shadowCameraFolder = sunLightFolder.addFolder({
        title: 'Shadow Camera',
        expanded: false,
      })
      shadowCameraFolder.addBinding(shadowCamera, 'left', {
        label: 'Shadow Left',
        min: -100,
        max: 0,
        step: 0.1,
      }).on('change', () => {
        shadowCamera.updateProjectionMatrix()
        this.helper.update()
      })
      shadowCameraFolder.addBinding(shadowCamera, 'right', {
        label: 'Shadow Right',
        min: 0,
        max: 100,
        step: 0.1,
      }).on('change', () => {
        shadowCamera.updateProjectionMatrix()
        this.helper.update()
      })
      shadowCameraFolder.addBinding(shadowCamera, 'top', {
        label: 'Shadow Top',
        min: 0,
        max: 100,
        step: 0.1,
      }).on('change', () => {
        shadowCamera.updateProjectionMatrix()
        this.helper.update()
      })
      shadowCameraFolder.addBinding(shadowCamera, 'bottom', {
        label: 'Shadow Bottom',
        min: -100,
        max: 0,
        step: 0.1,
      }).on('change', () => {
        shadowCamera.updateProjectionMatrix()
        this.helper.update()
      })

      sunLightFolder.addBinding(this.helper, 'visible', {
        label: 'Helper',
      })

      if (this.axesHelper) {
        this.debug.addBinding(this.axesHelper, 'visible', {
          label: 'Axes',
        })
      }
    }
  }
}
