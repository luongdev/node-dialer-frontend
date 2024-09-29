import { PiniaPlugin } from "pinia";
import { watch } from "vue";

import router from '@renderer/router';
import { useUser } from "../modules/auth/user";
import { useLoading } from "../modules/loading";

const { ipcRendererChannel } = window;
ipcRendererChannel.BroadcastAgent.on(async (_, data) => {
    const { event, payload } = data || {};

    const user = useUser();
    const loading = useLoading();
    if ('StateUpdated' === event) {
        const { connecting, registering, registered, error } = payload || {};
        if (connecting || registering) loading.set(true);

        if (registered) {
            loading.set(false);
            user.loggedIn = true;
        }

        if (error?.length) {
            loading.set(false);
            user.loggedIn = false;
            user.error = error;
        }
    }
});


export const userStoreMiddleware: PiniaPlugin = ({ store }) => {
    if (store.$id !== 'user') return;

    watch(() => store.loggedIn, (loggedIn) => {
        router?.push(loggedIn ? '' : '/signin')?.catch(console.error);
    });

    store.$onAction(act => {
        if (act.name === 'register') {
            act.after(async () => {
                await ipcRendererChannel.Broadcast.invoke({ type: 'Agent', body: { event: 'StartConnect' } });
            });
        } else if (act.name === 'signOut') {
            act.after(async () => {
                await ipcRendererChannel.Broadcast.invoke({ type: 'Agent', body: { event: 'Stop' } });
            });
        }
    });
}