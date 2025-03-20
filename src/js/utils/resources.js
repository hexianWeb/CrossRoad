import * as THREE from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'

import Experience from '../experience.js'
import EventEmitter from './event-emitter.js'

export default class Resources extends EventEmitter {
  constructor(sources, options = {}) {
    super()

    this.experience = new Experience()
    this.renderer = this.experience.renderer
    this.sources = sources

    this.items = {}
    this.toLoad = this.sources.length
    this.loaded = 0

    // Loading screen elements
    this.loadingScreen = document.getElementById('loading-screen')
    this.loadingBar = document.getElementById('loading-bar')
    this.loadingPercentage = document.getElementById('loading-percentage')

    this.options = {
      dracoDecoderPath: 'https://www.gstatic.com/draco/v1/decoders/',
      ktx2TranscoderPath: 'https://unpkg.com/three/examples/jsm/libs/basis/',
      ...options,
    }

    this.setLoaders()
    this.startLoading()
  }

  setLoaders() {
    this.loaders = {}
    this.loaders.gltfLoader = new GLTFLoader()
    this.loaders.textureLoader = new THREE.TextureLoader()
    this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader()
    this.loaders.fontLoader = new FontLoader()
    this.loaders.fbxLoader = new FBXLoader()
    this.loaders.audioLoader = new THREE.AudioLoader()
    this.loaders.objLoader = new OBJLoader()
    this.loaders.hdrTextureLoader = new RGBELoader()
    this.loaders.svgLoader = new SVGLoader()
    this.loaders.exrLoader = new EXRLoader()
    this.loaders.ktx2Loader = new KTX2Loader()

    // Set up DRACOLoader
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath(this.options.dracoDecoderPath)
    this.loaders.gltfLoader.setDRACOLoader(dracoLoader)

    // Set up KTX2Loader
    this.loaders.ktx2Loader
      .setTranscoderPath(this.options.ktx2TranscoderPath)
      .detectSupport(this.renderer.instance)
    this.loaders.gltfLoader.setKTX2Loader(this.loaders.ktx2Loader)
  }

  startLoading() {
    for (const source of this.sources) {
      switch (source.type) {
        case 'gltfModel': {
          this.loaders.gltfLoader.load(source.path, (file) => {
            this.sourceLoaded(source, file)
          })
          break
        }
        case 'texture': {
          this.loaders.textureLoader.load(source.path, (file) => {
            this.sourceLoaded(source, file)
          })
          break
        }
        case 'cubeTexture': {
          this.loaders.cubeTextureLoader.load(source.path, (file) => {
            this.sourceLoaded(source, file)
          })
          break
        }
        case 'font': {
          this.loaders.fontLoader.load(source.path, (file) => {
            this.sourceLoaded(source, file)
          })
          break
        }
        case 'fbxModel': {
          this.loaders.fbxLoader.load(source.path, (file) => {
            this.sourceLoaded(source, file)
          })
          break
        }
        case 'audio': {
          this.loaders.audioLoader.load(source.path, (file) => {
            this.sourceLoaded(source, file)
          })
          break
        }
        case 'objModel': {
          this.loaders.objLoader.load(source.path, (file) => {
            this.sourceLoaded(source, file)
          })
          break
        }
        case 'hdrTexture': {
          this.loaders.hdrTextureLoader.load(source.path, (file) => {
            this.sourceLoaded(source, file)
          })
          break
        }
        case 'svg': {
          this.loaders.svgLoader.load(source.path, (file) => {
            this.sourceLoaded(source, file)
          })
          break
        }
        case 'exrTexture': {
          this.loaders.exrLoader.load(source.path, (file) => {
            this.sourceLoaded(source, file)
          })
          break
        }
        case 'video': {
          this.loadVideoTexture(source.path).then((file) => {
            this.sourceLoaded(source, file)
          })
          break
        }
        case 'ktx2Texture': {
          this.loaders.ktx2Loader.load(source.path, (file) => {
            this.sourceLoaded(source, file)
          })
          break
        }
        // No default
      }
    }
  }

  sourceLoaded(source, file) {
    this.items[source.name] = file
    this.loaded++

    // Update loading progress
    const progress = this.loadProgress
    const percentage = Math.round(progress * 100)

    if (this.loadingBar) {
      this.loadingBar.style.width = `${percentage}%`
    }
    if (this.loadingPercentage) {
      this.loadingPercentage.textContent = `${percentage}%`
    }

    if (this.loaded === this.toLoad) {
      // Hide loading screen with fade out animation
      if (this.loadingScreen) {
        this.loadingScreen.style.transition = 'opacity 0.5s ease-out'
        this.loadingScreen.style.opacity = '0'
        setTimeout(() => {
          this.loadingScreen.style.display = 'none'
        }, 500)
      }
      this.trigger('ready')
    }
  }

  loadVideoTexture(path) {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.src = path
      video.loop = true
      video.muted = true
      video.playsInline = true

      video.addEventListener('loadeddata', () => {
        const texture = new THREE.VideoTexture(video)
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
        texture.format = THREE.RGBFormat

        resolve(texture)
      })

      video.load()
    })
  }

  get loadProgress() {
    return this.loaded / this.toLoad
  }

  get isLoaded() {
    return this.loaded === this.toLoad
  }
}
