<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

// 图片资源路径
const upImg = '/image/keyboard_arrow_up.png'
const upOutlineImg = '/image/keyboard_arrow_up_outline.png'
const downImg = '/image/keyboard_arrow_down.png'
const downOutlineImg = '/image/keyboard_arrow_down_outline.png'
const leftImg = '/image/keyboard_arrow_left.png'
const leftOutlineImg = '/image/keyboard_arrow_left_outline.png'
const rightImg = '/image/keyboard_arrow_right.png'
const rightOutlineImg = '/image/keyboard_arrow_right_outline.png'

// 四个方向的按下状态
const upPressed = ref(false)
const downPressed = ref(false)
const leftPressed = ref(false)
const rightPressed = ref(false)

// 键位映射表，支持 WASD 和方向键
const keyMap = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
}

// 处理按下事件
function handleKeyDown(e) {
  const dir = keyMap[e.code]
  if (!dir)
    return
  if (dir === 'up')
    upPressed.value = true
  if (dir === 'down')
    downPressed.value = true
  if (dir === 'left')
    leftPressed.value = true
  if (dir === 'right')
    rightPressed.value = true
}
// 处理松开事件
function handleKeyUp(e) {
  const dir = keyMap[e.code]
  if (!dir)
    return
  if (dir === 'up')
    upPressed.value = false
  if (dir === 'down')
    downPressed.value = false
  if (dir === 'left')
    leftPressed.value = false
  if (dir === 'right')
    rightPressed.value = false
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
})
</script>

<template>
  <div class="absolute left-1/2 bottom-12 -translate-x-1/2 flex flex-col items-center z-[2000] pointer-events-none select-none">
    <div class="flex flex-row justify-center mb-1">
      <!-- 上方向键 -->
      <img
        :src="upPressed ? upImg : upOutlineImg"
        alt="up"
        class="w-24 h-24 mx-1 drop-shadow transition-transform duration-100"
        draggable="false"
      >
    </div>
    <div class="flex flex-row justify-center">
      <!-- 左方向键 -->
      <img
        :src="leftPressed ? leftImg : leftOutlineImg"
        alt="left"
        class="w-24 h-24 mx-1 drop-shadow transition-transform duration-100"
        draggable="false"
      >
      <!-- 下方向键 -->
      <img
        :src="downPressed ? downImg : downOutlineImg"
        alt="down"
        class="w-24 h-24 mx-1 drop-shadow transition-transform duration-100"
        draggable="false"
      >
      <!-- 右方向键 -->
      <img
        :src="rightPressed ? rightImg : rightOutlineImg"
        alt="right"
        class="w-24 h-24 mx-1 drop-shadow transition-transform duration-100"
        draggable="false"
      >
    </div>
  </div>
</template>

<style scoped>
.key-indicator-wrapper {
  position: absolute;
  left: 50%;
  bottom: 6vh;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2000;
  pointer-events: none; /* 不影响鼠标事件 */
}
.key-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin: 0.2em 0;
}
.key-img {
  width: 48px;
  height: 48px;
  margin: 0 0.2em;
  user-select: none;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12));
  transition: filter 0.1s, transform 0.1s;
}
.key-img:active,
.key-img.pressed {
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.18));
  transform: scale(1.08);
}
</style>
