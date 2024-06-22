import { createApp } from 'vue';
import App from './App.vue';
import Vant from 'vant';
import axios from 'axios';
import 'vant/lib/index.css';
// 配置Axios
const app = createApp(App);
// Add axios to global properties
app.config.globalProperties.$axios = axios;
app.use(Vant);
app.mount('#app');