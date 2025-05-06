import * as THREE from 'three'

import Camera from './camera.js'
import Renderer from './renderer.js'
import sources from './sources.js'
import Debug from './utils/debug.js'
import IMouse from './utils/imouse.js'
import Resources from './utils/resources.js'
import Sizes from './utils/sizes.js'
import Stats from './utils/stats.js'
import Time from './utils/time.js'
import PhysicsWorld from './world/physics-world.js'
import World from './world/world.js'

let instance

export default class Experience {
  constructor(canvas) {
    // Singleton
    if (instance) {
      return instance
    }

    instance = this

    // Global access
    window.Experience = this

    this.canvas = canvas

    // Panel
    this.debug = new Debug()
    this.stats = new Stats()
    this.sizes = new Sizes()
    this.time = new Time()
    this.scene = new THREE.Scene()
    this.camera = new Camera(true)
    this.renderer = new Renderer()
    this.resources = new Resources(sources)
    this.physics = new PhysicsWorld()
    this.iMouse = new IMouse()
    this.world = new World()

    this.sizes.on('resize', () => {
      this.resize()
    })

    this.time.on('tick', () => {
      this.update()
    })
  }

  resize() {
    this.camera.resize()
    this.renderer.resize()
  }

  update() {
    this.camera.update()
    this.world.update()
    this.renderer.update() // 切换为手动更新
    this.stats.update()
    this.iMouse.update()
  }
}
