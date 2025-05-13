<script setup>
import { createClient } from '@supabase/supabase-js'
import { onMounted, ref } from 'vue'
import { SUPABASE_KEY, SUPABASE_TABLE, SUPABASE_URL } from '../js/constants.js'
// Supabase 配置
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const lang = ref(localStorage.getItem('lang') || 'zh')
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
    .limit(10)
  leaderboard.value = data || []
  loading.value = false
  if (error)
    console.error(error)
  else console.log(data)
}
onMounted(fetchLeaderboard)
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center z-[4000] bg-black/60">
    <div class="bg-white/95 rounded-lg p-6 w-80 relative">
      <div class="text-3xl font-bold text-center mb-4 text-yellow-600">
        {{ t().title }}
      </div>
      <button class="absolute top-2 right-3 text-lg" @click="$emit('close')">
        ✖
      </button>
      <div v-if="loading" class="text-center text-gray-500">
        Loading...
      </div>
      <table v-else class="w-full text-center text-2xl">
        <thead>
          <tr>
            <th>#</th>
            <th>{{ t().name }}</th>
            <th>{{ t().score }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in leaderboard" :key="item.id">
            <td>{{ i + 1 }}</td>
            <td>{{ item.username }}</td>
            <td>{{ item.score }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
