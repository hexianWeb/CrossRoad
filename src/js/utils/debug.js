import { Pane } from 'tweakpane'

export default class Debug {
  constructor() {
    this.active = window.location.hash === '#debug'

    if (this.active) {
      this.ui = new Pane()
      const paneEl = document.querySelector('.tp-dfwv')
      if (paneEl) {
        paneEl.style.zIndex = '9999'
      }
    }
  }
}
