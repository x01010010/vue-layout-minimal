import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import './styles/animations.css'

const app = createApp(App)
const pinia = createPinia()

app.use(vuetify)
app.use(pinia)

app.mount('#app')