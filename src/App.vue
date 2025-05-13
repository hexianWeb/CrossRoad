<script setup>
import { onMounted, ref } from 'vue'
import Experience from './js/experience.js'
import { isMobile } from './js/world/tool.js'
import GameControlPanel from './vue/GameControlPanel.vue'
import KeyIndicator from './vue/KeyIndicator.vue'
import ScorePanel from './vue/ScorePanel.vue'

const threeCanvas = ref(null)
const maxZScore = ref(0)
const itemScoreSum = ref(0)
const highScore = ref(Number(localStorage.getItem('highScore') || 0))

onMounted(() => {
  // 初始化 three.js 场景
  new Experience(threeCanvas.value)
  // 监听分数事件
  const exp = new Experience()
  exp.on('scoreUpdate', (newScore) => {
    maxZScore.value = newScore
    const totalScore = maxZScore.value + itemScoreSum.value
    if (totalScore > highScore.value) {
      highScore.value = totalScore
      localStorage.setItem('highScore', totalScore)
    }
  })
  exp.on('itemScore', (addScore) => {
    itemScoreSum.value += addScore
    const totalScore = maxZScore.value + itemScoreSum.value
    if (totalScore > highScore.value) {
      highScore.value = totalScore
      localStorage.setItem('highScore', totalScore)
    }
  })
  exp.on('restart', () => {
    itemScoreSum.value = 0
    maxZScore.value = 0
  })
})
</script>

<template>
  <div class="relative w-screen h-screen">
    <!-- three.js 渲染的 canvas -->
    <canvas ref="threeCanvas" class="three-canvas absolute inset-0 z-[999]" />
    <!-- 游戏控制面板 -->
    <GameControlPanel />
    <!-- 分数面板 -->
    <ScorePanel :score="maxZScore + itemScoreSum" :high-score="highScore" />
    <!-- 按键反馈指示器 -->
    <KeyIndicator v-if="!isMobile()" />
  </div>
</template>

<style scoped>
.three-canvas {
  width: 100vw;
  height: 100vh;
  display: block;
}
</style>
