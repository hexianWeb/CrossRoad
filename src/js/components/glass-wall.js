import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

import glassFragmentShader from '../../shaders/glass/fragment.glsl'
import glassVertexShader from '../../shaders/glass/vertex.glsl'
import Experience from '../experience.js'

export default class GlassWall {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.iMouse = this.experience.iMouse
    this.resources = this.experience.resources
    this.world = this.experience.physics.world
    this.camera = this.experience.camera.instance
    this.sizes = this.experience.sizes
    this.renderer = this.experience.renderer.instance
    this.debug = this.experience.debug.ui
    this.debugActive = this.experience.debug.active

    this.bgScene = new THREE.RenderTarget(this.sizes.width, this.sizes.height)

    this.targetLightPosition = new THREE.Vector3(0, 0, 0.491) // 初始 z 值保持不变

    this.targetPoint = new THREE.Vector2(0.35, 0.06)
    this.maxDistance = 1.2
    this.initialChromaticAberration = 1.5

    this.setGlassWall()
    this.debuggerInit()
  }

  updateLightPositionSmooth() {
    const { x, y } = this.iMouse.normalizedMouse
    const mousePosition = new THREE.Vector2(x, y)
    this.targetLightPosition.x = THREE.MathUtils.mapLinear(x, 0, 1, -0.3, 0.3)
    // 将 y 从 [-1, 1] 映射到 [-1, 1]（y 轴不需要改变范围）
    this.targetLightPosition.y = 1 - Math.abs(y)

    this.glassMaterial.uniforms.uLight.value.x = this.targetLightPosition.x
    this.glassMaterial.uniforms.uLight.value.y = this.targetLightPosition.y
    // 计算鼠标位置与目标点的距离
    const distance = mousePosition.distanceTo(this.targetPoint)

    // 根据距离调整 Chromatic Aberration
    let chromaticAberration
    distance >= this.maxDistance
      ? (chromaticAberration = this.initialChromaticAberration)
      : (chromaticAberration = THREE.MathUtils.mapLinear(
          distance,
          0,
          this.maxDistance,
          0,
          this.initialChromaticAberration,
        ))

    // 更新 Chromatic Aberration uniform
    this.glassMaterial.uniforms.uChromaticAberration.value
      = chromaticAberration
  }

  setTestSphere() {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(2),
      new THREE.MeshPhysicalMaterial({
        color: 0xFF_00_00,
        roughness: 0.5,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.5,
      }),
    )
    sphere.position.set(2, 0, -4)
    this.scene.add(sphere)
  }

  setGlassWall() {
    this.glassWallGroup = new THREE.Group()
    this.glassWallGroup.position.set(0, 0, 0)

    this.scene.add(this.glassWallGroup)
    this.glassMaterial2 = new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      roughness: 0.1,
      metalness: 0,
      transmission: 1,
      THICKness: 0.1,
      dispersion: 3,
      ior: 1.31,
    })
    this.glassMaterial = new THREE.ShaderMaterial({
      vertexShader: glassVertexShader,
      fragmentShader: glassFragmentShader,
      uniforms: {
        uTexture: { value: null },
        uIorR: { value: 1.31 },
        uIorY: { value: 1.31 },
        uIorG: { value: 1.31 },
        uIorC: { value: 1.31 },
        uIorB: { value: 1.31 },
        uIorP: { value: 1.31 },
        uRefractFactor: { value: 0.02 },
        uChromaticAberration: { value: 1.5 },
        uSaturation: { value: 1.09 },
        uShininess: { value: 63 },
        uDiffuseness: { value: 0.46 },
        uFresnelPower: { value: 12 },
        uLight: { value: new THREE.Vector3(0.72, 0.78, 0.491) },
      },
    })
    const THICK = 0.3
    const HEIGHT = 18
    // const glassGeometry = new THREE.CylinderGeometry(THICK, THICK, 16, 128, 32);
    const glassGeometry = new RoundedBoxGeometry(
      THICK,
      HEIGHT,
      THICK,
      128,
      0.2,
    )
    for (let index = 0; index <= 25; index++) {
      const glassColumn = new THREE.Mesh(glassGeometry, this.glassMaterial)
      //   沿着X正轴排列
      glassColumn.position.set(index * (THICK + 0.03) + 2.5, 0, 0)
      this.glassWallGroup.add(glassColumn)
    }
    this.glassWallGroup.rotateY(-Math.PI / 10)
  }

  update() {
    this.updateLightPositionSmooth() // 添加这行

    console.log(this.iMouse.normalizedMouse)

    if (this.glassMaterial) {
      this.glassWallGroup.visible = false
      this.renderer.setRenderTarget(this.bgScene)
      this.renderer.render(this.scene, this.camera)
      this.glassMaterial.uniforms.uTexture.value = this.bgScene.texture
      this.renderer.setRenderTarget(null)
      this.glassWallGroup.visible = true
      this.renderer.render(this.scene, this.camera)
    }
  }

  debuggerInit() {
    if (this.debugActive) {
      const f1 = this.debug.addFolder({
        title: 'Glass Wall',
      })
      f1.addBinding(this.glassMaterial.uniforms.uIorR, 'value', {
        label: 'IOR Red',
        min: 1,
        max: 2,
        step: 0.01,
      })

      f1.addBinding(this.glassMaterial.uniforms.uIorY, 'value', {
        label: 'IOR Yellow',
        min: 1,
        max: 2,
        step: 0.01,
      })

      f1.addBinding(this.glassMaterial.uniforms.uIorG, 'value', {
        label: 'IOR Green',
        min: 1,
        max: 2,
        step: 0.01,
      })

      f1.addBinding(this.glassMaterial.uniforms.uIorC, 'value', {
        label: 'IOR Cyan',
        min: 1,
        max: 2,
        step: 0.01,
      })

      f1.addBinding(this.glassMaterial.uniforms.uIorB, 'value', {
        label: 'IOR Blue',
        min: 1,
        max: 2,
        step: 0.01,
      })

      f1.addBinding(this.glassMaterial.uniforms.uIorP, 'value', {
        label: 'IOR Purple',
        min: 1,
        max: 2,
        step: 0.01,
      })

      f1.addBinding(this.glassMaterial.uniforms.uRefractFactor, 'value', {
        label: 'Refract Factor',
        min: 0,
        max: 2,
        step: 0.01,
      })

      f1.addBinding(this.glassMaterial.uniforms.uChromaticAberration, 'value', {
        label: 'Chromatic Aberration',
        min: 0,
        max: 2,
        step: 0.01,
      })

      f1.addBinding(this.glassMaterial.uniforms.uSaturation, 'value', {
        label: 'Saturation',
        min: 0,
        max: 5,
        step: 0.01,
      })

      f1.addBinding(this.glassMaterial.uniforms.uShininess, 'value', {
        label: 'Shininess',
        min: 0,
        max: 100,
        step: 1,
      })

      f1.addBinding(this.glassMaterial.uniforms.uDiffuseness, 'value', {
        label: 'Diffuseness',
        min: 0,
        max: 1,
        step: 0.01,
      })
      // 光源方向控制
      const lightFolder = f1.addFolder({
        title: 'Light Direction',
      })
      lightFolder.addBinding(this.glassMaterial.uniforms.uLight.value, 'x', {
        label: 'Light X',
        min: -1,
        max: 1,
        step: 0.01,
      })

      lightFolder.addBinding(this.glassMaterial.uniforms.uLight.value, 'y', {
        label: 'Light Y',
        min: -1,
        max: 1,
        step: 0.01,
      })

      // z 轴保持不变
      lightFolder.addBinding(this.glassMaterial.uniforms.uLight.value, 'z', {
        label: 'Light Z',
        min: -3,
        max: 3,
        step: 0.01,
      })

      f1.addBinding(this.glassMaterial.uniforms.uFresnelPower, 'value', {
        label: 'Fresnel Power',
        min: 5,
        max: 15,
        step: 1,
      })
    }
  }
}
