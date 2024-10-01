import { defineStore } from "pinia";
import { RemovableRef, useStorage } from "@vueuse/core";
import { ErrorType, useError } from "@renderer/store/modules/error";

export interface AudioState {
    remote?: MediaStream;
    local?: MediaStream;
    inputId: RemovableRef<string>;
    outputId: RemovableRef<string>;
}

export const useAudio = defineStore({
    id: 'audio',
    state: (): AudioState => {
        const inputId = useStorage('io_inputId', '');
        const outputId = useStorage('io_outputId', '');

        return {
            remote: undefined,
            local: undefined,
            inputId,
            outputId,
        }
    },
    actions: {
        start: async function (devId?: string) {
            try {
                const constraints = { video: false };
                if (devId) {
                    constraints['audio'] = { deviceId: { exact: devId } };
                    this.inputId = devId;
                } else {
                    constraints['audio'] = true;
                    this.inputId = 'default';
                }

                this.remote = new MediaStream();
                this.local = await navigator.mediaDevices.getUserMedia(constraints);

                return { local: this.local, remote: this.remote };
            } catch (e) {
                this.inputId = '';
                const error = useError();
                error.set(ErrorType.E_MICROPHONE, 'Không thể truy cập microphone');

                return { error: true, cause: e.message };
            }
        },
        play(remoteStream?: MediaStream) {
            if (remoteStream) {
                this.remote = remoteStream;
            }

            const audioElm = new window.Audio();
            audioElm.srcObject = this.remote;
            audioElm.play().catch(console.error);
        },
        stop: function () {
            this.local?.getTracks().forEach((track: any) => track.stop());
            this.remote?.getTracks().forEach((track: any) => track.stop());

            this.inputId = '';
            this.timer = null;
        }
    }
});