import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import pinia from './store';
import router from './router';

import "core-js/stable";

const app = createApp(App);
app.use(pinia);
app.use(router);
app.mount('#app');


