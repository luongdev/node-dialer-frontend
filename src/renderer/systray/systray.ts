import {createApp} from "vue";
import {createPinia} from "pinia";

import "../styles/index.css";

import Systray from "./Systray.vue";

const tray = createApp(Systray);
const store = createPinia();

tray.mount("#systray");
