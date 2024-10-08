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
import { callStoreMiddleware } from "@renderer/store/middlewares/call";
import { userStoreMiddleware } from "./store/middlewares/user";
import { storage } from "./store/middlewares/storage";

const app = createApp(App);
const store = createPinia();

store.use(storage);
store.use(callStoreMiddleware);
store.use(userStoreMiddleware);

app.use(router);
app.use(store);
app.use(antd);

errorHandler(app);

app.mount("#app");
