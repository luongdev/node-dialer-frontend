import {defineStore} from "pinia";

export interface AudioState {
    remote?: MediaStream;
    local?: MediaStream;
}

export const useAudioStore = defineStore({
    id: 'audio-stream',
    state: (): AudioState => {
        return {
            remote: undefined,
            local: undefined,
        }
    },
    actions: {
        start: async function (): Promise<MediaStream> {
            const stream = await navigator.mediaDevices.getUserMedia({audio: true});
            this.local = stream;
                
            return this.local;
        },
        play(remoteStream: MediaStream) {
            this.remote = remoteStream;

            const audioElm = new window.Audio()
            audioElm.srcObject = remoteStream
            audioElm.play().catch(console.error)
        },
        stop: function () {
            this.local?.getTracks().forEach((track: any) => track.stop())
            this.remote?.getTracks().forEach((track: any) => track.stop())
        }
    }
})
