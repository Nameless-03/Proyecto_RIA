import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { registrarServiceWorker } from './composables/useOffline'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// Registrar Service Worker para soporte offline.
registrarServiceWorker()
