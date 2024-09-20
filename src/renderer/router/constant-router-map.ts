import { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
    { path: '/:pathMatch(.*)*', component: () => import("@renderer/views/404.vue") },
    { path: '/', name: 'LandingPage', component: () => import('@renderer/views/landing-page/LandingPage.vue') },
]

export default routes
