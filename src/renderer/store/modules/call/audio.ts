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
        start: function () {
            const self = this;
            navigator.mediaDevices.getUserMedia({audio: true})
                .then(stream => self.local = stream)
                .catch(console.error)
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
