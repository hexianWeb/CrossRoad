<script setup>
import { computed } from 'vue'
import { useCounterStore } from './counterStore.js'

const store = useCounterStore()
const counter = computed(() => store.counter)
const increment = store.increment
const decrement = store.decrement
</script>

<template>
  <div class="bg-white/80 rounded-lg shadow-lg p-4 flex flex-col items-center gap-2 w-64">
    <h2 class="text-lg font-bold mb-2">
      示例控制面板
    </h2>
    <div class="flex items-center gap-2">
      <button class="btn" @click="decrement">
        -
      </button>
      <span class="text-xl font-mono">{{ counter }}</span>
      <button class="btn" @click="increment">
        +
      </button>
    </div>
    <p class="text-xs text-gray-500 mt-2">
      Pinia 状态管理演示
    </p>
  </div>
</template>

<style scoped>
.btn {
  @apply px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition;
}
</style>
