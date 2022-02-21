import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import * as Vue from 'vue' // in Vue 3
import axios from 'axios'
import VueAxios from 'vue-axios'
import store from "./store";
import VButton from './components/VButton.vue'
import Stats from "./components/Stats.vue"
createApp(App).use(VueAxios, axios).use(store)
.component('VButton',VButton)
.component('Stats',Stats)
.mount('#app')