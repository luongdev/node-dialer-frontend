import { defineStore } from "pinia";
import { watch } from "vue";

import router from "@renderer/router";

export enum CallStatus {
    S_NEW = 'NEW',
    S_RINGING = 'RINGING',
    S_ANSWERED = 'ANSWERED',
    S_TERMINATED = 'TERMINATED'
}

export interface CallState {
    id: string;
    status: string;
    inbound?: boolean;
    from?: string;
    to?: string;
    startTime?: number;
    answerTime?: number;
}

export const useCallStore = defineStore({
    id: 'call',
    state: (): CallState => {
        return { id: '', status: '' }
    },
    actions: {
        init: async function (id: string, from: string, to: string, inbound: boolean) {
            if (this.id.length) {
                return;
            }

            this.id = id;
            this.status = CallStatus.S_NEW;
            this.inbound = inbound;
            this.from = from;
            this.to = to;
            this.startTime = Date.now();
        }
    },
});

export const statusWatcherStart = () => {
    const call = useCallStore();
    watch(() => call.status, (status: CallStatus) => {
        switch (status) {
            case CallStatus.S_NEW:
            case CallStatus.S_RINGING:
                router.push(call.inbound ? '/incoming-call' : '/outgoing-call').catch(console.error);
                break;
            case CallStatus.S_ANSWERED:
                router.push('/active-call').catch(console.error);
                break;
            case CallStatus.S_TERMINATED:
                router.push('/').catch(console.error);
                break;
        }
    });
}