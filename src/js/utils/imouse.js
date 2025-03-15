import * as THREE from 'three'

import Experience from '../experience.js'
import { detectDeviceType } from '../tools/dom.js'

/**
 * IMouse class for handling mouse and touch interactions
 */
export default class IMouse {
  constructor() {
    this.experience = new Experience()
    this.sizes = this.experience.sizes

    // Initialize mouse positions
    this.mouse = new THREE.Vector2(0, 0)
    // Normalized mouse positions
    this.normalizedMouse = new THREE.Vector2(0, 0)
    // Mouse positions in DOM and screen coordinates
    this.mouseDOM = new THREE.Vector2(0, 0)
    // Mouse positions relative to the center of the screen
    this.mouseScreen = new THREE.Vector2(0, 0)
    // Previous mouse positions in DOM and screen coordinates
    this.prevMouseDOM = new THREE.Vector2(0, 0)
    // Mouse position delta in DOM coordinates
    this.mouseDOMDelta = new THREE.Vector2(0, 0)
    // Mouse movement detection
    this.isMouseMoving = false
    this.mouseMoveOffset = 4

    this.listenForMouse()
  }

  /**
   * Get mouse position relative to the bottom-left corner
   * @param {number} x - Client X coordinate
   * @param {number} y - Client Y coordinate
   * @returns {THREE.Vector2} Mouse position
   */
  getMouse(x, y) {
    return new THREE.Vector2(x, this.sizes.height - y)
  }

  /**
   * Get mouse position normalized to the range [-1, 1]
   * @param {number} x - Client X coordinate
   * @param {number} y - Client Y coordinate
   */
  getNormalizedMouse(x, y) {
    const mouse = this.getMouse(x, y)
    const normalizedMouse = mouse.clone()
    normalizedMouse.x /= this.sizes.width / 2
    normalizedMouse.y /= this.sizes.height / 2
    normalizedMouse.x -= 1
    normalizedMouse.y -= 1
    return normalizedMouse
  }

  /**
   * Get mouse position in DOM coordinates
   * @param {number} x - Client X coordinate
   * @param {number} y - Client Y coordinate
   * @returns {THREE.Vector2} Mouse DOM position
   */
  getMouseDOM(x, y) {
    return new THREE.Vector2(x, y)
  }

  /**
   * Get mouse position relative to the center of the screen
   * @param {number} x - Client X coordinate
   * @param {number} y - Client Y coordinate
   * @returns {THREE.Vector2} Mouse screen position
   */
  getMouseScreen(x, y) {
    return new THREE.Vector2(
      x - this.sizes.width / 2,
      -(y - this.sizes.height / 2),
    )
  }

  /**
   * Set up event listeners based on device type
   */
  listenForMouse() {
    const deviceType = detectDeviceType()

    if (deviceType === 'Desktop') {
      this.listenForDesktop()
    }
    else if (deviceType === 'Mobile') {
      this.listenForMobile()
    }
  }

  /**
   * Set up desktop event listeners
   */
  listenForDesktop() {
    window.addEventListener('mousemove', (event_) => {
      this.mouse = this.getMouse(event_.clientX, event_.clientY)
      this.mouseDOM = this.getMouseDOM(event_.clientX, event_.clientY)
      this.mouseScreen = this.getMouseScreen(event_.clientX, event_.clientY)
      this.normalizedMouse = this.getNormalizedMouse(
        event_.clientX,
        event_.clientY,
      )
    })
  }

  /**
   * Set up mobile event listeners
   */
  listenForMobile() {
    window.addEventListener('touchstart', (event_) => {
      this.updateTouchPosition(event_.touches[0])
    })
    window.addEventListener('touchmove', (event_) => {
      this.updateTouchPosition(event_.touches[0])
    })
  }

  /**
   * Update touch position
   * @param {Touch} touch - Touch event data
   */
  updateTouchPosition(touch) {
    this.mouse = this.getMouse(touch.clientX, touch.clientY)
    this.mouseDOM = this.getMouseDOM(touch.clientX, touch.clientY)
    this.mouseScreen = this.getMouseScreen(touch.clientX, touch.clientY)
    this.normalizedMouse = this.getNormalizedMouse(
      touch.clientX,
      touch.clientY,
    )
  }

  /**
   * Synchronize previous mouse DOM position
   */
  syncMouseDOM() {
    this.prevMouseDOM.copy(this.mouseDOM)
  }

  /**
   * Determine if the mouse is moving
   */
  judgeIsMouseMoving() {
    this.isMouseMoving
      = Math.abs(this.mouseDOMDelta.x) >= this.mouseMoveOffset
        || Math.abs(this.mouseDOMDelta.y) >= this.mouseMoveOffset
  }

  /**
   * Calculate mouse DOM position delta
   */
  getMouseDOMDelta() {
    this.mouseDOMDelta.subVectors(this.mouseDOM, this.prevMouseDOM)
  }

  /**
   * Update method to be called in the animation loop
   */
  update() {
    this.getMouseDOMDelta()
    this.judgeIsMouseMoving()
    this.syncMouseDOM()
  }
}
