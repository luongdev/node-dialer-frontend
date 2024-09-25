import {defineStore} from "pinia";

export interface AudioState {
    remote?: MediaStream;
    local?: MediaStream;
    error?: string;
}

export const useAudio = defineStore({
    id: 'audio',
    state: (): AudioState => {
        return {
            remote: undefined,
            local: undefined,
            error: '',
        }
    },
    actions: {
        start: async function (): Promise<AudioState> {
            this.error = undefined;
            this.local = await navigator.mediaDevices.getUserMedia({audio: true, video: false});
            this.remote = new MediaStream();

            return {local: this.local, remote: this.remote};
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

            this.error = '';
        }
    }
})
