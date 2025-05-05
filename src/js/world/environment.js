import * as THREE from 'three'

import Experience from '../experience.js'

export default class Environment {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.debug = this.experience.debug.ui
    this.debugActive = this.experience.debug.active

    // Axes Helper
    this.axesHelper = new THREE.AxesHelper(5)
    this.axesHelper.visible = false
    this.scene.add(this.axesHelper)

    // Setup
    this.setSunLight()
    this.setEnvironmentMap()
    this.debuggerInit()
  }

  setSunLight() {
    this.sunLightColor = '#ffffff'
    this.sunLightIntensity = 8
    this.sunLight = new THREE.DirectionalLight(
      this.sunLightColor,
      this.sunLightIntensity,
    )
    this.sunLight.castShadow = true
    this.sunLight.shadow.camera.far = 60
    this.sunLight.shadow.mapSize.set(1024, 1024)
    this.sunLight.shadow.normalBias = 0.05
    this.sunLightPosition = new THREE.Vector3(18, 10, 4.5)
    this.sunLight.position.copy(this.sunLightPosition)
    this.scene.add(this.sunLight)

    // 设置 sunLight Target
    this.sunLight.target = new THREE.Object3D()
    this.sunLightTarget = new THREE.Vector3(6.7, 2.3, -7)
    this.sunLight.target.position.copy(this.sunLightTarget)
    this.scene.add(this.sunLight.target)

    this.helper = new THREE.CameraHelper(this.sunLight.shadow.camera)
    this.helper.visible = false
    this.scene.add(this.helper)
  }

  setEnvironmentMap() {
    this.environmentMap = {}
    this.environmentMap.intensity = 1
    this.environmentMap.texture = this.resources.items.environmentMapTexture
    this.environmentMap.texture.colorSpace = THREE.SRGBColorSpace

    this.scene.environment = this.environmentMap.texture
    this.scene.background = this.environmentMap.texture
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
