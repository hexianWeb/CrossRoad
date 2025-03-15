import Stats from 'three/examples/jsm/libs/stats.module'

export default class StatsPanel {
  constructor() {
    this.active = window.location.hash === '#debug'
    if (this.active) {
      this.stats = new Stats()
      this.stats.showPanel(0)
      document.body.append(this.stats.dom)

      // 设置面板的大小和字体
      this.stats.dom.style.width = '200px' // 设置面板宽度
      this.stats.dom.style.height = '100px' // 设置面板高度
      this.stats.dom.style.fontSize = '16px' // 设置字体大小
    }
  }

  update() {
    if (this.active) {
      this.stats.update()
    }
  }
}
