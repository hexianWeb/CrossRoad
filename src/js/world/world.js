import * as THREE from 'three'

import Experience from '../experience.js'
import Environment from './environment.js'
import Map from './Map.js'

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.scene.add(new THREE.AxesHelper(5))

    // Environment
    this.resources.on('ready', () => {
      // Setup
      this.map = new Map()
      this.environment = new Environment()
    })
  }

  update() {
  }
}
