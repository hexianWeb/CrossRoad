import { defineStore } from 'pinia'
import { ref } from 'vue'

// 全局语言状态管理
export const useLangStore = defineStore('lang', () => {
  // 初始化时从 localStorage 读取
  const defaultLang = localStorage.getItem('lang') || 'zh'
  const lang = ref(defaultLang)

  // 切换语言并持久化
  function setLang(newLang) {
    lang.value = newLang
    localStorage.setItem('lang', newLang)
  }

  return { lang, setLang }
})
