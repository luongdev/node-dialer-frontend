import { causes } from 'jssip/lib/Constants';
import { RemovableRef, useStorage } from '@vueuse/core';
import { defineStore } from "pinia";
import { ResetFn, useLocal } from '@store/types';
import { computed } from 'vue';

const { ipcRendererChannel } = window;

export enum CallStatus {
    S_NEW = 'NEW',
    S_CONNECTING = 'CONNECTING',
    S_RINGING = 'RINGING',
    S_ANSWERED = 'ANSWERED',
    S_REJECTED = 'REJECTED',
    S_CANCELED = 'CANCELED',
    S_TERMINATED = 'TERMINATED',
    S_ERROR = 'ERROR',
}

export interface CallInfo {
    id?: string;
    to?: string;
    from?: string;
    startTime?: number;
    inbound?: boolean;
    autoAnswer: boolean;
    allowReject: boolean;
}
export interface CallState {
    current: RemovableRef<CallInfo>;
    status: RemovableRef<CallStatus>;
    answerTime: RemovableRef<number>;
    error: RemovableRef<string>;

    mute: RemovableRef<boolean>;
    hold: RemovableRef<boolean>;

    timer?: NodeJS.Timeout;
}

export const useLabel = () => {
    const call = useCall();

    return computed(() => {
        switch (call.status) {
            case CallStatus.S_NEW:
            case CallStatus.S_CONNECTING:
                return 'Đang kết nối';
            case CallStatus.S_RINGING:
                return 'Đang đổ chuông';
            case CallStatus.S_ANSWERED:
                return 'Đã kết nối';
            case CallStatus.S_REJECTED:
                return 'Từ chối cuộc gọi';
            case CallStatus.S_CANCELED:
                return 'Cuộc gọi đã hủy';
            case CallStatus.S_TERMINATED:
                return 'Đã kết thúc';
            case CallStatus.S_ERROR:
                return 'Lỗi kết nối';
            default:
                return 'Chờ cuộc gọi';
        }
    });
}

export const useCall = defineStore({
    id: 'call',
    state: (): CallState => {
        const current = useLocal<CallInfo>('call_current');
        const status = useLocal<CallStatus>('call_status');
        const answerTime = useLocal<number>('call_answerTime', 0);
        const error = useLocal<string>('call_error');
        const mute = useLocal<boolean>('call_mute', false);
        const hold = useLocal<boolean>('call_hold', false);

        return { current, status, answerTime, error, mute, hold };
    },
    actions: {
        init: function (call: CallInfo) {
            if (this.timer) clearTimeout(this.timer);

            if (this.current?.id) {
                console.log('Call already exists: ', this.current);
                return;
            }

            this.current = call;
            this.status = CallStatus.S_NEW;
        },

        make: async function (number: string, did = '', headers: { [k: string]: string } = {}) {
            await ipcRendererChannel.Broadcast.invoke({
                type: 'Call',
                body: { event: 'Make', payload: { number, did: `${did}`, headers } },
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

        [ResetFn]: function () {
            this.current = {};
            this.status = '';
            this.error = '';
            this.answerTime = 0;
            this.mute = false;
            this.hold = false;
            this.timer = null;
        },
    },
});
