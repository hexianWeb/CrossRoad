import * as THREE from 'three'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'

import Experience from '../experience.js'
import Float from './float.js'

export default class TextMesh {
  constructor(options = {}) {
    // 获取 Experience 单例实例
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.camera = this.experience.camera.instance

    // 默认参数
    const defaultOptions = {
      texts: ['three'],
      font: 'fontSource',
      position: new THREE.Vector3(0, 0, -5), // 场景正后方
      rotation: new THREE.Euler(0, 0, 0),
      fontOptions: {
        size: 1.0, // 文字大小
        depth: 0.1, // 文字厚度/深度
        curveSegments: 24, // 曲线分段数,控制文字曲线的平滑度
        bevelEnabled: true, // 是否启用斜角/倒角效果
        bevelThickness: 0.15, // 斜角厚度
        bevelSize: 0.05, // 斜角大小(延伸距离)
        bevelOffset: 0, // 斜角偏移量
        bevelSegments: 20, // 斜角的分段数,控制斜角的平滑度
      },
    }

    const { texts, font, position, rotation, fontOptions } = {
      ...defaultOptions,
      ...options,
    }

    this.texts = texts
    this.font = font
    this.position = position
    this.rotation = rotation
    this.fontOptions = fontOptions

    // 渐变色配置
    this.colors = [
      { from: new THREE.Color('#56b868'), to: new THREE.Color('#afc97b') },
    ]

    this.float = new Float({ speed: 0.5, floatIntensity: 0.21, rotationIntensity: 0.21 })

    // 资源加载完成后生成文字
    this.resources.on('ready', () => {
      const fontSource = this.resources.items[this.font]
      const matcapTexture = this.resources.items.matcapGreen
      if (fontSource && matcapTexture) {
        this.setupTextMeshes(fontSource, matcapTexture)
      }
      else {
        console.error('Font source 或 matcap 贴图未加载')
      }
    })
  }

  // 生成 3D 文字并添加到场景
  setupTextMeshes(fontSource, matcapTexture) {
    const fontOptions = { ...this.fontOptions, font: fontSource }
    this.textGroups = []
    const spaceOffset = 1

    for (const [__index, text] of this.texts.entries()) {
      const words = new THREE.Group()
      words.letterOff = 0
      for (const [__index__, letter] of [...text].entries()) {
        // 使用 matcap 材质
        const material = new THREE.MeshMatcapMaterial({
          matcap: matcapTexture,
          color: '#daf799',
        })
        if (letter === ' ') {
          // 空格增加偏移
          words.letterOff += spaceOffset
        }
        else {
          // 创建文字几何体
          const geometry = new TextGeometry(letter, fontOptions)
          geometry.computeBoundingBox()
          geometry.computeBoundingSphere()
          const mesh = new THREE.Mesh(geometry, material)
          mesh.size = mesh.geometry.boundingBox.getSize(new THREE.Vector3())
          mesh.userData.name = letter
          words.letterOff += mesh.size.x
          // 设置字母 mesh 的位置
          mesh.position.x = words.letterOff
          words.add(mesh)
        }
      }
      // 重新居中每个单词组
      for (const letter of words.children) {
        letter.position.x -= words.letterOff * 0.5
      }
      this.textGroups.push(words)
      this.float.add(words) // 使用 Float 管理
    }
    // 居中整个文字块
    this.centerTextBlock()
    // 应用整体位置和旋转
    for (const words of this.textGroups) {
      words.position.add(this.position)
      words.rotation.copy(this.rotation)
    }
    // 只需将 float.group 添加到场景一次
    this.scene.add(this.float.group)
  }

  // 居中整个文字块
  centerTextBlock() {
    const boundingBox = new THREE.Box3()
    for (const words of this.textGroups) {
      boundingBox.expandByObject(words)
    }
    const center = boundingBox.getCenter(new THREE.Vector3())
    for (const words of this.textGroups) {
      words.position.sub(center)
    }
  }

  // 提供 update 方法驱动浮动动画
  update() {
    if (this.float) {
      this.float.update()
    }
  }
}
