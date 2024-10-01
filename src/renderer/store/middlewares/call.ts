import { PiniaPlugin } from "pinia";
import { watch } from "vue";
import { CallStatus, useCall } from "@store/call/call";

import router from '@renderer/router';
import { useError, ErrorType } from "@store/error";

const { ipcRendererChannel } = window;
ipcRendererChannel.BroadcastCall.on(async (_, data) => {
    const { event, payload } = data || {};

    const call = useCall();
    if ('StatusUpdated' === event) {
        const { status } = payload || {};
        if (status !== call.status) {
            call.status = status;
        }
    } else if ('StateUpdated' === event) {
        const state = payload || {};
        Object.keys(state).forEach(k => {
            if (call[k] !== state[k]) call[k] = state[k];
        });
    }
});


export const callStoreMiddleware: PiniaPlugin = ({ store }) => {
    if (store.$id !== 'call') return;

    watch(() => store.status, (crntStatus, prevStatus) => {
        console.log('Day la call status: ', { prev: prevStatus, status: crntStatus });

        switch (crntStatus) {
            case CallStatus.S_NEW:
            case CallStatus.S_CONNECTING:
            case CallStatus.S_RINGING:
                const routerUrl = store.current.inbound ? '/incoming-call' : '/outgoing-call';
                router?.push(routerUrl)?.catch(console.error);

                if (store.inbound) {
                    ipcRendererChannel.FocusMainWindow.invoke(routerUrl).catch(console.error);
                }
                break;
            case CallStatus.S_ANSWERED:
                if (prevStatus?.length && CallStatus.S_TERMINATED !== prevStatus) {
                    router?.push('/active-call')?.catch(console.error);
                }
                break;
            default:
                if (prevStatus?.length) {
                    store.timer = setTimeout(() => {
                        store.timer = null;
                        const error = useError();
                        if (error.eType?.length && error.eType !== ErrorType.E_CALL) {
                            return;
                        }

                        const back = router.currentRoute?.value?.redirectedFrom;
                        router?.push(back ?? '/')?.catch(console.error);
                    }, 3000);

                    store.id = '';
                }
                break;
        }
    });
}
