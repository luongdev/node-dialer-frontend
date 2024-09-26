import {PiniaPlugin} from "pinia";
import {watch} from "vue";
import {CallStatus, useCallStore} from "@store/call/call";

import router from '@renderer/router';

const {ipcRendererChannel} = window;
ipcRendererChannel.BroadcastCall.on(async (_, data) => {
    const {event, payload} = data || {};

    const call = useCallStore();
    if ('Initialized' === event) {
        const {from, to, id, inbound} = payload || {};
        call.init(id, from, to, inbound);

    } else if ('StatusUpdated' === event) {
        const {status} = payload || {};
        if (status !== call.status) {
            call.status = status;
        }
    }
});


export const callStoreMiddleware: PiniaPlugin = ({store}) => {
    if (store.$id !== 'call') return;

    watch(() => store.status, (crntStatus, prevStatus) => {
        console.log('Day la call status: ', {prev: prevStatus, status: crntStatus});


        switch (crntStatus) {
            case CallStatus.S_NEW:
            case CallStatus.S_CONNECTING:
            case CallStatus.S_RINGING:
                const routerUrl = store.inbound ? '/incoming-call' : '/outgoing-call';
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
                        const back = router.currentRoute?.value?.redirectedFrom;
                        router?.push(back ?? '/')?.catch(console.error);
                    }, 3000);
                    
                    store.id = '';
                }
                break;
        }
    });
}
