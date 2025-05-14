<script setup>
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'
import Experience from '../js/experience.js'
import { useLangStore } from '../js/store/lang.js'
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

// ===== 音乐相关 =====
const audioRef = ref(null) // audio 元素引用
const isMusicAllowed = ref(false) // 用户是否允许播放音乐
const isMusicPlaying = ref(false) // 当前音乐是否播放
const showMusicDialog = ref(false) // 是否显示弹窗
const dontAskNextTime = ref(false) // 是否下次不再询问

// 检查 localStorage，决定是否弹窗
onMounted(() => {
  const musicNoAsk = localStorage.getItem('musicNoAsk')
  const musicAllowed = localStorage.getItem('musicAllowed')
  if (musicNoAsk === 'true') {
    isMusicAllowed.value = musicAllowed === 'true'
    if (isMusicAllowed.value) {
      playMusic()
    }
    // 不弹窗
    showMusicDialog.value = false
  }
  else {
    // 每次都弹窗
    showMusicDialog.value = true
  }
})

// 播放音乐
function playMusic() {
  if (audioRef.value) {
    audioRef.value.play()
    isMusicPlaying.value = true
  }
}
// 暂停音乐
function pauseMusic() {
  if (audioRef.value) {
    audioRef.value.pause()
    isMusicPlaying.value = false
  }
}
// 切换音乐播放状态
function toggleMusic() {
  if (!isMusicAllowed.value)
    return
  if (isMusicPlaying.value) {
    pauseMusic()
  }
  else {
    playMusic()
  }
}
// 用户同意播放音乐
function allowMusic() {
  isMusicAllowed.value = true
  localStorage.setItem('musicAllowed', 'true')
  if (dontAskNextTime.value) {
    localStorage.setItem('musicNoAsk', 'true')
  }
  else {
    localStorage.removeItem('musicNoAsk')
  }
  playMusic()
  showMusicDialog.value = false
}
// 用户拒绝播放音乐
function denyMusic() {
  isMusicAllowed.value = false
  localStorage.setItem('musicAllowed', 'false')
  if (dontAskNextTime.value) {
    localStorage.setItem('musicNoAsk', 'true')
  }
  else {
    localStorage.removeItem('musicNoAsk')
  }
  pauseMusic()
  showMusicDialog.value = false
}
// 监听 isMusicAllowed，自动播放/暂停
watch(isMusicAllowed, (val) => {
  if (val) {
    playMusic()
  }
  else {
    pauseMusic()
  }
})

// ===== 语言/i18n 相关 =====
const langStore = useLangStore()
const { lang } = storeToRefs(langStore)
const langs = {
  zh: {
    musicTitle: '是否允许播放背景音乐？',
    musicDesc: '为提升游戏体验，建议开启音乐。您可随时在右上角按钮切换。',
    dontAsk: '下次不再询问',
    allow: '允许',
    deny: '拒绝',
    musicOn: '音乐开',
    musicOff: '音乐关',
    musicSwitch: '音乐开关',
    langBtn: 'EN',
  },
  en: {
    musicTitle: 'Allow background music?',
    musicDesc: 'For a better experience, we recommend enabling music. You can always toggle it in the top right corner.',
    dontAsk: 'Don\'t ask again',
    allow: 'Allow',
    deny: 'Deny',
    musicOn: 'Music On',
    musicOff: 'Music Off',
    musicSwitch: 'Music',
    langBtn: '中',
  },
}
const t = () => langs[lang.value]
function toggleLang() {
  langStore.setLang(lang.value === 'zh' ? 'en' : 'zh')
}
</script>

<template>
  <div class="fixed top-4 right-14 flex gap-4 z-[1000] select-none touch-none">
    <!-- 音乐开关按钮 -->
    <button
      class="w-12 h-12 flex items-center justify-center rounded   mr-2"
      :disabled="!isMusicAllowed"
      :title="t().musicSwitch"
      @click="toggleMusic"
    >
      <img v-if="isMusicPlaying" src="/image/musicOn.png" :alt="t().musicOn" class="w-10 h-10">
      <img v-else src="/image/musicOff.png" :alt="t().musicOff" class="w-10 h-10">
    </button>
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
    <!-- 隐藏的 audio 元素，循环播放 -->
    <audio
      ref="audioRef"
      src="/audio/bg.mp3"
      loop
      preload="auto"
      style="display:none"
    />
    <!-- 弹窗：每次进入都询问，允许用户选择下次不再询问 -->
    <div v-if="showMusicDialog" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[2000]">
      <div class="rounded-lg p-6 shadow-lg flex flex-col items-center">
        <div class="pixel">
          <div class="mb-4 text-2xl font-bold">
            {{ t().musicTitle }}
          </div>
          <div class="mb-4 text-white/75">
            {{ t().musicDesc }}
          </div>
          <label class="flex items-center mb-6 select-none">
            <input v-model="dontAskNextTime" type="checkbox" class="mr-2">
            <span class="text-lg text-gray-500">{{ t().dontAsk }}</span>
          </label>
          <div class="flex gap-4 justify-center text-lg">
            <button class="px-4 py-2 bg-green-500 text-white rounded" @click="allowMusic">
              {{ t().allow }}
            </button>
            <button class="px-4 py-2 bg-gray-300 text-gray-700 rounded" @click="denyMusic">
              {{ t().deny }}
            </button>
          </div>
          <!-- 右上角绝对定位的语言切换按钮 -->
          <button class="absolute top-2 right-2 z-[2001] text-base sm:text-xl font-bold bg-yellow-300 text-black rounded px-2 py-1 shadow hover:brightness-110 transition-all" title="切换语言" @click="toggleLang">
            {{ t().langBtn }}
          </button>
        </div>
      </div>
    </div>
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
