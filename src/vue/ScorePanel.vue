<script setup>
import { storeToRefs } from 'pinia'
import { useLangStore } from '../js/store/lang.js'

defineProps({
  score: { type: Number, default: 0 },
  highScore: { type: Number, default: 0 },
})
const langStore = useLangStore()
const { lang } = storeToRefs(langStore)

const langs = {
  zh: {
    score: '分数',
    highScore: '最高分',
  },
  en: {
    score: 'Score',
    highScore: 'High Score',
  },
}
const t = () => langs[lang.value]
</script>

<template>
  <div class="fixed top-10 left-10 z-[999] px-6 py-3 rounded-lg shadow-lg">
    <div class="text-[10vh] font-bold text-center text-white/95 select-none" style="letter-spacing:2px;">
      {{ score }}
    </div>
    <div class="text-2xl  text-white/80 mt-1 select-none">
      {{ t().highScore }}：{{ highScore }}
    </div>
  </div>
</template>
