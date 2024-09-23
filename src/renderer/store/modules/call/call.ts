import {defineStore} from "pinia";

export enum CallStatus {
    S_NEW = 'NEW',
    S_CONNECTING = 'CONNECTING',
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
        return {id: '', status: ''}
    },
    actions: {
        init: function (id: string, from: string, to: string, inbound: boolean) {
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
