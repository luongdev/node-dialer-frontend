import {defineStore} from "pinia";
import {RemovableRef, useStorage} from "@vueuse/core";
import {RTCSession} from "jssip/lib/RTCSession";
import {ref, watch} from "vue";
import {useAudioStore} from "@store/call/audio";

export interface CallState {
    callId: RemovableRef<string>;
    callStatus: RemovableRef<string>;
    direction?: string;
    from?: string;
    to?: string;
    startTime?: number;
    answerTime?: number;
    session?: RTCSession;
}

export const useCallStore = defineStore({
    id: 'call',
    state: (): CallState => {
        const callId = useStorage('callId', ref(''));
        const callStatus = useStorage('callStatus', ref('NEW'));

        return {
            callId,
            callStatus,
        }
    },
    actions: {
        init: async function (id: string, direction: string, from: string, to: string, session: RTCSession) {
            if (this.callId.length) {
                return;
            }

            this.callId = id;
            this.direction = direction;
            this.from = from;
            this.to = to;
            this.startTime = Date.now();
            this.session = session;

            await useAudioStore().start();
        },
        answer: function () {
            this.callStatus = 'ANSWERED';
            this.answerTime = Date.now();
            this.session?.answer({
                mediaConstraints: {audio: true, video: false},
                pcConfig: {iceServers: []},
                mediaStream: useAudioStore().local,
            });
        },
        terminate: function (code = 200, reason = 'OK') {
            this.callStatus = 'TERMINATED';
            this.session?.terminate({status_code: code, reason_phrase: reason});

            this.reset();
        },
        reset: function () {
            this.callId = '';
            this.callStatus = '';
        }
    },
})
