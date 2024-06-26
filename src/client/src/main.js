import { createApp } from 'vue';

import { Icon } from 'vant';
import App from './App.vue';
import Vant from 'vant';
import axios from 'axios';
import 'vant/lib/index.css';

import Home from './components/Home.vue';
import SendInfo from './components/SendInfo.vue';
import UploadFile from './components/UploadFile.vue';
import { createRouter, createWebHistory } from 'vue-router'


const routes = [
    { path: '/', component: Home },
    { path: '/about', component: SendInfo },
    { path: '/upload', component: UploadFile }
];
const router = createRouter({
    history: createWebHistory(),
    routes: routes,
});
const app = createApp(App);
app.use(Icon);
// 配置Axios
// Add axios to global properties
app.config.globalProperties.$axios = axios;
app.use(Vant);
app.use(router).mount('#app');




