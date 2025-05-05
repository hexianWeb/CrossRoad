import * as THREE from 'three'

import Experience from '../experience.js'
import Environment from './environment.js'

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.scene.add(new THREE.AxesHelper(5))

    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 0.2),
      new THREE.MeshBasicMaterial({
        color: 'red',
      }),
    )
    this.scene.add(box)
    // Environment
    this.resources.on('ready', () => {
      // Setup
      this.environment = new Environment()
    })
  }

  update() {
  }
}
