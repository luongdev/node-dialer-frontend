import {defineStore} from "pinia";
import {RemovableRef, useStorage} from "@vueuse/core";
import {ref} from "vue";

export enum CallStatus {
    S_NEW = 'NEW',
    S_RINGING = 'RINGING',
    S_ANSWERED = 'ANSWERED',
    S_TERMINATED = 'TERMINATED'
}

export interface CallState {
    id: RemovableRef<string>;
    status: RemovableRef<string>;
    inbound?: boolean;
    from?: string;
    to?: string;
    startTime?: number;
    answerTime?: number;
}

export const useCallStore = defineStore({
    id: 'call',
    state: (): CallState => {
        const id = useStorage('call_id', ref(''));
        const status = useStorage('call_status', ref(''));

        return { id, status }
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
})
