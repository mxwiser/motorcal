import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { initLang } from './lib/i18n'

initLang()

createApp(App).mount('#app')
