import { createApp } from "vue";
import { createPinia } from "pinia";
import { createRouter, createWebHashHistory } from "vue-router";

import '../styles/index.css';

import Systray from "./Systray.vue";

import { sipMiddleware } from "./store/middlewares/sip";
import { audioMiddleware } from "./store/middlewares/audio";

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/', component: () => import('./views/Agent.vue') },
    ],
})


const tray = createApp(Systray);
tray.use(router);

const store = createPinia();
store.use(sipMiddleware);
store.use(audioMiddleware);

tray.use(store);


tray.mount("#systray");
