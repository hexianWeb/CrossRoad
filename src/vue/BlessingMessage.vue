<script setup>
import { defineProps } from 'vue'
// 通过 props 接收显示与文本内容
const props = defineProps({
  show: Boolean,
  text: {
    type: String,
    default: '端午安康，粽子快乐！',
  },
})
</script>

<template>
  <div class="fixed top-0 left-0 w-full flex justify-center z-[9999] select-none pointer-events-none">
    <div v-if="props.show" class="mt-6 bg-green-600 bg-opacity-70 text-white text-xl md:text-2xl font-bold px-8 py-3 rounded-xl shadow-lg animate-fade-in-down">
      {{ props.text }}
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in-down {
  0% {
    opacity: 0;
    transform: translateY(-40px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-down {
  animation: fade-in-down 0.4s cubic-bezier(0.4,0,0.2,1);
}
</style>
