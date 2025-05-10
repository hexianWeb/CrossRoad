<script setup>
import { onMounted, ref } from 'vue'
import Experience from './js/experience.js'
import GameControlPanel from './vue/GameControlPanel.vue'
import ScorePanel from './vue/ScorePanel.vue'

const threeCanvas = ref(null)
const score = ref(0)
const highScore = ref(Number(localStorage.getItem('highScore') || 0))

onMounted(() => {
  // 初始化 three.js 场景
  new Experience(threeCanvas.value)
  // 监听分数事件
  const exp = new Experience()
  exp.on('scoreUpdate', (newScore) => {
    score.value = newScore
    if (newScore > highScore.value) {
      highScore.value = newScore
      localStorage.setItem('highScore', newScore)
    }
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
    <ScorePanel :score="score" :high-score="highScore" />
  </div>
</template>

<style scoped>
.three-canvas {
  width: 100vw;
  height: 100vh;
  display: block;
}
</style>
