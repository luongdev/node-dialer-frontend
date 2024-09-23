import { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
    { path: '/:pathMatch(.*)*', component: () => import("@renderer/views/error/404.vue") },
    { path: '/', name: 'Home', component: () => import('@renderer/views/home/HomePage.vue') },
    { path: '/signin', name: 'Sign In', component: () => import('@renderer/views/auth/SignIn.vue') },
    { path: '/active-call', name: 'Active Call', component: () => import('@renderer/views/call/ActiveCall.vue') },
    { path: '/incoming-call', name: 'Incoming Call', component: () => import('@renderer/views/call/IncomingCall.vue') },
    { path: '/outgoing-call', name: 'Outgoing Call', component: () => import('@renderer/views/call/OutgoingCall.vue') },
    {
        path: '/error',
        component: () => import("@renderer/views/error/Error.vue"),
        props: (route) => {
            return {
                error: route.query.error,
                message: route.query.message
            }
        }
    },
]

export default routes
