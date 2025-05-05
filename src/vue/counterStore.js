import { defineStore } from 'pinia'
import { ref } from 'vue'

// Pinia 计数器 Store 示例
export const useCounterStore = defineStore('counter', () => {
  // 计数器状态
  const counter = ref(0)

  // 增加计数
  function increment() {
    counter.value++
  }

  // 减少计数
  function decrement() {
    counter.value--
  }

  return { counter, increment, decrement }
})
