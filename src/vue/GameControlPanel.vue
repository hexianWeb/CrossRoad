<script setup>
import { ref } from 'vue'
import Experience from '../js/experience.js'
import LeaderboardDialog from './LeaderboardDialog.vue'
import PauseGuide from './PauseGuide.vue'

// 是否处于暂停状态
const isPaused = ref(false)
const showLeaderboard = ref(false)
// 触发事件并切换按钮状态
function handleTogglePause() {
  const exp = new Experience()
  if (!isPaused.value) {
    exp.trigger('pause')
    isPaused.value = true
  }
  else {
    exp.trigger('resume')
    isPaused.value = false
  }
}

// 重开按钮
function handleRestart() {
  const exp = new Experience()
  exp.trigger('restart')
  isPaused.value = false // 重开后恢复为未暂停
}

// 继续按钮回调
function handleContinue() {
  const exp = new Experience()
  exp.trigger('resume')
  isPaused.value = false
}
</script>

<template>
  <div class="fixed top-4 right-14 flex gap-4 z-[1000] select-none touch-none">
    <!-- 排行榜按钮 -->
    <button
      class="w-12 h-12 flex items-center justify-center rounded"
      @click="showLeaderboard = true"
    >
      <img src="/image/leaderboardsComplex.png" alt="排行榜" class="w-12 h-12">
    </button>
    <!-- 左侧：暂停/播放 toggle -->
    <button
      class="w-12 h-12 flex items-center justify-center  rounded opacity-100"
      @click="handleTogglePause"
    >
      <img
        v-if="!isPaused"
        src="/image/pause.png"
        alt="暂停"
        class="w-12 h-12"
      >
      <img
        v-else
        src="/image/play.png"
        alt="播放"
        class="w-12 h-12"
      >
    </button>
    <!-- 右侧：重开 -->
    <button
      class="w-12 h-12 flex items-center justify-center rounded opacity-100"
      @click="handleRestart"
    >
      <img
        src="/image/restart.png"
        alt="重开"
        class="w-12 h-12"
      >
    </button>
    <!-- 暂停时显示操作指南弹窗 -->
    <PauseGuide v-if="isPaused" @continue="handleContinue" />
    <LeaderboardDialog v-if="showLeaderboard" @close="showLeaderboard = false" />
  </div>
</template>

<style scoped>
button {
  transition: transform 0.1s;
}
button:active {
  transform: scale(0.95);
}
</style>
