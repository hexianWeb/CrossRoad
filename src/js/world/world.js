import * as THREE from 'three'

import Experience from '../experience.js'
import Environment from './environment.js'
import Map from './Map.js'
import User from './User.js'

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.camera = this.experience.camera
    this.resources = this.experience.resources
    this.scene.add(new THREE.AxesHelper(5))

    // Environment
    this.resources.on('ready', () => {
      // Setup
      this.environment = new Environment()
      this.map = new Map()
      this.user = new User()
      // 相机只跟随 user 的 agentGroup 水平移动
      this.user.agentGroup.add(this.camera.instance)
      this.user.agentGroup.add(this.environment.sunLight)

    })
  }

  update() {
    if (this.map) {
      this.map.update()
    }
    if (this.user) {
      this.camera.instance.lookAt(this.user.agentGroup.position)
      this.environment.sunLight.target.position.copy(this.user.agentGroup.position)
      this.user.update()
    }
  }
}
