import {RouteRecordRaw} from 'vue-router'

const routes: Array<RouteRecordRaw> = [
    {path: '/:pathMatch(.*)*', component: () => import("@renderer/views/404.vue")},
    {path: '/', name: 'Home', component: () => import('@renderer/views/dialer/Dialer.vue')},
    {path: '/active-call', name: 'Active Call', component: () => import('@renderer/views/call/ActiveCall.vue')},
    {path: '/incoming-call', name: 'Incoming Call', component: () => import('@renderer/views/call/IncomingCall.vue')},
    {path: '/outgoing-call', name: 'Outgoing Call', component: () => import('@renderer/views/call/OutgoingCall.vue')},
]

export default routes
