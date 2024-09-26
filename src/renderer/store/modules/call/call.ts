import { causes } from "jssip/lib/Constants";
import { RemovableRef, Serializer, useStorage } from '@vueuse/core';
import { defineStore } from "pinia";
import { ref } from "vue";

const { ipcRendererChannel } = window;


export enum CallStatus {
    S_NEW = 'NEW',
    S_CONNECTING = 'CONNECTING',
    S_RINGING = 'RINGING',
    S_ANSWERED = 'ANSWERED',
    S_REJECTED = 'REJECTED',
    S_TERMINATED = 'TERMINATED',
    S_ERROR = 'ERROR',
}
causes
export interface CallState {
    id: RemovableRef<string>;
    status: RemovableRef<string>;
    inbound: RemovableRef<boolean>;
    from: RemovableRef<string>;
    to: RemovableRef<string>;
    startTime: RemovableRef<number>;
    answerTime: RemovableRef<number>;
    error: RemovableRef<string>;
    timer?: NodeJS.Timeout;

    mute: RemovableRef<boolean>;
    hold: RemovableRef<boolean>;
}

const JSONSerializer: Serializer<any> = {
    read: (raw: string) => {
        if (!raw) return undefined;

        return JSON.parse(raw);
    },
    write: (value: any) => {
        if (!value) return undefined;

        return JSON.stringify(value);
    }
}

export const useCallStore = defineStore({
    id: 'call',
    state: (): CallState => {
        const id = useStorage('call_id', ref(''));
        const status = useStorage('call_status', ref(''));
        const inbound = useStorage('call_inbound', null, localStorage, { serializer: JSONSerializer });
        const from = useStorage('call_from', ref(''));
        const to = useStorage('call_to', ref(''));
        const startTime = useStorage('call_startTime', ref(0));
        const answerTime = useStorage('call_answerTime', ref(0));
        const error = useStorage('call_error', ref(''));
        const mute = useStorage('call_mute', ref(false));
        const hold = useStorage('call_hold', ref(false));

        return { id, status, inbound, from, to, startTime, answerTime, error, mute, hold };
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
            this.error = '';
        },

        make: async function (number: string, headers: { [k: string]: string } = {}) {
            await ipcRendererChannel.Broadcast.invoke({
                type: 'Call',
                body: { event: 'Make', payload: { number, headers } },
            });
        },

        answer: async function () {
            await ipcRendererChannel.Broadcast.invoke({
                type: 'Call',
                body: { event: 'Answer' },
            });
        },

        reject: async function () {
            await ipcRendererChannel.Broadcast.invoke({
                type: 'Call',
                body: { event: 'Terminated', payload: { code: 486, cause: causes.REJECTED } },
            });
        },

        terminate: async function (code?: number, cause?: string) {
            await ipcRendererChannel.Broadcast.invoke({
                type: 'Call',
                body: { event: 'Terminated', payload: { code: code ?? 200, cause: cause ?? 'NORMAL_CLEARING' } },
            });
        },

        toggleHold: async function () {
            await ipcRendererChannel.Broadcast.invoke({
                type: 'Call',
                body: { event: 'ToggleHold' },
            });
        },

        toggleMute: async function () {
            await ipcRendererChannel.Broadcast.invoke({
                type: 'Call',
                body: { event: 'ToggleMute' },
            });
        },

    },
});

window.addEventListener('storage', (event: StorageEvent) => {
    console.log('storage event', event);
});
