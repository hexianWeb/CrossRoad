import { Pane } from 'tweakpane'

export default class Debug {
  constructor() {
    this.active = window.location.hash === '#debug'

    if (this.active) {
      this.ui = new Pane()
    }
  }
}
