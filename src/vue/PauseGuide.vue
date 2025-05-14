<script setup>
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { useLangStore } from '../js/store/lang.js'

const emit = defineEmits(['usernameSet', 'continue'])

// 语言支持
const langStore = useLangStore()
const { lang } = storeToRefs(langStore)
const username = ref(localStorage.getItem('username') || '')
const showNameInput = ref(!username.value)
const langs = {
  zh: {
    title: '操作指南',
    controlTitle: '如何控制小鸡',
    control1: '键盘 WASD 或 方向键 控制移动',
    control2: '移动端可通过滑动屏幕控制',
    itemTitle: '道具说明',
    nameLabel: '请输入用户名',
    namePlaceholder: '你的昵称',
    nameBtn: '确定',
    items: [
      { img: '/image/clock.png', label: '时停表：短暂减慢所有车辆' },
      { img: '/image/random.png', label: '随机箱：获得任意一种道具效果' },
      { img: '/image/sheid.png', label: '无敌盾：短时间内碰撞不失败' },
      { img: '/image/shoe.png', label: '加速鞋：短时间内移动更快' },
    ],
    continue: '继续',
    langBtn: 'EN',
  },
  en: {
    title: 'Game Guide',
    controlTitle: 'How to Control',
    control1: 'Move with WASD or Arrow Keys',
    control2: 'On mobile, swipe to move',
    itemTitle: 'Item Guide',
    nameLabel: 'Enter your username',
    namePlaceholder: 'Your nickname',
    nameBtn: 'OK',
    items: [
      { img: '/image/clock.png', label: 'Clock: Temporarily slow down all cars' },
      { img: '/image/random.png', label: 'Random Box: Get a random item effect' },
      { img: '/image/sheid.png', label: 'Shield: Invincible for a short time' },
      { img: '/image/shoe.png', label: 'Shoes: Move faster for a short time' },
    ],
    continue: 'Continue',
    langBtn: '中',
  },
}
const t = () => langs[lang.value]
function toggleLang() {
  langStore.setLang(lang.value === 'zh' ? 'en' : 'zh')
}
function saveName() {
  if (username.value.trim()) {
    localStorage.setItem('username', username.value.trim())
    showNameInput.value = false
    // 通知父组件用户名已设置
    emit('usernameSet', username.value.trim())
  }
}
function editName() {
  showNameInput.value = true
}
onMounted(() => {
  if (!username.value)
    showNameInput.value = true
})
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center z-[3000] bg-black/40">
    <!-- 外层容器移动端适配：宽度自适应，内边距缩小，最大高度适配 -->
    <div class="w-full max-w-xs sm:max-w-lg max-h-[80vh] h-fit p-4 sm:p-8 relative overflow-auto flex flex-col justify-between">
      <div class="pixel">
        <!-- 语言切换按钮 -->
        <button class="absolute top-2 right-2 text-base sm:text-xl font-bold bg-yellow-300 text-black rounded px-2 py-1 shadow hover:brightness-110 transition-all" @click="toggleLang">
          {{ t().langBtn }}
        </button>
        <!-- 用户名输入 -->
        <div v-if="showNameInput" class="mb-4 flex flex-col items-center">
          <label class="text-yellow-300 text-base sm:text-lg mb-2">{{ t().nameLabel }}</label>
          <input v-model="username" :placeholder="t().namePlaceholder" class="px-3 py-2 rounded text-black w-full max-w-[12rem] mb-2" maxlength="12">
          <button class="pixel-yellow px-4 py-1 rounded w-full max-w-[8rem]" @click="saveName">
            {{ t().nameBtn }}
          </button>
        </div>
        <div v-else class="mb-2 flex justify-start items-center">
          <span class="text-white mr-2 text-base sm:text-lg">{{ username }}</span>
          <button class="text-lg sm:text-xl text-blue-200 underline" @click="editName">
            ✏️
          </button>
        </div>
        <!-- 标题 -->
        <div class="text-xl sm:text-2xl font-bold text-center mb-3 text-yellow-300 tracking-widest">
          {{ t().title }}
        </div>
        <!-- 控制方式 -->
        <div class="mb-4">
          <div class="font-bold text-lg sm:text-2xl mb-1 text-blue-200">
            {{ t().controlTitle }}
          </div>
          <ul class="list-disc pl-4 sm:pl-6 text-sm sm:text-base text-white space-y-1">
            <li>{{ t().control1 }}</li>
            <li>{{ t().control2 }}</li>
          </ul>
        </div>
        <!-- 道具说明 单列4行 -->
        <div class="mb-4">
          <div class="font-bold text-sm sm:text-base mb-1 text-green-200">
            {{ t().itemTitle }}
          </div>
          <div class="flex flex-col gap-2 sm:gap-3">
            <div v-for="item in t().items" :key="item.img" class="flex items-center space-x-2 sm:space-x-4">
              <img :src="item.img" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/70 border border-white/20 flex-shrink-0" :alt="item.label">
              <span class="text-white text-base sm:text-xl">{{ item.label }}</span>
            </div>
          </div>
        </div>
        <!-- 继续按钮 -->
        <div class="flex justify-center mt-2">
          <button class="pixel-yellow px-6 sm:px-8 text-xs sm:text-base rounded shadow hover:brightness-110 transition-all w-full max-w-[10rem]" @click="$emit('continue')">
            {{ t().continue }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
