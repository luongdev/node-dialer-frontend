import {RouteRecordRaw} from 'vue-router'

const routes: Array<RouteRecordRaw> = [
    {path: '/:pathMatch(.*)*', component: () => import("@renderer/views/404.vue")},
    {path: '/', name: 'Home', component: () => import('@renderer/views/home/HomePage.vue')},
    {path: '/active-call', name: 'Active Call', component: () => import('@renderer/views/call/ActiveCall.vue')},
    {path: '/incoming-call', name: 'Incoming Call', component: () => import('@renderer/views/call/IncomingCall.vue')},
    {path: '/outgoing-call', name: 'Outgoing Call', component: () => import('@renderer/views/call/OutgoingCall.vue')},

    {path: '/test', name: 'Outgoing Call', component: () => import('@renderer/views/dialer/Dialer.vue')},
]

export default routes
