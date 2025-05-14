<script setup>
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { SUPABASE_TABLE } from '../js/constants.js'
import { useLangStore } from '../js/store/lang.js'
import { supabase } from '../js/utils/supabase.js'

const langStore = useLangStore()
const { lang } = storeToRefs(langStore)
const leaderboard = ref([])
const loading = ref(true)

const langs = {
  zh: { title: '排行榜', close: '关闭', name: '昵称', score: '分数' },
  en: { title: 'Leaderboard', close: 'Close', name: 'Name', score: 'Score' },
}
const t = () => langs[lang.value]

// 获取排行榜
async function fetchLeaderboard() {
  loading.value = true
  const { data, error } = await supabase
    .from(SUPABASE_TABLE)
    .select('*')
    .order('score', { ascending: false })
    .limit(100)
  leaderboard.value = data || []
  loading.value = false
  if (error)
    console.error(error)
}
onMounted(fetchLeaderboard)
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center z-[4000] bg-black/60">
    <!-- 移动端适配：宽度自适应，最大宽度限制，内边距缩小 -->
    <div class="bg-white/95 rounded-lg p-4 sm:p-6 w-full max-w-xs sm:w-80 relative max-h-[80vh] overflow-auto">
      <div class="text-2xl sm:text-3xl font-bold text-center mb-4 text-yellow-600">
        {{ t().title }}
      </div>
      <button class="absolute top-2 right-3 text-base sm:text-lg" @click="$emit('close')">
        ✖
      </button>
      <div v-if="loading" class="text-center text-gray-500">
        Loading...
      </div>
      <table v-else class="w-full text-center text-base sm:text-2xl">
        <thead>
          <tr>
            <th class="py-1">
              #
            </th>
            <th class="py-1">
              {{ t().name }}
            </th>
            <th class="py-1">
              {{ t().score }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in leaderboard" :key="item.id">
            <td class="py-1">
              {{ i + 1 }}
            </td>
            <td class="py-1 truncate max-w-[6rem]">
              {{ item.username }}
            </td>
            <td class="py-1">
              {{ item.score }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
