import { createApp } from "vue";
import { createPinia } from "pinia";

import "./styles/index.css";
import 'ant-design-vue/dist/reset.css';

import "./permission";
import App from "./App.vue";
import router from "./router";

import antd from 'ant-design-vue';

import { errorHandler } from "./error";
import "./utils/hackIpcRenderer";
import { callStoreMiddleware } from "./store/middlewares/call";

const app = createApp(App);
const store = createPinia();

store.use(callStoreMiddleware);

app.use(router);
app.use(store);
app.use(antd);

router.push('/')

errorHandler(app);

app.mount("#app");
