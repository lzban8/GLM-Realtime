import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import '@/assets/style/index.less' // 初始化样式，全局样式

// 导出Vue到全局
window.Vue = {
  createApp,
  version: '3.x'
};

const app = createApp(App);

// 使用element-ui
app.use(ElementPlus);

// 使用路由
app.use(router);

// 标记Vue应用已就绪
window.__VUE_APP_READY = true;

app.mount('#app');