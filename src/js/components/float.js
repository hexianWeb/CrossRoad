import * as THREE from 'three'

import Experience from '../experience.js'

export default class Float {
  constructor(config = {}) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.time = this.experience.time

    this.speed = config.speed || 1
    this.rotationIntensity = config.rotationIntensity || 1
    this.floatIntensity = config.floatIntensity || 1
    this.floatingRange = config.floatingRange || [-0.1, 0.1]

    this.group = new THREE.Group()
    this.offset = Math.random() * 114_514

    this.scene.add(this.group)
  }

  add(...objects) {
    this.group.add(...objects)
  }

  update() {
    const t = (this.offset + this.time.elapsed) * 0.01

    this.group.rotation.x
      = (Math.cos((t / 4) * this.speed) / 8) * this.rotationIntensity
    this.group.rotation.y
      = (Math.sin((t / 4) * this.speed) / 8) * this.rotationIntensity
    this.group.rotation.z
      = (Math.sin((t / 4) * this.speed) / 20) * this.rotationIntensity

    let yPosition = Math.sin((t / 4) * this.speed) / 10
    yPosition = THREE.MathUtils.mapLinear(
      yPosition,
      -0.1,
      0.1,
      this.floatingRange[0] ?? -0.1,
      this.floatingRange[1] ?? 0.1,
    )
    this.group.position.y = yPosition * this.floatIntensity
  }
}
