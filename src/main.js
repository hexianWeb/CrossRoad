import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import './css/global.css'
import './scss/global.scss'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
