import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

// 引入Element Plus
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

// 引入全局样式
import './assets/css/global.css';

// 创建Vue应用
const app = createApp(App);

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 使用插件
app.use(ElementPlus);
app.use(store);
app.use(router);

// 挂载应用
app.mount('#app'); 