import { createApp } from 'vue' 
import { createPinia } from 'pinia' 
import App from './App.vue' 
import router from './router' 
 import * as VueGtag from 'vue-gtag'
import VueSweetalert2 from 'vue-sweetalert2'
import "bootstrap/dist/js/bootstrap.bundle.min.js"; 

const app = createApp(App) 
const pinia = createPinia(); 

// 🛠️ FIX 2: Remove the leading whitespace from your Measurement ID
app.use(VueGtag.default || VueGtag, { 
  config: { id: "G-T6QMRGJSWS" } 
}, router) 

app.use(router) 
app.use(pinia); 
app.use(VueSweetalert2) 

app.mount('#app')

