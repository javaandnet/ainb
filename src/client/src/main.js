import { createApp } from 'vue';

import App from './App.vue';
import { Button } from 'vant';
import { Watermark } from 'vant';
import { Divider } from 'vant';
import { Empty } from 'vant';

 

 
const app = createApp(App);
app.use(Button);
app.use(Watermark);
app.use(Divider);
app.use(Empty);
app.mount('#app');

// Vue.prototype.$socket =  io("https://localhost");