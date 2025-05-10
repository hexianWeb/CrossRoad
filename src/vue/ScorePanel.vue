<script setup>
defineProps({
  score: { type: Number, default: 0 },
  highScore: { type: Number, default: 0 },
})
</script>

<template>
  <div class="fixed top-10 left-10 z-[1000] px-6 py-3 rounded-lg shadow-lg">
    <div class="text-[10vh] font-bold text-center text-white/95 select-none" style="letter-spacing:2px;">
      {{ score }}
    </div>
    <div class="text-2xl  text-white/80 mt-1 select-none">
      最高分：{{ highScore }}
    </div>
  </div>
</template>
