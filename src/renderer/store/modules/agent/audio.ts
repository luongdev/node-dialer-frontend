import {defineStore} from "pinia";

export interface AudioState {
    remote?: MediaStream;
    local?: MediaStream;
    error?: string;
}

export const useAudioStore = defineStore({
    id: 'audio-stream',
    state: (): AudioState => {
        return {
            remote: undefined,
            local: undefined,
            error: '',
        }
    },
    actions: {
        start: async function (): Promise<AudioState> {
            try {
                this.error = '';
                this.local = await navigator.mediaDevices.getUserMedia({audio: true});
                this.remote = new MediaStream();

                return { local: this.local, remote: this.remote };
            } catch (e: any) {
                this.error = e.message;
            }

            return { local: undefined, remote: undefined };
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
