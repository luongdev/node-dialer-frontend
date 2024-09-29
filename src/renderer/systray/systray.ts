import { createApp } from "vue";
import { createPinia } from "pinia";
import { createRouter, createWebHashHistory } from "vue-router";

import '../styles/index.css';
import { Tooltip } from 'ant-design-vue';

import Systray from "./Systray.vue";

import { sipMiddleware } from './store/middlewares/sip';
import { audioMiddleware } from './store/middlewares/audio';
import { reset } from '@renderer/store/middlewares/reset';

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/', component: () => import('./views/Agent.vue') },
        { path: '/call', component: () => import('./views/Call.vue') },
    ],
})

const tray = createApp(Systray);
tray.use(router);

const store = createPinia();
store.use(reset);
store.use(sipMiddleware);
store.use(audioMiddleware);

tray.use(store);
tray.use(Tooltip);

tray.mount("#systray");