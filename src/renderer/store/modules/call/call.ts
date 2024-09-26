import { causes } from "jssip/lib/Constants";
import { defineStore } from "pinia";

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
    id: string;
    status: string;
    inbound?: boolean;
    from?: string;
    to?: string;
    startTime?: number;
    answerTime?: number;
    error?: string;
    timer?: NodeJS.Timeout;

    mute: boolean;
    hold: boolean;
}

export const useCallStore = defineStore({
    id: 'call',
    state: (): CallState => {
        return { id: '', status: '', error: '', mute: false, hold: false };
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
        terminate: async function () {
            await ipcRendererChannel.Broadcast.invoke({
                type: 'Call',
                body: { event: 'Terminated', payload: { code: 200, cause: causes.BYE } },
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
        }
    },
});
