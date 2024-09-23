import { PiniaPlugin } from "pinia";
import { watch } from "vue";
import { CallStatus } from "@store/call/call";

import router from '@renderer/router';

export const callStoreMiddleware: PiniaPlugin = ({ store }) => {
    if (store.$id !== 'call') return;

    watch(() => store.status, (status: CallStatus) => {
        switch (status) {
            case CallStatus.S_NEW:
            case CallStatus.S_CONNECTING:
            case CallStatus.S_RINGING:
                router?.push(store.inbound ? '/incoming-call' : '/outgoing-call')?.catch(console.error);
                break;
            case CallStatus.S_ANSWERED:
                router?.push('/active-call')?.catch(console.error);
                break;
            default:
                setTimeout(() => {
                    const back = router.currentRoute?.value?.redirectedFrom;

                    router?.push(back ?? '/')?.catch(console.error);
                    store.id = '';
                    store.status = '';
                }, 3000);
                break;
        }
    });
}
